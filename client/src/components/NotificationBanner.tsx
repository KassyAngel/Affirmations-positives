import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { useLanguage } from '@/contexts/LanguageContext';

const BANNER_DISMISSED_KEY = 'notification_banner_dismissed';

export function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { permission, isSupported, requestPermission } = useNotifications();
  const { t } = useLanguage();

  useEffect(() => {
    // Afficher la bannière seulement si :
    // - Les notifications sont supportées
    // - La permission n'a pas encore été donnée
    // - L'utilisateur n'a pas déjà fermé la bannière
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);

    if (isSupported && permission === 'default' && !dismissed) {
      // Afficher après 3 secondes pour ne pas être intrusif
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  };

  if (!isSupported || permission !== 'default') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
        >
          <div className="bg-card border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-1">
                  {t.notifications.permissionTitle}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t.notifications.permissionMessage}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleEnable}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    {t.notifications.enable}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    {t.notifications.cancel}
                  </button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}