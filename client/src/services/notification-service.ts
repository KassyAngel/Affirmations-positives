import { getRandomMessage } from './positive-messages';
import type { Quote } from '@shared/schema';

const isCapacitor = () => typeof (window as any).Capacitor !== 'undefined';

export interface NotificationSettings {
  enabled: boolean;
  frequency: number;
  startTime: string;
  endTime: string;
}

interface NotificationContent {
  title: string;
  body: string;
}

const SETTINGS_KEY          = 'notification_settings';
const LAST_NOTIFICATION_KEY = 'last_notification_time';
const CURRENT_QUOTE_KEY     = 'current_widget_quote';

const FALLBACK_FR = [
  'Vous êtes plus fort(e) que vous ne le pensez.',
  'Chaque jour est une nouvelle opportunité de grandir.',
  'Vous méritez tout le bonheur du monde.',
  'Votre potentiel est illimité.',
  'Croyez en vous, vous pouvez tout accomplir.',
  'La persévérance est la clé du succès.',
  'Vous avez la force d\'affronter n\'importe quel défi.',
  'Chaque petit pas vous rapproche de vos rêves.',
  'Votre valeur ne dépend pas de l\'opinion des autres.',
  'Aujourd\'hui est le meilleur jour pour commencer.',
  'Vous êtes capable de choses extraordinaires.',
  'La confiance en soi se construit jour après jour.',
];

const FALLBACK_EN = [
  'You are stronger than you think.',
  'Every day is a new opportunity to grow.',
  'You deserve all the happiness in the world.',
  'Your potential is unlimited.',
  'Believe in yourself, you can achieve anything.',
  'Perseverance is the key to success.',
  'You have the strength to face any challenge.',
  'Every small step brings you closer to your dreams.',
  'Your worth doesn\'t depend on others\' opinions.',
  'Today is the best day to start.',
  'You are capable of extraordinary things.',
  'Self-confidence is built day by day.',
];

