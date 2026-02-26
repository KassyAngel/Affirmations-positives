import { getRandomMessage } from './positive-messages';
import type { Quote } from '@shared/schema';

// ─── Détection plateforme ─────────────────────────────────────────────────────
const isCapacitor = () => typeof (window as any).Capacitor !== 'undefined';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NotificationSettings {
  enabled: boolean;
  frequency: number;   // 0–20 par jour
  startTime: string;   // "09:00"
  endTime: string;     // "22:00"
}

interface NotificationContent {
  title: string;
  body: string;
}

// ─── Clés localStorage ────────────────────────────────────────────────────────
const SETTINGS_KEY          = 'notification_settings';
const LAST_NOTIFICATION_KEY = 'last_notification_time';

// ✅ Le widget Java lit cette clé dans CapacitorStorage.
// On stocke UNIQUEMENT le texte brut (pas un objet JSON)
// pour éviter le double-encodage Capacitor.
const CURRENT_QUOTE_KEY = 'current_widget_quote';

// ─── Citations de secours ─────────────────────────────────────────────────────
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

// ─── Service ──────────────────────────────────────────────────────────────────
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

  // ── Préférences ──────────────────────────────────────────────────────────────
  saveSettings(settings: NotificationSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  getSettings(): NotificationSettings | null {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // ── Citation courante pour le widget ─────────────────────────────────────────
  // Retourne l'objet complet pour l'usage interne React
  getCurrentQuote(): NotificationContent | null {
    const body = localStorage.getItem(CURRENT_QUOTE_KEY);
    if (!body) return null;
    // On stocke le body brut, on reconstruit l'objet ici
    return { title: '', body };
  }

  // ✅ FIX WIDGET : stocker UNIQUEMENT le texte brut.
  // Capacitor encapsule localStorage dans CapacitorStorage en ajoutant
  // des guillemets JSON autour de la valeur — si on stocke déjà du JSON,
  // le widget reçoit une chaîne double-encodée que JSONObject ne parse pas.
  // En stockant le texte directement, le widget lit juste une string simple.
  private saveCurrentQuote(content: NotificationContent) {
    localStorage.setItem(CURRENT_QUOTE_KEY, content.body);
  }

  // ── Calculs horaires ─────────────────────────────────────────────────────────
  private calculateInterval(frequency: number, startTime: string, endTime: string): number {
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const total = toMin(endTime) - toMin(startTime);
    return Math.max(1, Math.floor(total / frequency));
  }

  private isInTimeRange(startTime: string, endTime: string): boolean {
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    return cur >= toMin(startTime) && cur <= toMin(endTime);
  }

  // ── Contenu aléatoire ────────────────────────────────────────────────────────
  private async getRandomContent(language: 'fr' | 'en'): Promise<NotificationContent> {
    if (Math.random() > 0.5) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
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
    }

    try { return getRandomMessage(language); }
    catch { return getFallbackContent(language); }
  }

  // ── Permission ───────────────────────────────────────────────────────────────
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

  // ── Envoi d'une notification ─────────────────────────────────────────────────
  private async sendNotification(language: 'fr' | 'en' = 'fr') {
    const content = await this.getRandomContent(language);

    // ✅ Sauvegarde le texte brut pour le widget
    this.saveCurrentQuote(content);
    localStorage.setItem(LAST_NOTIFICATION_KEY, Date.now().toString());

    if (isCapacitor()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.schedule({
          notifications: [{
            id: Math.floor(Math.random() * 100000),
            title: content.title,
            body: content.body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            smallIcon: 'ic_stat_notification',
            iconColor: '#F43F5E',
            extra: { quote: content.body },
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
        tag: 'daily-motivation',
      });
      setTimeout(() => notif.close(), 5000);
    }
  }

  // ── Planifier toutes les notifications du jour ───────────────────────────────
  private async scheduleAllNotificationsForToday(
    settings: NotificationSettings,
    language: 'fr' | 'en'
  ) {
    if (!isCapacitor()) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      const startMin = toMin(settings.startTime);
      const endMin   = toMin(settings.endTime);

      if (settings.frequency <= 0 || endMin <= startMin) return;

      const interval = Math.floor((endMin - startMin) / settings.frequency);
      const now = new Date();

      const contents = await Promise.all(
        Array.from({ length: settings.frequency }, () => this.getRandomContent(language))
      );

      const notifications = [];
      for (let i = 0; i < settings.frequency; i++) {
        const targetMin = startMin + i * interval;
        const targetDate = new Date();
        targetDate.setHours(Math.floor(targetMin / 60), targetMin % 60, 0, 0);

        if (targetDate > now) {
          notifications.push({
            id: 1000 + i,
            title: contents[i].title,
            body: contents[i].body,
            schedule: { at: targetDate },
            sound: 'default',
            smallIcon: 'ic_stat_notification',
            iconColor: '#F43F5E',
            extra: { quote: contents[i].body },
          });
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });

        // ✅ Sauvegarder la première notification du jour comme quote du widget
        this.saveCurrentQuote({ title: notifications[0].title, body: notifications[0].body });

        console.log(`✅ ${notifications.length} notifications planifiées`);
      }
    } catch (e) {
      console.error('Erreur planification:', e);
    }
  }

  // ── Démarrer ─────────────────────────────────────────────────────────────────
  async start(language: 'fr' | 'en' = 'fr') {
    const settings = this.getSettings();
    if (!settings?.enabled || settings.frequency === 0) return;

    if (isCapacitor()) {
      await this.scheduleAllNotificationsForToday(settings, language);

      this.stop();
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 5, 0);
      const msUntilMidnight = midnight.getTime() - now.getTime();

      setTimeout(() => {
        this.scheduleAllNotificationsForToday(settings, language);
        this.intervalId = window.setInterval(() => {
          this.scheduleAllNotificationsForToday(settings, language);
        }, 24 * 60 * 60 * 1000);
      }, msUntilMidnight);

    } else {
      this.stop();
      const intervalMinutes = this.calculateInterval(
        settings.frequency, settings.startTime, settings.endTime
      );
      this.intervalId = window.setInterval(() => {
        if (this.isInTimeRange(settings.startTime, settings.endTime)) {
          const last = localStorage.getItem(LAST_NOTIFICATION_KEY);
          const elapsed = last ? Date.now() - parseInt(last) : Infinity;
          if (elapsed >= intervalMinutes * 60 * 1000) {
            this.sendNotification(language);
          }
        }
      }, 60_000);
    }
  }

  // ── Arrêter ───────────────────────────────────────────────────────────────────
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ── Test ──────────────────────────────────────────────────────────────────────
  async testNotification(language: 'fr' | 'en' = 'fr') {
    await this.sendNotification(language);
    return true;
  }

  // ── Debug ─────────────────────────────────────────────────────────────────────
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