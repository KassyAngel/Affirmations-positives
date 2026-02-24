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
  emoji: string;
  iconColor: string;
  cardBg: string;
  circleBg: string;
  borderColor: string;
  hoverBorderColor: string;
}[] = [
  {
    id: 'determined',
    iconComponent: Zap,
    emoji: '⚡',
    iconColor: '#D97706',
    cardBg: 'rgba(255,251,235,0.85)',
    circleBg: 'rgba(253,230,138,0.50)',
    borderColor: 'rgba(253,230,138,0.60)',
    hoverBorderColor: 'rgba(251,191,36,0.50)',
  },
  {
    id: 'happy',
    iconComponent: Smile,
    emoji: '😊',
    iconColor: '#059669',
    cardBg: 'rgba(236,253,245,0.85)',
    circleBg: 'rgba(167,243,208,0.50)',
    borderColor: 'rgba(167,243,208,0.60)',
    hoverBorderColor: 'rgba(52,211,153,0.50)',
  },
  {
    id: 'zen',
    iconComponent: Coffee,
    emoji: '🍃',
    iconColor: '#2563EB',
    cardBg: 'rgba(239,246,255,0.85)',
    circleBg: 'rgba(191,219,254,0.50)',
    borderColor: 'rgba(191,219,254,0.60)',
    hoverBorderColor: 'rgba(96,165,250,0.50)',
  },
  {
    id: 'tired',
    iconComponent: CloudRain,
    emoji: '☁️',
    iconColor: '#64748B',
    cardBg: 'rgba(248,250,252,0.85)',
    circleBg: 'rgba(226,232,240,0.50)',
    borderColor: 'rgba(226,232,240,0.60)',
    hoverBorderColor: 'rgba(148,163,184,0.50)',
  },
  {
    id: 'frustrated',
    iconComponent: Frown,
    emoji: '😤',
    iconColor: '#FF8C69',
    cardBg: 'rgba(255,245,240,0.85)',
    circleBg: 'rgba(255,203,184,0.50)',
    borderColor: 'rgba(255,203,184,0.60)',
    hoverBorderColor: 'rgba(255,168,130,0.50)',
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
        background: 'linear-gradient(160deg, #FFF5F0 0%, #FFE8DC 45%, #FFF8F5 100%)',
      }}
    >
      {/* Bulles décoratives pêche */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-16 left-8 w-56 h-56 rounded-full blur-3xl"
          style={{ background: 'rgba(255,168,130,0.22)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-16 right-8 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'rgba(255,228,217,0.30)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'rgba(255,203,184,0.15)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Particules subtiles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: 'rgba(255,140,105,0.35)',
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
          <h2
            className="text-4xl font-display font-bold mb-2"
            style={{ color: '#2D1A12' }}
          >
            {t.mood.title}
          </h2>
          <p
            className="text-base font-light"
            style={{ color: '#B07060' }}
          >
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
                className="relative flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200"
                style={{
                  background: mood.cardBg,
                  border: `1.5px solid ${isSelected ? mood.hoverBorderColor : mood.borderColor}`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: isSelected
                    ? '0 4px 20px rgba(0,0,0,0.08)'
                    : '0 2px 10px rgba(0,0,0,0.04)',
                  opacity: isSelected ? 0.65 : 1,
                  transform: isSelected ? 'scale(0.96)' : undefined,
                }}
              >
                {/* Cercle icône */}
                <motion.div
                  className="p-3 rounded-2xl"
                  style={{ background: mood.circleBg }}
                  animate={isSelected ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <IconComponent
                    className="w-7 h-7"
                    style={{ color: mood.iconColor }}
                  />
                </motion.div>

                <span
                  className="font-semibold text-sm"
                  style={{ color: '#3D2318' }}
                >
                  {label}
                </span>

                {/* Emoji au hover */}
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
          <div
            className="rounded-2xl"
            style={{
              border: '1.5px dashed rgba(255,203,184,0.50)',
              background: 'rgba(255,245,240,0.30)',
            }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs mt-5 font-light italic"
          style={{ color: 'rgba(176,112,96,0.70)' }}
        >
          {language === 'fr'
            ? 'Chaque émotion mérite une citation 🌸'
            : 'Every emotion deserves a quote 🌸'}
        </motion.p>
      </div>
    </motion.div>
  );
}