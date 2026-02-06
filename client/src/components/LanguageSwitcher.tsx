import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages, type Language } from '@/locales';

interface LanguageSwitcherProps {
  variant?: 'floating' | 'inline';
}

export function LanguageSwitcher({ variant = 'floating' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const handleToggle = () => {
    const currentIndex = languages.findIndex(lang => lang.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  if (variant === 'inline') {
    return (
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/5 hover:border-primary/30 transition-all"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{currentLanguage?.flag} {currentLanguage?.name}</span>
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleToggle}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-card border border-white/10 backdrop-blur-md shadow-lg flex items-center justify-center hover:border-primary/30 transition-all"
      title={currentLanguage?.name}
    >
      <span className="text-2xl">{currentLanguage?.flag}</span>
    </motion.button>
  );
}