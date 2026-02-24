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

// ✅ Uniquement les thèmes GRATUITS — les nouveaux sont tous PREMIUM
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

// ✅ Thèmes PREMIUM — tous les nouveaux + les anciens payants
// (tout ce qui n'est pas dans FREE_THEMES_ONBOARDING est automatiquement locked)

export function ThemeStep({ selectedTheme, onThemeSelect, onBack }: ThemeStepProps) {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<ThemeId>(selectedTheme);
  const [showPaywall, setShowPaywall] = useState(false);
  const themeIds = Object.keys(THEMES) as ThemeId[];

  const handlePreview = (id: ThemeId) => {
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
            className="absolute top-6 left-6 transition-colors"
            style={{ color: '#FF8C69' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center pt-4"
        >
          <h2 className="text-3xl font-display font-bold leading-tight" style={{ color: '#2D1A12' }}>
            {t.onboarding.theme.title}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#B07060' }}>
            {language === 'fr' ? 'Touchez un thème pour le sélectionner' : 'Tap a theme to select it'}
          </p>
        </motion.div>

        {/* Grille scrollable */}
        <div
          className="grid grid-cols-2 gap-3 max-h-[52vh] overflow-y-auto pr-1 pb-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,140,105,0.3) transparent' }}
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
                className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-300"
                style={{
                  opacity: isLocked ? 0.7 : 1,
                  borderColor: isSelected ? '#FF8C69' : 'rgba(255,203,184,0.6)',
                  boxShadow: isSelected ? '0 0 0 4px rgba(255,140,105,0.3)' : 'none',
                  transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <img
                  src={cfg.imagePath}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />

                {/* Overlay sombre pour les thèmes locked */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black/25" />
                )}

                {/* Cadenas premium */}
                {isLocked && (
                  <div
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <span className="text-base">🔒</span>
                  </div>
                )}

                {/* Badge "PREMIUM" sous le cadenas */}
                {isLocked && (
                  <div
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, #FF8C69, #FFA882)',
                      color: 'white',
                    }}
                  >
                    Premium
                  </div>
                )}

                {/* Checkmark sélectionné */}
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

      <PremiumPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="theme_locked"
      />
    </>
  );
}