import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface PremiumBadgeProps {
  onClick?: () => void;
  variant?: 'icon' | 'button' | 'full';
  showText?: boolean;
}

export function PremiumBadge({ onClick, variant = 'icon', showText = true }: PremiumBadgeProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const text = language === 'fr' ? 'Premium' : 'Premium';

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-9 h-9 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
        }}
        title={text}
      >
        <Sparkles className="w-5 h-5 text-white" />

        {/* Glow animé */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 0px rgba(251, 191, 36, 0.4)',
              '0 0 20px rgba(251, 191, 36, 0.6)',
              '0 0 0px rgba(251, 191, 36, 0.4)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    );
  }

  if (variant === 'button') {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-sm"
        style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          boxShadow: '0 4px 16px rgba(251, 191, 36, 0.3)',
        }}
      >
        <Sparkles className="w-4 h-4" />
        {showText && <span>{text}</span>}
      </motion.button>
    );
  }

  // variant === 'full'
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-md"
      style={{
        background: `linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.10) 100%)`,
        border: '2px solid rgba(251, 191, 36, 0.3)',
        boxShadow: '0 4px 20px rgba(251, 191, 36, 0.15)',
      }}
    >
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
      >
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold" style={{ color: '#fbbf24' }}>
          ✨ {text}
        </p>
        <p className="text-xs" style={{ color: theme.textClass === 'text-white' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
          {language === 'fr' ? 'Citations illimitées & plus' : 'Unlimited quotes & more'}
        </p>
      </div>
      <span className="text-base" style={{ color: '#fbbf24' }}>›</span>
    </motion.button>
  );
}