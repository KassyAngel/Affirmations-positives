import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme, type ThemeId } from '@/contexts/ThemeContext';
import { languages } from '@/locales';

interface LanguageSwitcherProps {
  variant?: 'header' | 'inline' | 'floating';
}

// Thèmes à fond CLAIR — le bouton doit être sombre pour contraster
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

export function LanguageSwitcher({ variant = 'header' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const { themeId } = useTheme();

  const isLightTheme = LIGHT_THEMES.includes(themeId);

  const handleToggle = () => {
    const currentIndex = languages.findIndex(lang => lang.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  const currentLanguage = languages.find(lang => lang.code === language);
  const nextLanguage = languages[(languages.findIndex(l => l.code === language) + 1) % languages.length];

  // ── Styles adaptatifs : toujours contrasté quelle que soit la luminosité ──
  const headerStyleLight = {
    background: 'rgba(0, 0, 0, 0.07)',
    border: '1.5px solid rgba(0, 0, 0, 0.15)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    backdropFilter: 'blur(8px)',
  };

  const headerStyleDark = {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1.5px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(12px)',
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/5 hover:border-primary/30 transition-all"
      >
        <span className="text-sm">{currentLanguage?.flag}</span>
        <span className="text-sm font-medium">{currentLanguage?.name}</span>
      </button>
    );
  }

  if (variant === 'floating') {
    return (
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}
        title={`Switch to ${nextLanguage?.name}`}
      >
        <span className="text-base leading-none">{currentLanguage?.flag}</span>
      </motion.button>
    );
  }

  // variant === 'header' — style adaptatif clair/sombre
  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
      style={isLightTheme ? headerStyleLight : headerStyleDark}
      title={`Switch to ${nextLanguage?.name}`}
    >
      <span className="text-lg leading-none">{currentLanguage?.flag}</span>
    </motion.button>
  );
}

export default LanguageSwitcher;