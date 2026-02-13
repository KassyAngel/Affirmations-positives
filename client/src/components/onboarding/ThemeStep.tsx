import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme, THEMES, type ThemeId } from '@/contexts/ThemeContext';
import { Check } from 'lucide-react';

interface ThemeStepProps {
  selectedTheme: ThemeId;
  onThemeSelect: (theme: ThemeId) => void;
  onBack?: () => void;
}

export function ThemeStep({ selectedTheme, onThemeSelect, onBack }: ThemeStepProps) {
  const { t } = useLanguage();
  const { theme: currentTheme } = useTheme();

  const themePreview = (themeId: ThemeId) => {
    const theme = THEMES[themeId];
    const isSelected = selectedTheme === themeId;

    return (
      <div
        key={themeId}
        onClick={() => onThemeSelect(themeId)}
        className="relative cursor-pointer"
      >
        {/* Miniature du thème - JUSTE L'IMAGE, PAS DE TEXTE */}
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
              src={theme.imagePath} 
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                // Afficher l'erreur dans la console
                console.error(`❌ Image non chargée pour ${themeId}:`, theme.imagePath);
                // Afficher le gradient de secours
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log(`✅ Image chargée pour ${themeId}:`, theme.imagePath);
              }}
            />
            {/* Overlay très léger pour voir l'image */}
            <div className={`absolute inset-0 ${theme.bgClass} opacity-30`} />
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
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className={`text-3xl font-display font-bold ${currentTheme.textClass}`}>
          {t.onboarding.theme.title}
        </h2>
      </div>

      {/* Grille scrollable avec TOUS les thèmes */}
      <div className="grid grid-cols-2 gap-4 mt-8 max-h-[60vh] overflow-y-auto pr-2 bg-[#fff5f5] p-4 rounded-3xl">
        {(Object.keys(THEMES) as ThemeId[]).map((themeId) => 
          themePreview(themeId)
        )}
      </div>
    </div>
  );
}