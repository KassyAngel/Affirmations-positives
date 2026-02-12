import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { THEMES, type ThemeId } from '@/contexts/ThemeContext';
import { Check } from 'lucide-react';

interface ThemeStepProps {
  selectedTheme: ThemeId;
  onThemeSelect: (theme: ThemeId) => void;
  onBack?: () => void;
}

// Mapping des thèmes vers leurs images
const THEME_IMAGES: Record<ThemeId, string> = {
  classic: '/themes/zen.png',
  nature: '/themes/nature.png',
  ethereal: '/themes/ethereal.png',
  mountain: '/themes/zen.png', // Utilise zen.png comme fallback
  minimal: '/themes/zen.png',
  sunset: '/themes/sunset.png',
};

export function ThemeStep({ selectedTheme, onThemeSelect, onBack }: ThemeStepProps) {
  const { t } = useLanguage();

  const themePreview = (themeId: ThemeId) => {
    const theme = THEMES[themeId];
    const imagePath = THEME_IMAGES[themeId];

    return (
      <div
        key={themeId}
        onClick={() => onThemeSelect(themeId)}
        className="relative cursor-pointer group"
      >
        {/* Aperçu du thème avec image */}
        <div
          className={`
            h-32 rounded-2xl border-2 transition-all duration-300 overflow-hidden
            ${selectedTheme === themeId 
              ? 'border-white/80 scale-105 shadow-2xl' 
              : 'border-white/20 hover:border-white/40 hover:scale-102'
            }
          `}
        >
          {/* Image de fond */}
          <div className="relative h-full w-full">
            <img 
              src={imagePath} 
              alt={theme.label}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay avec gradient */}
            <div className={`absolute inset-0 ${theme.bgClass} opacity-60`} />

            {/* Contenu */}
            <div className="relative h-full w-full p-4 flex flex-col justify-between">
              {/* Titre du thème */}
              <div className={`text-sm font-medium ${theme.textClass} drop-shadow-lg`}>
                {theme.label}
              </div>

              {/* Indicateurs visuels */}
              <div className="flex gap-2">
                <div className={`h-2 w-8 rounded-full ${theme.cardClass} backdrop-blur-sm`} />
                <div className={`h-2 w-12 rounded-full ${theme.cardClass} backdrop-blur-sm`} />
                <div className={`h-2 w-6 rounded-full ${theme.cardClass} backdrop-blur-sm`} />
              </div>
            </div>
          </div>
        </div>

        {/* Icône de sélection */}
        {selectedTheme === themeId && (
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
        <h2 className="text-3xl font-display font-bold text-white">
          {t.onboarding.theme.title}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        {(Object.keys(THEMES) as ThemeId[]).map((themeId) => 
          themePreview(themeId)
        )}
      </div>
    </div>
  );
}