import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check } from 'lucide-react';
import { useTheme, THEMES, type ThemeId } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePremium } from '@/hooks/use-premium';
import { PremiumPaywall } from '@/components/PremiumPaywall';

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

const LIGHT_THEMES: ThemeId[] = [
  'minimaliste-1',
  'minimaliste-2',
  'minimaliste-3',
  'minimaliste-5',
  'minimaliste-6',
  'minimaliste-7',
  'minimaliste-8',
  'zen-cascademinimaliste',
  'pink-1',
  'champs-de-fleurs',
  'plage-1',
  'fleur-1',
];

export function ThemeSelector() {
  const { t } = useLanguage();
  const { theme, themeId, setTheme } = useTheme();
  const { isPremium } = usePremium();
  const [isOpen, setIsOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const isLightTheme = LIGHT_THEMES.includes(themeId);

  const triggerStyleLight = {
    background: 'rgba(0,0,0,0.07)',
    border: '1.5px solid rgba(0,0,0,0.15)',
    backdropFilter: 'blur(8px)',
  };
  const triggerStyleDark = {
    background: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.25)',
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

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(160deg, #FFF5F0 0%, #FFF0E8 100%)',
                boxShadow: '0 -8px 32px rgba(255,140,105,0.15)',
                // ✅ min 40px garanti pour Samsung sans safe-area
                paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 40px)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-display font-bold" style={{ color: '#2D1A12' }}>
                  {t.onboarding.theme.title}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full transition-colors"
                  style={{ background: 'rgba(255,140,105,0.12)' }}
                >
                  <X className="w-5 h-5" style={{ color: '#FF8C69' }} />
                </button>
              </div>

              {/* ✅ pb-8 supplémentaire dans la grille pour la dernière ligne */}
              <div className="grid grid-cols-2 gap-4 pb-8">
                {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                  const themeConfig = THEMES[id];
                  const isSelected = id === themeId;
                  const isLocked = !FREE_THEMES.includes(id) && !isPremium();

                  return (
                    <button
                      key={id}
                      onClick={() => handleThemeSelect(id)}
                      className="relative"
                      style={{ opacity: isLocked ? 0.72 : 1 }}
                    >
                      <div
                        className="h-32 rounded-2xl overflow-hidden transition-all duration-300"
                        style={{
                          border: isSelected
                            ? '2.5px solid #FF8C69'
                            : '2px solid rgba(255,203,184,0.5)',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: isSelected
                            ? '0 4px 20px rgba(255,140,105,0.35)'
                            : '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      >
                        <div className="relative h-full w-full">
                          <img
                            src={themeConfig.imagePath}
                            alt={themeConfig.label.fr}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className={`absolute inset-0 ${themeConfig.bgClass} opacity-10`} />
                          {isLocked && <div className="absolute inset-0 bg-black/20" />}
                        </div>
                      </div>

                      {isLocked && (
                        <div
                          className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: 'rgba(0,0,0,0.65)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          <span className="text-sm">🔒</span>
                        </div>
                      )}

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

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 left-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
                        >
                          <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
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

      <PremiumPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="theme_locked"
      />
    </>
  );
}