/**
 * use-notifications.ts
 * ✅ Utilise @capacitor/local-notifications (natif Android)
 * ❌ N'utilise PAS l'API Web Notification ni le Service Worker
 *    (incompatibles avec une WebView Capacitor packagée Play Store)
 */

import { useState, useEffect } from 'react';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '@/contexts/LanguageContext';

const NOTIF_TIME_KEY  = 'notif_scheduled_time';
const DAILY_NOTIF_ID  = 1001;

export function useNotifications() {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { language, t } = useLanguage();

  // ── Init ───────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!Capacitor.isNativePlatform()) {
        // En mode web/dev : on simule "supporté mais pas natif"
        setIsSupported(false);
        console.warn('[Notifs] Mode web — LocalNotifications non disponible');
        return;
      }
      setIsSupported(true);
      const status: PermissionStatus = await LocalNotifications.checkPermissions();
      setPermission(mapPermission(status.display));

      // Re-planifier au démarrage si déjà accordé
      if (status.display === 'granted') {
        await scheduleDailyNotification();
      }
    };
    init();
  }, []);

  // ── Demander la permission ─────────────────────────────────────
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const status = await LocalNotifications.requestPermissions();
      const granted = status.display === 'granted';
      setPermission(mapPermission(status.display));

      if (granted) {
        await scheduleDailyNotification();
        // Notification de confirmation immédiate
        await showImmediateNotification(
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

  // ── Notification immédiate ─────────────────────────────────────
  const showImmediateNotification = async (title: string, body: string) => {
    if (!isSupported || permission !== 'granted') return;
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
  };

  // ── Planifier chaque jour ──────────────────────────────────────
  const scheduleDailyNotification = async (timeStr?: string) => {
    if (!isSupported) return;

    const savedTime = timeStr ?? localStorage.getItem(NOTIF_TIME_KEY) ?? '08:00';
    if (timeStr) localStorage.setItem(NOTIF_TIME_KEY, timeStr);

    const [hours, minutes] = savedTime.split(':').map(Number);
    const now  = new Date();
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    const title = language === 'fr' ? '🌟 Ta citation du jour' : '🌟 Your daily quote';
    const body  = language === 'fr'
      ? "Ta dose de motivation quotidienne t'attend !"
      : 'Your daily motivation awaits!';

    await cancelDailyNotification();

    await LocalNotifications.schedule({
      notifications: [{
        id:          DAILY_NOTIF_ID,
        title,
        body,
        smallIcon:   'ic_stat_notification',
        iconColor:   '#F43F5E',
        schedule: {
          at:      next,
          repeats: true,   // ✅ répétition native Android — aucun setTimeout
          every:   'day',
        },
        extra: { url: '/' },
      }],
    });

    console.log(`[Notifs] ✅ Planifiée à ${savedTime}, prochaine : ${next.toLocaleString()}`);
  };

  // ── Annuler ────────────────────────────────────────────────────
  const cancelDailyNotification = async () => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: DAILY_NOTIF_ID }] });
    } catch (_) {}
  };

  // ── Test visible immédiat ──────────────────────────────────────
  const testNotification = async () => {
    await showImmediateNotification(
      language === 'fr' ? '🌟 Test de notification' : '🌟 Notification test',
      language === 'fr' ? 'Vos notifications fonctionnent ! 🎉' : 'Your notifications work! 🎉'
    );
  };

  // ── Re-planifier si la langue change ──────────────────────────
  useEffect(() => {
    if (permission === 'granted' && isSupported) {
      scheduleDailyNotification();
    }
  }, [language]);

  return {
    permission,
    isSupported,
    requestPermission,
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