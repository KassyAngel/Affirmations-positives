/**
 * notification-service.ts
 *
 * ✅ Système UNIQUE de planification — use-notifications.ts ne planifie plus rien
 * ✅ Planifie 7 jours à l'avance → l'utilisateur reçoit ses notifs même sans ouvrir l'app
 * ✅ Annule + re-planifie à chaque appel de start() pour toujours être à jour
 * ✅ Les contenus viennent de positive-messages.ts (local, zéro réseau)
 * ✅ Compatible Android (Capacitor LocalNotifications)
 */

import { getRandomMessage } from './positive-messages';
import type { Quote } from '@shared/schema';

const isCapacitor = () =>
  typeof (window as any).Capacitor !== 'undefined' &&
  (window as any).Capacitor.isNativePlatform?.();

export interface NotificationSettings {
  enabled: boolean;
  frequency: number;   // nombre de notifs par jour (1–20)
  startTime: string;   // "HH:MM"
  endTime: string;     // "HH:MM"
}

interface NotificationContent {
  title: string;
  body: string;
}

// ── Clés storage ──────────────────────────────────────────────────────────────
const SETTINGS_KEY      = 'notification_settings';
const CURRENT_QUOTE_KEY = 'current_widget_quote';

// ── Jours à planifier à l'avance ─────────────────────────────────────────────
const DAYS_AHEAD = 7;

// ── ID de base (on numérote : jour * 100 + slot, max 7*20 = 140 IDs) ─────────
const BASE_ID = 2000;

// ── Fallback content ──────────────────────────────────────────────────────────
const FALLBACK_FR = [
  'Vous êtes plus fort(e) que vous ne le pensez.',
  'Chaque jour est une nouvelle opportunité de grandir.',
  'Vous méritez tout le bonheur du monde.',
  'Votre potentiel est illimité.',
  'Croyez en vous, vous pouvez tout accomplir.',
  'La persévérance est la clé du succès.',
  'Vous avez la force d\'affronter n\'importe quel défi.',
  'Chaque petit pas vous rapproche de vos rêves.',
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
];

function getFallbackContent(language: 'fr' | 'en'): NotificationContent {
  const pool = language === 'fr' ? FALLBACK_FR : FALLBACK_EN;
  return {
    title: language === 'fr' ? '💪 Affirmation du jour' : '💪 Affirmation of the day',
    body:  pool[Math.floor(Math.random() * pool.length)],
  };
}

function getContent(language: 'fr' | 'en'): NotificationContent {
  try {
    return getRandomMessage(language);
  } catch {
    return getFallbackContent(language);
  }
}

// ── Convertit "HH:MM" en minutes depuis minuit ────────────────────────────────
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// ── Génère les horaires de notifs pour un jour donné ─────────────────────────
// Retourne un tableau de Date
function buildSlotsForDay(
  dayOffset: number,        // 0 = aujourd'hui, 1 = demain, etc.
  settings: NotificationSettings,
): Date[] {
  const { frequency, startTime, endTime } = settings;
  if (frequency <= 0) return [];

  const startMin = toMinutes(startTime);
  const endMin   = toMinutes(endTime);
  if (endMin <= startMin) return [];

  // Intervalle entre chaque notif (en minutes)
  const totalRange = endMin - startMin;
  const interval   = frequency === 1 ? 0 : Math.floor(totalRange / (frequency - 1));

  const now    = new Date();
  const slots: Date[] = [];

  for (let i = 0; i < frequency; i++) {
    const minuteOfDay = startMin + (frequency === 1 ? Math.floor(totalRange / 2) : i * interval);
    const slot        = new Date();
    slot.setDate(slot.getDate() + dayOffset);
    slot.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0);

    // Pour aujourd'hui (dayOffset=0), ne planifier que les heures futures
    if (dayOffset === 0 && slot <= now) continue;

    slots.push(slot);
  }

  return slots;
}

