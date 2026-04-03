/**
 * use-notifications.ts
 *
 * ✅ Gère UNIQUEMENT : état de permission + banner de demande
 * ✅ La planification est entièrement déléguée à notification-service.ts
 * ✅ Utilise @capacitor/preferences pour la persistance du banner
 */

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { useLanguage } from '@/contexts/LanguageContext';

const BANNER_DISMISSED_KEY = 'notification_banner_dismissed';

async function prefsGet(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value;
  } catch {
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

export function useNotifications() {
  const [permission, setPermission]         = useState<'granted' | 'denied' | 'default'>('default');
  const [isSupported, setIsSupported]       = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true); // true par défaut → pas de flash
  const { language } = useLanguage();

  // ── Init : lire l'état de permission + banner ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!Capacitor.isNativePlatform()) {
        setIsSupported(false);
        return;
      }
      setIsSupported(true);

      // Lire le banner dismissed depuis Preferences
      const dismissed = await prefsGet(BANNER_DISMISSED_KEY);
      setBannerDismissed(dismissed === 'true');

      // Lire l'état actuel de permission (sans planifier)
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const status = await LocalNotifications.checkPermissions();
        setPermission(mapPermission(status.display));
      } catch (e) {
        console.warn('[useNotifications] checkPermissions error:', e);
        setIsSupported(false);
      }
    };
    init();
  }, []);

  // ── Demander la permission ─────────────────────────────────────────────────
  // La planification est faite par l'appelant (NotificationBanner → notificationService.start)
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const status  = await LocalNotifications.requestPermissions();
      const granted = status.display === 'granted';
      setPermission(mapPermission(status.display));
      return granted;
    } catch (e) {
      console.error('[useNotifications] requestPermission error:', e);
      return false;
    }
  };

  // ── Banner ─────────────────────────────────────────────────────────────────
  const dismissBanner = async () => {
    setBannerDismissed(true);
    await prefsSet(BANNER_DISMISSED_KEY, 'true');
  };

  return {
    permission,
    isSupported,
    bannerDismissed,
    requestPermission,
    dismissBanner,
  };
}

function mapPermission(display: string): 'granted' | 'denied' | 'default' {
  if (display === 'granted') return 'granted';
  if (display === 'denied')  return 'denied';
  return 'default';
}