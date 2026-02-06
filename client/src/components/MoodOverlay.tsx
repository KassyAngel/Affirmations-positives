import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, Zap, Coffee, CloudRain } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Mood } from '@shared/schema';

interface MoodOverlayProps {
  isOpen: boolean;
  onSelectMood: (mood: Mood) => void;
}

const moodsConfig: { 
  id: Mood; 
  iconComponent: React.ElementType; 
  color: string;
}[] = [
  { id: 'determined', iconComponent: Zap, color: 'bg-amber-500' },
  { id: 'happy', iconComponent: Smile, color: 'bg-emerald-500' },
  { id: 'zen', iconComponent: Coffee, color: 'bg-blue-500' },
  { id: 'tired', iconComponent: CloudRain, color: 'bg-slate-500' },
  { id: 'frustrated', iconComponent: Frown, color: 'bg-rose-500' },
];

export function MoodOverlay({ isOpen, onSelectMood }: MoodOverlayProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
        >
          <div className="max-w-md w-full text-center space-y-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                {t.mood.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t.mood.subtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {moodsConfig.map((mood, index) => {
                const IconComponent = mood.iconComponent;
                const label = t.mood[mood.id];

                return (
                  <motion.button
                    key={mood.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectMood(mood.id)}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-white/5 hover:border-primary/30 transition-colors group"
                  >
                    <div className={`p-4 rounded-full ${mood.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                      <IconComponent className={`w-8 h-8 ${mood.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="font-medium text-sm text-foreground/80">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}