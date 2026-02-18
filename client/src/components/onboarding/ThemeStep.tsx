import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { THEMES, type ThemeId } from '@/contexts/ThemeContext';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { Check, ChevronLeft } from 'lucide-react';

interface ThemeStepProps {
  selectedTheme: ThemeId;
  onThemeSelect: (theme: ThemeId) => void;
  onBack?: () => void;
}

// ✅ Thèmes GRATUITS pour l'onboarding
const FREE_THEMES_ONBOARDING: ThemeId[] = [
  'afrique',
  'ethereal',
  'minimaliste-1',
  'minimaliste-2',
  'minimaliste-3',
  'minimaliste-5',
  'minimaliste-6',
  'minimaliste-7',
  'minimaliste-8',
  'zen-cascademinimaliste',
  'zen',
];

export function ThemeStep({ selectedTheme, onThemeSelect, onBack }: ThemeStepProps) {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<ThemeId>(selectedTheme);
  const [showPaywall, setShowPaywall] = useState(false);
  const themeIds = Object.keys(THEMES) as ThemeId[];

  const handlePreview = (id: ThemeId) => {
    // ✅ Bloquer les thèmes premium — ouvrir le paywall au lieu de sélectionner
    if (!FREE_THEMES_ONBOARDING.includes(id)) {
      setShowPaywall(true);
      return;
    }
    setSelected(id);
    onThemeSelect(id);
  };

  return (
    <>
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

        {/* Grille scrollable */}
        <div
          className="grid grid-cols-2 gap-3 max-h-[52vh] overflow-y-auto pr-1 pb-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(251,113,133,0.3) transparent' }}
        >
          {themeIds.map((id, index) => {
            const cfg = THEMES[id];
            const isSelected = selected === id;
            const isLocked = !FREE_THEMES_ONBOARDING.includes(id);

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
                style={{ opacity: isLocked ? 0.65 : 1 }}
              >
                {/* Image */}
                <img
                  src={cfg.imagePath}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.error(`❌ Image non chargée: ${cfg.imagePath}`);
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Overlay sombre sur les thèmes lockés */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black/25" />
                )}

                {/* 🔒 Cadenas Premium */}
                {isLocked && (
                  <div
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <span className="text-base">🔒</span>
                  </div>
                )}

                {/* ✅ Coche si sélectionné */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-2 left-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
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

      {/* Paywall déclenché si l'uti tente de choisir un thème premium */}
      <PremiumPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="theme_locked"
      />
    </>
  );
}