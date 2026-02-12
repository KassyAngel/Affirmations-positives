import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme, THEMES, type ThemeId } from '@/contexts/ThemeContext';
import { Check, ChevronLeft } from 'lucide-react';

interface ThemeStepProps {
  onSelect: (theme: string) => void;
  onBack: () => void;
}

const THEME_PREVIEWS: { id: ThemeId; image?: string }[] = [
  { id: 'classic' },
  { id: 'nature',   image: '/themes/nature.png' },
  { id: 'ethereal', image: '/themes/ethereal.png' },
  { id: 'mountain', image: '/themes/mountain.png' },
  { id: 'minimal' },
  { id: 'sunset',   image: '/themes/sunset.png' },
];

export function ThemeStep({ onSelect, onBack }: ThemeStepProps) {
  const { t } = useLanguage();
  const { themeId, setTheme, theme: currentTheme } = useTheme();
  const [selected, setSelected] = useState<ThemeId>(themeId);

  const handleSelect = (id: ThemeId) => {
    setSelected(id);
    // Aperçu live : applique immédiatement le thème dans tout l'écran
    setTheme(id);
  };

  const handleConfirm = () => {
    onSelect(selected);
  };

  return (
    // Le fond de l'écran reflète directement le thème sélectionné
    <div className={`max-w-md w-full space-y-6 px-2 transition-all duration-500`}>
      <button
        onClick={onBack}
        className={`absolute top-6 left-6 transition-colors ${currentTheme.subtleTextClass}`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center pt-4"
      >
        <h2 className={`text-3xl font-display font-bold leading-tight ${currentTheme.textClass}`}>
          {t.onboarding.theme.title}
        </h2>
        <p className={`text-sm mt-1 ${currentTheme.textMutedClass}`}>
          Touchez un thème pour le prévisualiser
        </p>
      </motion.div>

      {/* Grille de thèmes */}
      <div className="grid grid-cols-2 gap-3">
        {THEME_PREVIEWS.map((preview, index) => {
          const cfg = THEMES[preview.id];
          const isSelected = selected === preview.id;

          return (
            <motion.button
              key={preview.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.07 }}
              onClick={() => handleSelect(preview.id)}
              className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-rose-400 ring-4 ring-rose-300/50 scale-[1.03]'
                  : 'border-white/20 hover:border-white/40 hover:scale-[1.01]'
              }`}
            >
              {/* Fond du thème */}
              {preview.image ? (
                <img
                  src={preview.image}
                  alt={cfg.label}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 ${cfg.bgClass}`} />
              )}

              {/* Overlay subtil pour lisibilité */}
              <div className="absolute inset-0 bg-black/10" />

              {/* Texte de démo */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-3">
                <span className={`text-2xl font-serif ${cfg.textClass}`}>Aa</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/20 ${cfg.textClass}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Coche de sélection */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-2 right-2 bg-rose-400 rounded-full p-1 shadow-lg"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Boutons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3 pt-2"
      >
        <button
          onClick={handleConfirm}
          className={`w-full py-4 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105 ${currentTheme.buttonClass}`}
        >
          {t.onboarding.complete.start}
        </button>
        <button
          onClick={onBack}
          className={`block w-full text-center text-sm transition-colors ${currentTheme.subtleTextClass}`}
        >
          Retour
        </button>
      </motion.div>
    </div>
  );
}