import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Bell } from 'lucide-react';

interface NotificationStepProps {
  onContinue: (data: { enabled: boolean; frequency: number; startTime: string; endTime: string }) => void;
  onBack: () => void;
}

export function NotificationStep({ onContinue, onBack }: NotificationStepProps) {
  const { t } = useLanguage();
  const [frequency, setFrequency] = useState(10);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('22:00');

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      onContinue({
        enabled: permission === 'granted',
        frequency,
        startTime,
        endTime
      });
    } else {
      onContinue({ enabled: false, frequency, startTime, endTime });
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 text-center px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-4"
      >
        <h2 className="text-3xl font-bold">{t.onboarding.notifications.title}</h2>
        <p className="text-white/60">{t.onboarding.notifications.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 space-y-6"
      >
        <div className="bg-slate-900 rounded-xl p-4 flex items-start gap-3 text-left">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">Motivation</span>
              <span className="text-xs text-white/40">now</span>
            </div>
            <p className="text-sm mt-1">Un jour, vous serez là où vous avez toujours voulu être.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Combien</span>
              <span className="bg-white/10 px-2 py-1 rounded text-sm font-bold">{frequency}x</span>
            </div>
            <Slider 
              value={[frequency]} 
              onValueChange={([v]) => setFrequency(v)} 
              max={20} 
              step={1} 
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-white/40">
              <span>0</span>
              <span>20</span>
            </div>
          </div>

          <div className="divide-y divide-white/5 bg-slate-900/50 rounded-xl overflow-hidden">
            <div className="p-4 flex justify-between items-center">
              <span className="text-sm">Commencer à</span>
              <input 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-slate-800 border-none rounded px-2 py-1 text-sm font-bold focus:ring-1 focus:ring-white/20"
              />
            </div>
            <div className="p-4 flex justify-between items-center">
              <span className="text-sm">Finir à</span>
              <input 
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-slate-800 border-none rounded px-2 py-1 text-sm font-bold focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-3 pt-4">
        <Button 
          onClick={handleRequestPermission}
          className="w-full h-14 rounded-full bg-white text-slate-900 hover:bg-white/90 text-lg font-bold"
        >
          Autoriser et enregistrer
        </Button>
        <button onClick={onBack} className="text-white/40 hover:text-white text-sm">
          Retour
        </button>
      </div>
    </div>
  );
}
