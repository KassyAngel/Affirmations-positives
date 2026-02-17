import { useState } from 'react';
import { motion } from 'framer-motion';
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
  iconColor: string;
  cardBg: string;
  circleBg: string;
  emoji: string;
}[] = [
  {
    id: 'determined',
    iconComponent: Zap,
    iconColor: 'text-amber-500',
    cardBg: 'bg-amber-50 hover:bg-amber-100 border-amber-100 hover:border-amber-200',
    circleBg: 'bg-amber-100',
    emoji: '⚡',
  },
  {
    id: 'happy',
    iconComponent: Smile,
    iconColor: 'text-emerald-500',
    cardBg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 hover:border-emerald-200',
    circleBg: 'bg-emerald-100',
    emoji: '😊',
  },
  {
    id: 'zen',
    iconComponent: Coffee,
    iconColor: 'text-blue-400',
    cardBg: 'bg-blue-50 hover:bg-blue-100 border-blue-100 hover:border-blue-200',
    circleBg: 'bg-blue-100',
    emoji: '🍃',
  },
  {
    id: 'tired',
    iconComponent: CloudRain,
    iconColor: 'text-slate-400',
    cardBg: 'bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200',
    circleBg: 'bg-slate-100',
    emoji: '☁️',
  },
  {
    id: 'frustrated',
    iconComponent: Frown,
    iconColor: 'text-rose-400',
    cardBg: 'bg-rose-50 hover:bg-rose-100 border-rose-100 hover:border-rose-200',
    circleBg: 'bg-rose-100',
    emoji: '😤',
  },
];

export function MoodOverlay({ isOpen, onSelectMood }: MoodOverlayProps) {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<Mood | null>(null);

  if (!isOpen) return null;

  const handleSelect = (mood: Mood) => {
    if (selected) return;
    setSelected(mood);
    setTimeout(() => {
      onSelectMood(mood);
      setSelected(null);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
      style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #fce7f3 40%, #f3e8ff 100%)',
      }}
    >
      {/* Bulles décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-16 left-8 w-56 h-56 bg-rose-200/40 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-16 right-8 w-72 h-72 bg-pink-200/35 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-rose-300/50"
            style={{
              top: `${15 + (i * 13) % 70}%`,
              left: `${8 + (i * 17) % 84}%`,
            }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      <div className="relative max-w-sm w-full">
        {/* En-tête */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-center mb-8"
        >
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, delay: 0.05 }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center shadow-lg shadow-rose-200/50">
              <span className="text-xl">✨</span>
            </div>
          </motion.div>

          <h2 className="text-4xl font-display font-bold text-rose-900 mb-2">
            {t.mood.title}
          </h2>
          <p className="text-rose-600/80 text-base font-light">
            {t.mood.subtitle}
          </p>
        </motion.div>

        {/* Grille des humeurs */}
        <div className="grid grid-cols-2 gap-3">
          {moodsConfig.map((mood, index) => {
            const IconComponent = mood.iconComponent;
            const label = t.mood[mood.id];
            const isSelected = selected === mood.id;

            return (
              <motion.button
                key={mood.id}
                initial={{ scale: 0.85, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.07 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelect(mood.id)}
                disabled={!!selected}
                className={`
                  relative flex flex-col items-center gap-3 p-5 rounded-2xl border
                  transition-all duration-200 shadow-sm hover:shadow-md
                  ${mood.cardBg}
                  ${isSelected ? 'opacity-60 scale-95' : ''}
                `}
              >
                <motion.div
                  className={`p-3 rounded-2xl ${mood.circleBg}`}
                  animate={isSelected ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <IconComponent className={`w-7 h-7 ${mood.iconColor}`} />
                </motion.div>

                <span className="font-semibold text-sm text-stone-700">{label}</span>

                <motion.span
                  className="absolute -top-2 -right-2 text-base"
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {mood.emoji}
                </motion.span>
              </motion.button>
            );
          })}

          {/* Cellule vide pour équilibrer la grille */}
          <div className="rounded-2xl border border-dashed border-rose-100 bg-rose-50/30" />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-rose-400/70 mt-5 font-light italic"
        >
          {language === 'fr'
            ? 'Chaque émotion mérite une citation 🌸'
            : 'Every emotion deserves a quote 🌸'}
        </motion.p>
      </div>
    </motion.div>
  );
}