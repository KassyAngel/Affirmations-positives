/**
 * use-notifications.ts
 * ✅ Utilise @capacitor/local-notifications (natif Android)
 * ✅ Utilise @capacitor/preferences au lieu de localStorage
 *    → survit aux mises à jour de l'app
 * ✅ Gère la révocation de permission Android 13+ après mise à jour
 */

import { useState, useEffect } from 'react';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { useLanguage } from '@/contexts/LanguageContext';

// ✅ Clés Preferences (persistent, survit aux mises à jour)
const NOTIF_TIME_KEY    = 'notif_scheduled_time';
const BANNER_DISMISSED_KEY = 'notification_banner_dismissed';
const DAILY_NOTIF_ID    = 1001;

// ─── Helpers Preferences ─────────────────────────────────────────────────────
async function prefsGet(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
    // Fallback localStorage si Preferences indisponible (web)
    return localStorage.getItem(key);
  }
}

async function prefsSet(key: string, value: string): Promise<void> {
  try {
    await Preferences.set({ key, value });
  } catch {
    localStorage.setItem(key, value);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useNotifications() {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true); // true par défaut → pas de flash
  const { language } = useLanguage();

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!Capacitor.isNativePlatform()) {
        setIsSupported(false);
        console.warn('[Notifs] Mode web — LocalNotifications non disponible');
        return;
      }
      setIsSupported(true);

      // ✅ Lire l'état "dismissed" depuis Preferences (survit aux mises à jour)
      const dismissed = await prefsGet(BANNER_DISMISSED_KEY);
      setBannerDismissed(dismissed === 'true');

      try {
        const status: PermissionStatus = await LocalNotifications.checkPermissions();
        const mapped = mapPermission(status.display);
        setPermission(mapped);
        console.log('[Notifs] Permission au démarrage :', status.display);

        if (mapped === 'granted') {
          try {
            await scheduleDailyNotificationInternal(language);
            console.log('[Notifs] ✅ Re-planification au démarrage réussie');
          } catch (scheduleErr) {
            console.warn('[Notifs] ⚠️ Re-planification échouée :', scheduleErr);
            try {
              const recheck = await LocalNotifications.requestPermissions();
              const remapped = mapPermission(recheck.display);
              setPermission(remapped);
              if (remapped === 'granted') {
                await scheduleDailyNotificationInternal(language);
              }
            } catch (recheckErr) {
              console.error('[Notifs] Impossible de re-vérifier :', recheckErr);
              setPermission('default');
            }
          }
        }
      } catch (err) {
        console.error('[Notifs] Erreur init :', err);
        setIsSupported(false);
      }
    };
    init();
  }, []);

  // ── Demander la permission ────────────────────────────────────────────────
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const status = await LocalNotifications.requestPermissions();
      const granted = status.display === 'granted';
      setPermission(mapPermission(status.display));

      if (granted) {
        await scheduleDailyNotificationInternal(language);
        await scheduleImmediate(
          language === 'fr' ? '🌟 Notifications activées !' : '🌟 Notifications enabled!',
          language === 'fr'
            ? 'Tu recevras ta citation chaque matin à 8h 🎉'
            : 'You will receive your daily quote every morning at 8am 🎉'
        );
      }
      return granted;
    } catch (err) {
      console.error('[Notifs] requestPermissions error:', err);
      return false;
    }
  };

  // ── Marquer le banner comme dismissé (persistant) ────────────────────────
  const dismissBanner = async () => {
    setBannerDismissed(true);
    await prefsSet(BANNER_DISMISSED_KEY, 'true');
  };

  // ── Notification immédiate ────────────────────────────────────────────────
  const scheduleImmediate = async (title: string, body: string) => {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: 9999,
          title,
          body,
          smallIcon: 'ic_stat_notification',
          iconColor: '#F43F5E',
          schedule: { at: new Date(Date.now() + 1000) },
        }],
      });
    } catch (err) {
      console.warn('[Notifs] scheduleImmediate error:', err);
    }
  };

  // ── Planification quotidienne ─────────────────────────────────────────────
  const scheduleDailyNotificationInternal = async (lang: string, timeStr?: string) => {
    // ✅ Lire/écrire l'heure dans Preferences (pas localStorage)
    const savedTime = timeStr ?? (await prefsGet(NOTIF_TIME_KEY)) ?? '08:00';
    if (timeStr) await prefsSet(NOTIF_TIME_KEY, timeStr);

    const [hours, minutes] = savedTime.split(':').map(Number);
    const now  = new Date();
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    const title = lang === 'fr' ? '🌟 Ta citation du jour' : '🌟 Your daily quote';
    const body  = lang === 'fr'
      ? "Ta dose de motivation quotidienne t'attend !"
      : 'Your daily motivation awaits!';

    try {
      await LocalNotifications.cancel({ notifications: [{ id: DAILY_NOTIF_ID }] });
    } catch (_) {}

    await LocalNotifications.schedule({
      notifications: [{
        id:        DAILY_NOTIF_ID,
        title,
        body,
        smallIcon: 'ic_stat_notification',
        iconColor: '#F43F5E',
        schedule: {
          at:      next,
          repeats: true,
          every:   'day',
        },
        extra: { url: '/' },
      }],
    });

    console.log(`[Notifs] ✅ Planifiée à ${savedTime}, prochaine : ${next.toLocaleString()}`);
  };

  // ── API publique ──────────────────────────────────────────────────────────
  const scheduleDailyNotification = async (timeStr?: string) => {
    if (!isSupported) return;
    await scheduleDailyNotificationInternal(language, timeStr);
  };

  const cancelDailyNotification = async () => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: DAILY_NOTIF_ID }] });
    } catch (_) {}
  };

  const testNotification = async () => {
    await scheduleImmediate(
      language === 'fr' ? '🌟 Test de notification' : '🌟 Notification test',
      language === 'fr' ? 'Vos notifications fonctionnent ! 🎉' : 'Your notifications work! 🎉'
    );
  };

  const showImmediateNotification = async (title: string, body: string) => {
    await scheduleImmediate(title, body);
  };

  // ── Re-planifier si la langue change ─────────────────────────────────────
  useEffect(() => {
    if (permission === 'granted' && isSupported) {
      scheduleDailyNotificationInternal(language).catch(console.warn);
    }
  }, [language]);

  return {
    permission,
    isSupported,
    bannerDismissed,
    requestPermission,
    dismissBanner,
    testNotification,
    scheduleDailyNotification,
    cancelDailyNotification,
    showImmediateNotification,
  };
}

function mapPermission(display: string): 'granted' | 'denied' | 'default' {
  if (display === 'granted') return 'granted';
  if (display === 'denied')  return 'denied';
  return 'default';
}