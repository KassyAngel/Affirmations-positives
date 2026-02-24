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
      const granted = await notificationService.requestPermission();
      const settings = { enabled: granted, frequency, startTime, endTime };
      notificationService.saveSettings(settings);
      if (granted) {
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
        className="absolute top-6 left-6 text-peach-400 hover:text-peach-600 transition-colors"
        style={{ color: '#FF8C69' }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-2 pt-4"
      >
        <h2 className="text-3xl font-display font-bold" style={{ color: '#2D1A12' }}>
          {t.onboarding.notifications.title}
        </h2>
        <p className="text-sm" style={{ color: '#B07060' }}>
          {t.onboarding.notifications.subtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="backdrop-blur-sm rounded-3xl p-5 shadow-md space-y-5"
        style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid #FFCBB8' }}
      >
        {/* Preview notification */}
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: '#FFF5F0', border: '1px solid #FFCBB8' }}>
          <div className="p-2 rounded-xl shrink-0" style={{ background: 'linear-gradient(135deg, #FF8C69, #FFA882)' }}>
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm" style={{ color: '#2D1A12' }}>💪 Motivation</span>
              <span className="text-xs" style={{ color: '#B07060' }}>
                {language === 'fr' ? 'maintenant' : 'now'}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: '#7A4030' }}>
              {language === 'fr'
                ? 'Vous êtes plus fort(e) que vous ne le pensez !'
                : 'You are stronger than you think!'}
            </p>
          </div>
        </div>

        {/* Fréquence */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm" style={{ color: '#2D1A12' }}>
              {language === 'fr' ? 'Combien par jour' : 'Per day'}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: '#FFE4D9', color: '#FF8C69' }}>
              {frequency}x
            </span>
          </div>
          <Slider
            value={[frequency]}
            onValueChange={([v]) => setFrequency(v)}
            max={20}
            step={1}
            className="py-1 [&_[role=slider]]:bg-[#FF8C69] [&_[role=slider]]:border-[#FF8C69] [&_.relative]:bg-[#FFE4D9] [&_[data-orientation=horizontal]_.absolute]:bg-[#FF8C69]"
          />
          <div className="flex justify-between text-xs font-medium" style={{ color: '#FFCBB8' }}>
            <span>0</span><span>20</span>
          </div>
        </div>

        {/* Plage horaire */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #FFCBB8' }}>
          <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid #FFE4D9' }}>
            <span className="text-sm font-medium" style={{ color: '#2D1A12' }}>
              {language === 'fr' ? 'Début' : 'Start'}
            </span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2"
              style={{
                background: 'white',
                border: '1px solid #FFCBB8',
                color: '#2D1A12',
                // @ts-ignore
                '--tw-ring-color': '#FFA882',
              }}
            />
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#2D1A12' }}>
              {language === 'fr' ? 'Fin' : 'End'}
            </span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2"
              style={{
                background: 'white',
                border: '1px solid #FFCBB8',
                color: '#2D1A12',
              }}
            />
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: 'linear-gradient(to right, #FFF5F0, #FFF0EA)', border: '1px solid #FFE4D9' }}>
          <p className="text-xs text-center" style={{ color: '#7A4030' }}>
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
          className="w-full py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-60 disabled:scale-100"
          style={{ background: 'linear-gradient(to right, #FF8C69, #FFA882)' }}
        >
          {loading
            ? '...'
            : language === 'fr' ? 'Autoriser' : 'Allow'}
        </button>
      </motion.div>
    </div>
  );
}