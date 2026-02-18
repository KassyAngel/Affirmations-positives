import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check } from 'lucide-react';
import { useTheme, THEMES, type ThemeId } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePremium } from '@/hooks/use-premium';
import { PremiumPaywall } from '@/components/PremiumPaywall';

// ✅ Thèmes GRATUITS
const FREE_THEMES: ThemeId[] = [
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

// Thèmes à fond CLAIR — le bouton doit contraster différemment
const LIGHT_THEMES: ThemeId[] = [
  'minimaliste-1',
  'minimaliste-2',
  'minimaliste-3',
  'minimaliste-5',
  'minimaliste-6',
  'minimaliste-7',
  'minimaliste-8',
  'zen-cascademinimaliste',
];

export function ThemeSelector() {
  const { t } = useLanguage();
  const { theme, themeId, setTheme } = useTheme();
  const { isPremium } = usePremium();
  const [isOpen, setIsOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const isLightTheme = LIGHT_THEMES.includes(themeId);

  // ── Style du bouton header : toujours contrasté ──
  const triggerStyleLight = {
    background: 'rgba(0, 0, 0, 0.07)',
    border: '1.5px solid rgba(0, 0, 0, 0.15)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    backdropFilter: 'blur(8px)',
  };

  const triggerStyleDark = {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1.5px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(12px)',
  };

  const iconColor = isLightTheme ? '#374151' : '#ffffff';

  const handleThemeSelect = (newThemeId: ThemeId) => {
    if (!FREE_THEMES.includes(newThemeId) && !isPremium()) {
      setShowPaywall(true);
      return;
    }
    setTheme(newThemeId);
    setIsOpen(false);
  };

  return (
    <>
      {/* ── Bouton trigger : toujours visible ── */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
        style={isLightTheme ? triggerStyleLight : triggerStyleDark}
        aria-label="Changer le thème"
      >
        <Palette style={{ width: 20, height: 20, color: iconColor }} />
      </motion.button>

      {/* ── Modal sélecteur ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Panneau bas */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-8 max-h-[80vh] overflow-y-auto bg-[#fff5f5]"
            >
              {/* Header du panneau */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-rose-900">
                  {t.onboarding.theme.title}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full transition-colors bg-rose-50 hover:bg-rose-100"
                >
                  <X className="w-5 h-5 text-rose-700" />
                </button>
              </div>

              {/* Grille de thèmes */}
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                  const themeConfig = THEMES[id];
                  const isSelected = id === themeId;
                  const isLocked = !FREE_THEMES.includes(id) && !isPremium();

                  return (
                    <button
                      key={id}
                      onClick={() => handleThemeSelect(id)}
                      className="relative"
                      style={{ opacity: isLocked ? 0.7 : 1 }}
                    >
                      <div
                        className={`
                          h-32 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                          ${isSelected
                            ? 'border-rose-400 scale-105 shadow-2xl'
                            : 'border-white/20 hover:border-rose-200 hover:scale-[1.02]'
                          }
                        `}
                      >
                        <div className="relative h-full w-full">
                          <img
                            src={themeConfig.imagePath}
                            alt={themeConfig.label.fr}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className={`absolute inset-0 ${themeConfig.bgClass} opacity-20`} />
                        </div>
                      </div>

                      {/* 🔒 Cadenas premium */}
                      {isLocked && (
                        <div
                          className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          <span className="text-sm">🔒</span>
                        </div>
                      )}

                      {/* ✅ Sélectionné */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 left-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
                        >
                          <Check className="w-4 h-4 text-rose-600" strokeWidth={3} />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Premium Paywall */}
      <PremiumPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="theme_locked"
      />
    </>
  );
}