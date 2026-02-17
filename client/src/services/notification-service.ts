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

  // ── Contenu aléatoire : 50% citation BDD / 50% message positif ──────────────
  private async getRandomContent(language: 'fr' | 'en'): Promise<NotificationContent> {
    if (Math.random() > 0.5) {
      try {
        const res = await fetch('/api/quotes');
        const quotes: Quote[] = await res.json();
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        return {
          title: language === 'fr' ? '💭 Citation du jour' : '💭 Quote of the day',
          body: language === 'en' && q.contentEn
            ? `"${q.contentEn}" — ${q.author}`
            : `"${q.content}" — ${q.author}`,
        };
      } catch {
        // fallback → message positif
      }
    }
    return getRandomMessage(language);
  }

  // ── Demander la permission ───────────────────────────────────────────────────
  async requestPermission(): Promise<boolean> {
    if (isCapacitor()) {
      // ── Android natif via Capacitor ──
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
      } catch (e) {
        console.error('Capacitor LocalNotifications non disponible:', e);
        return false;
      }
    } else {
      // ── Web (browser) ──
      if (!('Notification' in window)) return false;
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  }

  // ── Envoi d'une notification ─────────────────────────────────────────────────
  private async sendNotification(language: 'fr' | 'en' = 'fr') {
    const content = await this.getRandomContent(language);

    // Sauvegarde pour le widget
    this.saveCurrentQuote(content);
    localStorage.setItem(LAST_NOTIFICATION_KEY, Date.now().toString());

    if (isCapacitor()) {
      // ── Android natif : notification qui reste dans le tiroir ──
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.schedule({
          notifications: [{
            id: Math.floor(Math.random() * 100000),
            title: content.title,
            body: content.body,
            schedule: { at: new Date(Date.now() + 1000) }, // dans 1 seconde
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
      // ── Web browser ──
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
  // C'est ce qui permet aux notifications d'arriver même app fermée !
  private async scheduleAllNotificationsForToday(
    settings: NotificationSettings,
    language: 'fr' | 'en'
  ) {
    if (!isCapacitor()) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      // Annuler les anciennes
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      const startMin = toMin(settings.startTime);
      const endMin   = toMin(settings.endTime);
      const interval = Math.floor((endMin - startMin) / settings.frequency);

      const now = new Date();
      const notifications = [];

      for (let i = 0; i < settings.frequency; i++) {
        const targetMin = startMin + i * interval;
        const targetDate = new Date();
        targetDate.setHours(Math.floor(targetMin / 60), targetMin % 60, 0, 0);

        // Ne planifier que dans le futur
        if (targetDate > now) {
          const content = await this.getRandomContent(language);
          notifications.push({
            id: 1000 + i,
            title: content.title,
            body: content.body,
            schedule: { at: targetDate },
            sound: 'default',
            smallIcon: 'ic_stat_notification',
            iconColor: '#F43F5E',
          });
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`✅ ${notifications.length} notifications planifiées pour aujourd'hui`);
      }
    } catch (e) {
      console.error('Erreur planification Capacitor:', e);
    }
  }

  // ── Démarrer le service ──────────────────────────────────────────────────────
  async start(language: 'fr' | 'en' = 'fr') {
    const settings = this.getSettings();
    if (!settings?.enabled || settings.frequency === 0) {
      console.log('❌ Notifications désactivées');
      return;
    }

    if (isCapacitor()) {
      // Android : planifier toutes les notifications en une fois
      // → Elles arrivent même si l'app est fermée !
      await this.scheduleAllNotificationsForToday(settings, language);

      // Replanifier chaque jour à minuit
      this.stop();
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const msUntilMidnight = midnight.getTime() - now.getTime();

      setTimeout(() => {
        this.scheduleAllNotificationsForToday(settings, language);
        // Répéter toutes les 24h
        this.intervalId = window.setInterval(() => {
          this.scheduleAllNotificationsForToday(settings, language);
        }, 24 * 60 * 60 * 1000);
      }, msUntilMidnight);

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
      console.log('📱 Service arrêté');
    }
  }

  // ── Test immédiat ─────────────────────────────────────────────────────────────
  async testNotification(language: 'fr' | 'en' = 'fr') {
    await this.sendNotification(language);
    console.log('🧪 Notification de test envoyée');
    return true;
  }
}

export const notificationService = NotificationService.getInstance();