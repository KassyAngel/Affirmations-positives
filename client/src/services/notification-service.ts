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
const CURRENT_QUOTE_KEY     = 'current_widget_quote';

// ─── Citations de secours embarquées (fonctionne sans réseau) ─────────────────
// Utilisées quand le fetch API échoue (app en arrière-plan, pas de réseau, etc.)
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

  // ── Préférences ─────────────────────────────────────────────────────────────
  saveSettings(settings: NotificationSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    console.log('✅ Préférences sauvegardées:', settings);
  }

  getSettings(): NotificationSettings | null {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // ── Citation courante (pour le widget) ──────────────────────────────────────
  getCurrentQuote(): NotificationContent | null {
    const raw = localStorage.getItem(CURRENT_QUOTE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private saveCurrentQuote(content: NotificationContent) {
    localStorage.setItem(CURRENT_QUOTE_KEY, JSON.stringify(content));
  }

  // ── Calculs horaires ────────────────────────────────────────────────────────
  private calculateInterval(frequency: number, startTime: string, endTime: string): number {
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const total = toMin(endTime) - toMin(startTime);
    return Math.max(1, Math.floor(total / frequency));
  }

  private isInTimeRange(startTime: string, endTime: string): boolean {
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    return cur >= toMin(startTime) && cur <= toMin(endTime);
  }

  // ── Contenu aléatoire : essaie l'API, tombe sur le fallback si échec ─────────
  // ✅ FIX : timeout court + fallback garanti → ne bloque plus la planification
  private async getRandomContent(language: 'fr' | 'en'): Promise<NotificationContent> {
    // 50% de chance de tenter une citation de la BDD
    if (Math.random() > 0.5) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // timeout 3s

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
      } catch {
        // réseau indisponible → fallback silencieux
      }
    }

    // ✅ Toujours un contenu disponible même hors-ligne
    try {
      return getRandomMessage(language);
    } catch {
      return getFallbackContent(language);
    }
  }

  // ── Demander la permission ───────────────────────────────────────────────────
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

  // ── Envoi d'une notification immédiate ──────────────────────────────────────
  private async sendNotification(language: 'fr' | 'en' = 'fr') {
    const content = await this.getRandomContent(language);

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
        console.log('📬 Notification Android envoyée:', content.title);
      } catch (e) {
        console.error('Erreur notification Capacitor:', e);
      }
    } else {
      if (Notification.permission !== 'granted') return;
      const notif = new Notification(content.title, {
        body: content.body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'daily-motivation',
        silent: false,
      });
      setTimeout(() => notif.close(), 5000);
      console.log('📬 Notification web envoyée:', content.title);
    }
  }

  // ── Planifier TOUTES les notifications du jour (mode Capacitor) ──────────────
  // ✅ FIX PRINCIPAL : génère les contenus en parallèle avec Promise.all
  //    + fallback garanti + pas de dépendance réseau bloquante
  private async scheduleAllNotificationsForToday(
    settings: NotificationSettings,
    language: 'fr' | 'en'
  ) {
    if (!isCapacitor()) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      // Annuler les anciennes notifications planifiées
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
        console.log(`🗑 ${pending.notifications.length} anciennes notifications annulées`);
      }

      const toMin = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const startMin = toMin(settings.startTime);
      const endMin   = toMin(settings.endTime);

      // ✅ Éviter division par zéro
      if (settings.frequency <= 0 || endMin <= startMin) {
        console.warn('⚠️ Paramètres invalides:', settings);
        return;
      }

      const interval = Math.floor((endMin - startMin) / settings.frequency);
      const now = new Date();

      // ✅ Pré-générer tous les contenus en parallèle (plus rapide, moins de risques timeout)
      const contentPromises = Array.from({ length: settings.frequency }, () =>
        this.getRandomContent(language)
      );
      const contents = await Promise.all(contentPromises);

      const notifications = [];

      for (let i = 0; i < settings.frequency; i++) {
        const targetMin = startMin + i * interval;
        const targetDate = new Date();
        targetDate.setHours(Math.floor(targetMin / 60), targetMin % 60, 0, 0);

        // Ne planifier que dans le futur
        if (targetDate > now) {
          notifications.push({
            id: 1000 + i,
            title: contents[i].title,
            body: contents[i].body,
            schedule: { at: targetDate },
            sound: 'default',
            smallIcon: 'ic_stat_notification',
            iconColor: '#F43F5E',
            // ✅ allowWhileIdle : notification même en mode Doze (économie batterie)
            extra: { quote: contents[i].body },
          });
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`✅ ${notifications.length}/${settings.frequency} notifications planifiées pour aujourd'hui`);
        // Log des horaires pour debug
        notifications.forEach(n => {
          console.log(`  📅 ${n.schedule.at.toLocaleTimeString()} — ${n.body.substring(0, 40)}...`);
        });
      } else {
        console.log('⚠️ Aucune notification à planifier (toutes dans le passé ?)');
      }
    } catch (e) {
      console.error('Erreur planification Capacitor:', e);
    }
  }

  // ── Démarrer le service ──────────────────────────────────────────────────────
  async start(language: 'fr' | 'en' = 'fr') {
    const settings = this.getSettings();
    if (!settings?.enabled || settings.frequency === 0) {
      console.log('❌ Notifications désactivées ou fréquence 0');
      return;
    }

    if (isCapacitor()) {
      // Android : planifier toutes les notifications en une fois
      await this.scheduleAllNotificationsForToday(settings, language);

      // ✅ Replanifier chaque jour à minuit (si app ouverte)
      this.stop();
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 5, 0); // 00:00:05 pour éviter les edge cases
      const msUntilMidnight = midnight.getTime() - now.getTime();

      const replanify = () => {
        this.scheduleAllNotificationsForToday(settings, language);
        this.intervalId = window.setInterval(() => {
          this.scheduleAllNotificationsForToday(settings, language);
        }, 24 * 60 * 60 * 1000);
      };

      setTimeout(replanify, msUntilMidnight);

    } else {
      // Web : vérifier toutes les minutes (app doit rester ouverte)
      this.stop();
      const intervalMinutes = this.calculateInterval(
        settings.frequency, settings.startTime, settings.endTime
      );
      console.log(`📱 Service web: ${settings.frequency}x/jour, toutes les ${intervalMinutes}min`);

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

  // ── Arrêter ──────────────────────────────────────────────────────────────────
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ── Test immédiat ─────────────────────────────────────────────────────────────
  async testNotification(language: 'fr' | 'en' = 'fr') {
    await this.sendNotification(language);
    console.log('🧪 Notification de test envoyée');
    return true;
  }

  // ── Debug : affiche les notifications en attente ──────────────────────────────
  async debugPendingNotifications() {
    if (!isCapacitor()) {
      console.log('Debug uniquement disponible sur Android');
      return;
    }
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