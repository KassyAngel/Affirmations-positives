/**
 * use-notifications.ts
 * ✅ Utilise @capacitor/local-notifications (natif Android)
 * ✅ Gère la révocation de permission Android 13+ après mise à jour
 */

import { useState, useEffect } from 'react';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '@/contexts/LanguageContext';

const NOTIF_TIME_KEY = 'notif_scheduled_time';
const DAILY_NOTIF_ID = 1001;

export function useNotifications() {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { language } = useLanguage();

  // ── Init ───────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!Capacitor.isNativePlatform()) {
        setIsSupported(false);
        console.warn('[Notifs] Mode web — LocalNotifications non disponible');
        return;
      }
      setIsSupported(true);

      try {
        const status: PermissionStatus = await LocalNotifications.checkPermissions();
        const mapped = mapPermission(status.display);
        setPermission(mapped);
        console.log('[Notifs] Permission au démarrage :', status.display);

        if (mapped === 'granted') {
          // ✅ Re-planifier avec try/catch — une mise à jour Android peut avoir
          //    révoqué la permission sans que checkPermissions() le détecte
          try {
            await scheduleDailyNotificationInternal(language);
            console.log('[Notifs] ✅ Re-planification au démarrage réussie');
          } catch (scheduleErr) {
            console.warn('[Notifs] ⚠️ Re-planification échouée — permission peut-être révoquée :', scheduleErr);
            // ✅ Re-vérifier la permission réelle via une vraie requête
            try {
              const recheck = await LocalNotifications.requestPermissions();
              const remapped = mapPermission(recheck.display);
              setPermission(remapped);
              console.log('[Notifs] Re-check permission :', recheck.display);
              if (remapped === 'granted') {
                await scheduleDailyNotificationInternal(language);
              }
            } catch (recheckErr) {
              console.error('[Notifs] Impossible de re-vérifier :', recheckErr);
              setPermission('default'); // ✅ Force le banner à réapparaître
            }
          }
        } else if (mapped === 'default') {
          // ✅ Android 13+ : après mise à jour, la permission peut être
          //    "prompt" (default) même si elle était accordée avant
          console.log('[Notifs] Permission default — banner va s\'afficher');
        }
      } catch (err) {
        console.error('[Notifs] Erreur init :', err);
        setIsSupported(false);
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
        await scheduleDailyNotificationInternal(language);
        // Notification de confirmation immédiate
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

  // ── Notification immédiate (interne) ──────────────────────────
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

  // ── Planification quotidienne (interne, sans dépendance au state) ──
  const scheduleDailyNotificationInternal = async (lang: string, timeStr?: string) => {
    const savedTime = timeStr ?? localStorage.getItem(NOTIF_TIME_KEY) ?? '08:00';
    if (timeStr) localStorage.setItem(NOTIF_TIME_KEY, timeStr);

    const [hours, minutes] = savedTime.split(':').map(Number);
    const now  = new Date();
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    const title = lang === 'fr' ? '🌟 Ta citation du jour' : '🌟 Your daily quote';
    const body  = lang === 'fr'
      ? "Ta dose de motivation quotidienne t'attend !"
      : 'Your daily motivation awaits!';

    // Annuler l'ancienne avant de replanifier
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

  // ── API publique : planifier (exposée au composant Settings) ──
  const scheduleDailyNotification = async (timeStr?: string) => {
    if (!isSupported) return;
    await scheduleDailyNotificationInternal(language, timeStr);
  };

  // ── Annuler ────────────────────────────────────────────────────
  const cancelDailyNotification = async () => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: DAILY_NOTIF_ID }] });
    } catch (_) {}
  };

  // ── Test visible immédiat ──────────────────────────────────────
  const testNotification = async () => {
    await scheduleImmediate(
      language === 'fr' ? '🌟 Test de notification' : '🌟 Notification test',
      language === 'fr' ? 'Vos notifications fonctionnent ! 🎉' : 'Your notifications work! 🎉'
    );
  };

  // ── showImmediateNotification exposée (compatibilité) ─────────
  const showImmediateNotification = async (title: string, body: string) => {
    await scheduleImmediate(title, body);
  };

  // ── Re-planifier si la langue change ──────────────────────────
  useEffect(() => {
    if (permission === 'granted' && isSupported) {
      scheduleDailyNotificationInternal(language).catch(console.warn);
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