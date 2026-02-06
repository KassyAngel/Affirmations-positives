import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Planifier la notification quotidienne
        await scheduleDailyNotification();

        // Afficher une notification de confirmation
        showNotification(
          t.notifications.permissionGranted,
          t.notifications.body
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = async (title: string, body: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'daily-quote',
        requireInteraction: false,
        data: { url: '/' },
        ...options
      });
    } else {
      // Fallback pour navigateurs sans service worker
      new Notification(title, {
        body,
        icon: '/favicon.png',
        ...options
      });
    }
  };

  const scheduleDailyNotification = async () => {
    if ('serviceWorker' in navigator && permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;

      // Envoyer un message au service worker pour planifier la notification
      registration.active?.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        time: '08:00', // 8h du matin
        quote: language === 'fr' 
          ? 'Ta dose de motivation quotidienne t\'attend !' 
          : 'Your daily motivation awaits!',
        lang: language
      });
    }
  };

  const testNotification = async () => {
    await showNotification(
      t.notifications.title,
      t.notifications.body
    );
  };

  // Re-planifier quand la langue change
  useEffect(() => {
    if (permission === 'granted') {
      scheduleDailyNotification();
    }
  }, [language, permission]);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    testNotification,
    scheduleDailyNotification
  };
}