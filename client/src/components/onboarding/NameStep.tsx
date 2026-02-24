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

  return (
    <div className="max-w-md w-full">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 transition-colors"
        style={{ color: '#FF8C69' }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-display font-bold mb-10 text-center"
        style={{ color: '#2D1A12' }}
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
          onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
          placeholder={t.onboarding.name.placeholder}
          className="w-full px-6 py-4 backdrop-blur-sm rounded-2xl text-lg shadow-sm focus:outline-none focus:ring-2"
          style={{
            background: 'rgba(255,255,255,0.80)',
            border: '1px solid #FFCBB8',
            color: '#2D1A12',
            // placeholder color handled via CSS below
          }}
          autoFocus
        />
        <style>{`input::placeholder { color: #FFCBB8; }`}</style>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleContinue}
        disabled={!localValue.trim()}
        className="w-full px-8 py-4 text-white rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{
          background: 'linear-gradient(to right, #FF8C69, #FFA882)',
          boxShadow: '0 8px 24px rgba(255,140,105,0.35)',
        }}
      >
        {t.onboarding.name.continue}
      </motion.button>
    </div>
  );
}