// ─────────────────────────────────────────────────────────────────────────────

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ── Paramètres ──────────────────────────────────────────────────────────────

  saveSettings(settings: NotificationSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  getSettings(): NotificationSettings | null {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // ── Widget quote ────────────────────────────────────────────────────────────

  getCurrentQuote(): NotificationContent | null {
    const body = localStorage.getItem(CURRENT_QUOTE_KEY);
    return body ? { title: '', body } : null;
  }

  private saveCurrentQuote(content: NotificationContent): void {
    localStorage.setItem(CURRENT_QUOTE_KEY, content.body);
  }

  // ── Permission ──────────────────────────────────────────────────────────────

  async requestPermission(): Promise<boolean> {
    if (isCapacitor()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
      } catch (e) {
        console.error('[Notifs] requestPermissions error:', e);
        return false;
      }
    }
    if (!('Notification' in window)) return false;
    return (await Notification.requestPermission()) === 'granted';
  }

  // ── Démarrage principal ─────────────────────────────────────────────────────
  // Appelé depuis App.tsx au démarrage et depuis SettingsMenu après modification

  async start(language: 'fr' | 'en' = 'fr'): Promise<void> {
    const settings = this.getSettings();
    if (!settings?.enabled || settings.frequency === 0) {
      console.log('[Notifs] Désactivé ou frequency=0 — aucune planification');
      return;
    }

    if (isCapacitor()) {
      await this.scheduleWeekAhead(settings, language);
    } else {
      // Mode web — pas de planification (uniquement natif Android)
      console.log('[Notifs] Mode web — planification native non disponible');
    }
  }

  stop(): void {
    // Rien à stopper — les notifs sont planifiées de façon native
    // On annule tout si appelé explicitement
    this.cancelAll().catch(console.warn);
  }

  // ── Planification 7 jours ───────────────────────────────────────────────────

  private async scheduleWeekAhead(
    settings: NotificationSettings,
    language: 'fr' | 'en',
  ): Promise<void> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      // 1. Annuler toutes les notifs existantes planifiées par ce service
      await this.cancelAll();

      // 2. Construire toutes les notifs pour les 7 prochains jours
      const notifications: any[] = [];
      let globalIdx = 0;

      for (let day = 0; day < DAYS_AHEAD; day++) {
        const slots = buildSlotsForDay(day, settings);

        for (const slot of slots) {
          const content = getContent(language);

          // Sauvegarde la toute première citation pour le widget
          if (globalIdx === 0) {
            this.saveCurrentQuote(content);
          }

          notifications.push({
            id:        BASE_ID + globalIdx,
            title:     content.title,
            body:      content.body,
            schedule:  { at: slot },
            sound:     'default',
            smallIcon: 'ic_stat_notification',
            iconColor: '#F43F5E',
            extra:     { quote: content.body },
          });

          globalIdx++;
        }
      }

      if (notifications.length === 0) {
        console.log('[Notifs] Aucun créneau disponible (toutes les heures sont passées ?)');
        return;
      }

      // Android limite à ~500 notifs en attente — on est largement en dessous (max 140)
      await LocalNotifications.schedule({ notifications });

      console.log(
        `[Notifs] ✅ ${notifications.length} notifications planifiées` +
        ` sur ${DAYS_AHEAD} jours (${settings.frequency}/jour` +
        ` de ${settings.startTime} à ${settings.endTime})`
      );

    } catch (e) {
      console.error('[Notifs] Erreur scheduleWeekAhead:', e);
    }
  }

  // ── Annulation ──────────────────────────────────────────────────────────────

  private async cancelAll(): Promise<void> {
    if (!isCapacitor()) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
        console.log(`[Notifs] ${pending.notifications.length} notifs annulées`);
      }
    } catch (e) {
      console.warn('[Notifs] cancelAll error:', e);
    }
  }

  // ── Notification de test immédiate ──────────────────────────────────────────

  async testNotification(language: 'fr' | 'en' = 'fr'): Promise<boolean> {
    const content = getContent(language);

    if (isCapacitor()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.schedule({
          notifications: [{
            id:        BASE_ID + 999,
            title:     content.title,
            body:      content.body,
            schedule:  { at: new Date(Date.now() + 1500) },
            sound:     'default',
            smallIcon: 'ic_stat_notification',
            iconColor: '#F43F5E',
          }],
        });
      } catch (e) {
        console.error('[Notifs] testNotification error:', e);
        return false;
      }
    } else {
      if (Notification.permission !== 'granted') return false;
      const notif = new Notification(content.title, { body: content.body, icon: '/icon-192.png' });
      setTimeout(() => notif.close(), 5000);
    }
    return true;
  }

  // ── Debug ───────────────────────────────────────────────────────────────────

  async debugPendingNotifications(): Promise<void> {
    if (!isCapacitor()) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const pending = await LocalNotifications.getPending();
      console.log(`📋 ${pending.notifications.length} notifications en attente:`);
      pending.notifications
        .sort((a, b) => new Date(a.schedule?.at ?? 0).getTime() - new Date(b.schedule?.at ?? 0).getTime())
        .forEach(n => {
          const date = n.schedule?.at ? new Date(n.schedule.at).toLocaleString() : '?';
          console.log(`  #${n.id}: "${n.body?.slice(0, 40)}..." — ${date}`);
        });
    } catch (e) {
      console.error('[Notifs] debugPendingNotifications:', e);
    }
  }
}

export const notificationService = NotificationService.getInstance();