function getFallbackContent(language: 'fr' | 'en'): NotificationContent {
  const pool = language === 'fr' ? FALLBACK_FR : FALLBACK_EN;
  const body = pool[Math.floor(Math.random() * pool.length)];
  return {
    title: language === 'fr' ? '💪 Affirmation du jour' : '💪 Affirmation of the day',
    body,
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private intervalId: number | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  saveSettings(settings: NotificationSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  getSettings(): NotificationSettings | null {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getCurrentQuote(): NotificationContent | null {
    const body = localStorage.getItem(CURRENT_QUOTE_KEY);
    if (!body) return null;
    return { title: '', body };
  }

  private saveCurrentQuote(content: NotificationContent) {
    localStorage.setItem(CURRENT_QUOTE_KEY, content.body);
  }

  private toMin(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  private isInTimeRange(startTime: string, endTime: string): boolean {
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    return cur >= this.toMin(startTime) && cur <= this.toMin(endTime);
  }

  // ✅ Génère le contenu en utilisant d'abord les fallbacks locaux
  // L'API n'est appelée qu'une seule fois si besoin (pas en parallèle)
  private async getRandomContent(language: 'fr' | 'en'): Promise<NotificationContent> {
    // ✅ 70% du temps on utilise les messages locaux — zéro réseau, zéro lag
    if (Math.random() > 0.3) {
      try { return getRandomMessage(language); }
      catch { return getFallbackContent(language); }
    }

    // 30% du temps on tente l'API avec timeout court
    try {
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('/api/quotes', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const quotes: Quote[] = await res.json();
        if (quotes.length > 0) {
          const q = quotes[Math.floor(Math.random() * quotes.length)];
          return {
            title: language === 'fr' ? '💭 Citation du jour' : '💭 Quote of the day',
            body: language === 'en' && q.contentEn
              ? `"${q.contentEn}" — ${q.author}`
              : `"${q.content}" — ${q.author}`,
          };
        }
      }
    } catch { /* fallback silencieux */ }

    try { return getRandomMessage(language); }
    catch { return getFallbackContent(language); }
  }

  async requestPermission(): Promise<boolean> {
    if (isCapacitor()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
      } catch (e) {
        console.error('Capacitor LocalNotifications non disponible:', e);
        return false;
      }
    } else {
      if (!('Notification' in window)) return false;
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  }

  private async sendNotification(language: 'fr' | 'en' = 'fr') {
    const content = await this.getRandomContent(language);
    this.saveCurrentQuote(content);
    localStorage.setItem(LAST_NOTIFICATION_KEY, Date.now().toString());

    if (isCapacitor()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.schedule({
          notifications: [{
            id:        Math.floor(Math.random() * 100000),
            title:     content.title,
            body:      content.body,
            schedule:  { at: new Date(Date.now() + 1000) },
            sound:     'default',
            smallIcon: 'ic_stat_notification',
            iconColor: '#F43F5E',
            extra:     { quote: content.body },
          }],
        });
      } catch (e) {
        console.error('Erreur notification Capacitor:', e);
      }
    } else {
      if (Notification.permission !== 'granted') return;
      const notif = new Notification(content.title, {
        body: content.body,
        icon: '/icon-192.png',
        tag:  'daily-motivation',
      });
      setTimeout(() => notif.close(), 5000);
    }
  }

  // ✅ OPTIMISÉ — génère les contenus séquentiellement (pas en parallèle)
  // pour éviter de saturer le réseau sur vieux téléphones
  private async scheduleAllNotificationsForToday(
    settings: NotificationSettings,
    language: 'fr' | 'en'
  ) {
    if (!isCapacitor()) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      // Annule les notifications existantes
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      const startMin = this.toMin(settings.startTime);
      const endMin   = this.toMin(settings.endTime);
      if (settings.frequency <= 0 || endMin <= startMin) return;

      const interval = Math.floor((endMin - startMin) / settings.frequency);
      const now      = new Date();
      const notifications = [];

      // ✅ Génère les contenus UN PAR UN pour ne pas surcharger
      for (let i = 0; i < settings.frequency; i++) {
        const targetMin  = startMin + i * interval;
        const targetDate = new Date();
        // ✅ Fuseau horaire local automatique via setHours
        targetDate.setHours(Math.floor(targetMin / 60), targetMin % 60, 0, 0);

        if (targetDate <= now) continue; // heure passée aujourd'hui → skip

        // ✅ Génération séquentielle — on attend chaque contenu avant le suivant
        const content = await this.getRandomContent(language);

        notifications.push({
          id:        1000 + i,
          title:     content.title,
          body:      content.body,
          schedule:  { at: targetDate },
          sound:     'default',
          smallIcon: 'ic_stat_notification',
          iconColor: '#F43F5E',
          extra:     { quote: content.body },
        });

        // Sauvegarde la première comme citation du widget
        if (i === 0) {
          this.saveCurrentQuote({ title: content.title, body: content.body });
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`✅ ${notifications.length} notifications planifiées (fuseau local)`);
      } else {
        console.log('ℹ️ Toutes les heures du jour sont passées — planification pour demain au prochain démarrage');
      }

    } catch (e) {
      console.error('Erreur planification:', e);
    }
  }

  async start(language: 'fr' | 'en' = 'fr') {
    const settings = this.getSettings();
    if (!settings?.enabled || settings.frequency === 0) return;

    if (isCapacitor()) {
      // ✅ Planifie au démarrage
      await this.scheduleAllNotificationsForToday(settings, language);

      // ✅ Replanifie chaque jour à minuit SI l'app est ouverte
      // (si l'app est fermée, la replanification se fait au prochain démarrage)
      this.stop();
      const now             = new Date();
      const midnight        = new Date();
      midnight.setHours(24, 0, 10, 0); // minuit + 10s de marge
      const msUntilMidnight = midnight.getTime() - now.getTime();

      const midnightTimer = window.setTimeout(() => {
        this.scheduleAllNotificationsForToday(settings, language);
        // Replanifie toutes les 24h si l'app reste ouverte
        this.intervalId = window.setInterval(() => {
          this.scheduleAllNotificationsForToday(settings, language);
        }, 24 * 60 * 60 * 1000);
      }, msUntilMidnight);

      // Stocke le timer minuit pour pouvoir l'annuler
      (this as any)._midnightTimer = midnightTimer;

    } else {
      // Mode web/dev — polling toutes les minutes
      this.stop();
      const intervalMinutes = Math.max(
        1,
        Math.floor((this.toMin(settings.endTime) - this.toMin(settings.startTime)) / settings.frequency)
      );
      this.intervalId = window.setInterval(() => {
        if (this.isInTimeRange(settings.startTime, settings.endTime)) {
          const last    = localStorage.getItem(LAST_NOTIFICATION_KEY);
          const elapsed = last ? Date.now() - parseInt(last) : Infinity;
          if (elapsed >= intervalMinutes * 60 * 1000) {
            this.sendNotification(language);
          }
        }
      }, 60_000);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if ((this as any)._midnightTimer) {
      clearTimeout((this as any)._midnightTimer);
      (this as any)._midnightTimer = null;
    }
  }

  async testNotification(language: 'fr' | 'en' = 'fr') {
    await this.sendNotification(language);
    return true;
  }

  async debugPendingNotifications() {
    if (!isCapacitor()) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const pending = await LocalNotifications.getPending();
      console.log(`📋 ${pending.notifications.length} notifications en attente:`);
      pending.notifications.forEach(n => {
        console.log(`  #${n.id}: "${n.title}" — ${n.schedule?.at}`);
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export const notificationService = NotificationService.getInstance();