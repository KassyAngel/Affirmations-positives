import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check } from 'lucide-react';
import { useTheme, THEMES, type ThemeId } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function ThemeSelector() {
  const { t } = useLanguage();
  const { theme, themeId, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (newThemeId: ThemeId) => {
    setTheme(newThemeId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Bouton pour ouvrir le sélecteur */}
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-full transition-all ${theme.cardClass} hover:scale-110 active:scale-95`}
        aria-label="Changer le thème"
      >
        <Palette className={`w-5 h-5 ${theme.textClass}`} />
      </button>

      {/* Modal du sélecteur de thème */}
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

            {/* Panneau du sélecteur */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-8 max-h-[80vh] overflow-y-auto bg-[#fff5f5]`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-display font-bold ${theme.textClass}`}>
                  {t.onboarding.theme.title}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-full transition-colors ${theme.cardClass}`}
                >
                  <X className={`w-5 h-5 ${theme.textClass}`} />
                </button>
              </div>

              {/* Grille de thèmes - JUSTE LES IMAGES */}
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                  const themeConfig = THEMES[id];
                  const isSelected = id === themeId;

                  return (
                    <button
                      key={id}
                      onClick={() => handleThemeSelect(id)}
                      className="relative"
                    >
                      {/* Miniature - JUSTE L'IMAGE */}
                      <div
                        className={`
                          h-32 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                          ${isSelected 
                            ? 'border-white/80 scale-105 shadow-2xl' 
                            : 'border-white/20 hover:border-white/40 hover:scale-102'
                          }
                        `}
                      >
                        <div className="relative h-full w-full">
                          <img 
                            src={themeConfig.imagePath} 
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`❌ Image non chargée pour ${id}:`, themeConfig.imagePath);
                              e.currentTarget.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log(`✅ Image chargée pour ${id}:`, themeConfig.imagePath);
                            }}
                          />
                          {/* Overlay très léger */}
                          <div className={`absolute inset-0 ${themeConfig.bgClass} opacity-30`} />
                        </div>
                      </div>

                      {/* Icône de sélection uniquement */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-5 h-5 text-slate-900" />
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
    </>
  );
}