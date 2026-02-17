import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { languages } from '@/locales';

interface LanguageSwitcherProps {
  variant?: 'header' | 'inline' | 'floating';
}

export function LanguageSwitcher({ variant = 'header' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();

  const handleToggle = () => {
    const currentIndex = languages.findIndex(lang => lang.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  const currentLanguage = languages.find(lang => lang.code === language);
  const nextLanguage = languages[(languages.findIndex(l => l.code === language) + 1) % languages.length];

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

  // variant === 'header'
  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all backdrop-blur-sm ${theme.cardClass}`}
      title={`Switch to ${nextLanguage?.name}`}
    >
      <span className="text-lg leading-none">{currentLanguage?.flag}</span>
    </motion.button>
  );
}

// Export par défaut aussi pour compatibilité
export default LanguageSwitcher;