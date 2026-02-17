import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { notificationService } from '@/services/notification-service';
import { Slider } from '@/components/ui/slider';
import { Bell, ChevronLeft } from 'lucide-react';

interface NotificationStepProps {
  onContinue: (data: { enabled: boolean; frequency: number; startTime: string; endTime: string }) => void;
  onBack: () => void;
}

export function NotificationStep({ onContinue, onBack }: NotificationStepProps) {
  const { t, language } = useLanguage();
  const [frequency, setFrequency] = useState(10);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('22:00');
  const [loading, setLoading] = useState(false);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      // ✅ Fonctionne sur Android (Capacitor) ET sur le web
      const granted = await notificationService.requestPermission();

      const settings = { enabled: granted, frequency, startTime, endTime };

      notificationService.saveSettings(settings);

      if (granted) {
        // ✅ Planifie toutes les notifications du jour (Capacitor)
        // ou démarre le service web (browser)
        await notificationService.start(language);
      }

      onContinue(settings);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6 px-2">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-rose-400 hover:text-rose-600 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-2 pt-4"
      >
        <h2 className="text-3xl font-display font-bold text-rose-900">
          {t.onboarding.notifications.title}
        </h2>
        <p className="text-rose-600/80 text-sm">
          {t.onboarding.notifications.subtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white/70 backdrop-blur-sm rounded-3xl p-5 border border-rose-100 shadow-md space-y-5"
      >
        {/* Preview notification */}
        <div className="bg-rose-50 rounded-2xl p-4 flex items-start gap-3 border border-rose-100">
          <div className="bg-gradient-to-br from-rose-300 to-pink-400 p-2 rounded-xl shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-rose-900">💪 Motivation</span>
              <span className="text-xs text-rose-400">maintenant</span>
            </div>
            <p className="text-sm mt-1 text-rose-800/80">
              {language === 'fr'
                ? 'Vous êtes plus fort(e) que vous ne le pensez !'
                : 'You are stronger than you think!'}
            </p>
          </div>
        </div>

        {/* Fréquence */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm text-rose-900">
              {language === 'fr' ? 'Combien par jour' : 'Per day'}
            </span>
            <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-bold">
              {frequency}x
            </span>
          </div>
          <Slider
            value={[frequency]}
            onValueChange={([v]) => setFrequency(v)}
            max={20}
            step={1}
            className="py-1 [&_[role=slider]]:bg-rose-400 [&_[role=slider]]:border-rose-400 [&_.relative]:bg-rose-100 [&_[data-orientation=horizontal]_.absolute]:bg-rose-400"
          />
          <div className="flex justify-between text-xs text-rose-300 font-medium">
            <span>0</span><span>20</span>
          </div>
        </div>

        {/* Plage horaire */}
        <div className="bg-rose-50 rounded-2xl overflow-hidden border border-rose-100 divide-y divide-rose-100">
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-rose-900">
              {language === 'fr' ? 'Début' : 'Start'}
            </span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-sm font-bold text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-rose-900">
              {language === 'fr' ? 'Fin' : 'End'}
            </span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-sm font-bold text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-3 border border-rose-100">
          <p className="text-xs text-rose-700 text-center">
            {language === 'fr'
              ? '📚 100+ messages inspirants + citations aléatoires'
              : '📚 100+ inspiring messages + random quotes'}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 pt-2"
      >
        <button
          onClick={handleRequestPermission}
          disabled={loading}
          className="w-full py-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-semibold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-60 disabled:scale-100"
        >
          {loading
            ? '...'
            : language === 'fr' ? 'Autoriser' : 'Allow'}
        </button>
      </motion.div>
    </div>
  );
}