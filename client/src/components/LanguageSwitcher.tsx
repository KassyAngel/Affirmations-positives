import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { languages } from '@/locales';

interface LanguageSwitcherProps {
  variant?: 'header' | 'inline';
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

  // variant === 'header' : petit bouton compact pour le header
  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all
        ${theme.cardClass}
      `}
      title={`Passer en ${nextLanguage?.name}`}
      aria-label={`Langue actuelle : ${currentLanguage?.name}. Cliquer pour passer en ${nextLanguage?.name}`}
    >
      <span className="text-base leading-none">{currentLanguage?.flag}</span>
      <span className={`text-xs font-bold uppercase tracking-wider ${theme.textClass}`}>
        {currentLanguage?.code.toUpperCase()}
      </span>
    </motion.button>
  );
}