import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { THEMES, type ThemeId } from '@/contexts/ThemeContext';
import { Check, ChevronLeft } from 'lucide-react';

interface ThemeStepProps {
  selectedTheme: ThemeId;
  onThemeSelect: (theme: ThemeId) => void;
  onBack?: () => void;
}

export function ThemeStep({ selectedTheme, onThemeSelect, onBack }: ThemeStepProps) {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<ThemeId>(selectedTheme);

  const themeIds = Object.keys(THEMES) as ThemeId[];

  const handlePreview = (id: ThemeId) => {
    setSelected(id);
    onThemeSelect(id);
  };

  return (
    <div className="max-w-md w-full space-y-4 px-1">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-rose-400 hover:text-rose-600 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center pt-4"
      >
        <h2 className="text-3xl font-display font-bold text-rose-900 leading-tight">
          {t.onboarding.theme.title}
        </h2>
        <p className="text-sm mt-1 text-rose-500">
          {language === 'fr' ? 'Touchez un thème pour le sélectionner' : 'Tap a theme to select it'}
        </p>
      </motion.div>

      {/* Grille scrollable — pas de noms */}
      <div
        className="grid grid-cols-2 gap-3 max-h-[52vh] overflow-y-auto pr-1 pb-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(251,113,133,0.3) transparent' }}
      >
        {themeIds.map((id, index) => {
          const cfg = THEMES[id];
          const isSelected = selected === id;

          return (
            <motion.button
              key={id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Math.min(index * 0.04, 0.6) }}
              onClick={() => handlePreview(id)}
              className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-rose-400 ring-4 ring-rose-300/50 scale-[1.04]'
                  : 'border-rose-100 hover:border-rose-300 hover:scale-[1.02]'
              }`}
            >
              {/* Image uniquement — pas de nom */}
              <img
                src={cfg.imagePath}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />

              {/* Coche verte si sélectionné */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}