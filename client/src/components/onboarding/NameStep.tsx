import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft } from 'lucide-react';

interface NameStepProps {
  value: string;
  onChange: (name: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function NameStep({ value, onChange, onContinue, onBack }: NameStepProps) {
  const { t } = useLanguage();
  const [localValue, setLocalValue] = useState(value);

  const handleContinue = () => {
    if (localValue.trim()) {
      onChange(localValue.trim());
      onContinue();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  return (
    <div className="max-w-md w-full">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-rose-600/70 hover:text-rose-600 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-display font-bold text-rose-900 mb-12 text-center"
      >
        {t.onboarding.name.title}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t.onboarding.name.placeholder}
          className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-rose-200 rounded-2xl text-rose-900 placeholder:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent text-lg shadow-sm"
          autoFocus
        />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleContinue}
        disabled={!localValue.trim()}
        className="w-full px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-full font-semibold text-lg shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg"
      >
        {t.onboarding.name.continue}
      </motion.button>
    </div>
  );
}