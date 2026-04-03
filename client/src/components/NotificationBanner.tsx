import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { notificationService } from '@/services/notification-service';

export function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { permission, isSupported, bannerDismissed, requestPermission, dismissBanner } = useNotifications();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (isSupported && permission === 'default' && !bannerDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isSupported, permission, bannerDismissed]);

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsVisible(false);
      // ✅ Planifie 7 jours de notifs après accord de permission
      // Utilise les settings existants (définis à l'onboarding ou dans SettingsMenu)
      await notificationService.start(language as 'fr' | 'en');
    }
  };

  const handleDismiss = async () => {
    setIsVisible(false);
    await dismissBanner();
  };

  if (!isSupported || permission !== 'default' || bannerDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed left-4 right-4 z-40 max-w-md mx-auto"
          style={{
            bottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 80px), 100px)',
          }}
        >
          <div
            className="rounded-2xl p-4 shadow-2xl"
            style={{
              background:    'rgba(255,250,248,0.97)',
              border:        '1px solid rgba(255,140,105,0.2)',
              backdropFilter:'blur(20px)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl shrink-0" style={{ background: 'rgba(255,140,105,0.12)' }}>
                <Bell className="w-5 h-5" style={{ color: '#FF8C69' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-1" style={{ color: '#2D1A12' }}>
                  {t.notifications.permissionTitle}
                </h3>
                <p className="text-xs" style={{ color: '#B07060' }}>
                  {t.notifications.permissionMessage}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleEnable}
                    className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(to right, #FF8C69, #FFA882)',
                      boxShadow:  '0 4px 12px rgba(255,140,105,0.3)',
                    }}
                  >
                    {t.notifications.enable}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: 'rgba(255,140,105,0.08)', color: '#B07060' }}
                  >
                    {t.notifications.cancel}
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg transition-colors shrink-0"
                style={{ color: '#B07060' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}