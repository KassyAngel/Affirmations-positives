import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft } from 'lucide-react';

interface GenderStepProps {
  value?: string;
  onSelect: (gender: string) => void;
  onBack: () => void;
}

export function GenderStep({ value, onSelect, onBack }: GenderStepProps) {
  const { t } = useLanguage();

  const genderOptions = [
    { key: 'female', label: t.onboarding.gender.options.female },
    { key: 'male', label: t.onboarding.gender.options.male },
    { key: 'other', label: t.onboarding.gender.options.other },
    { key: 'preferNot', label: t.onboarding.gender.options.preferNot },
  ];

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
        {t.onboarding.gender.title}
      </motion.h1>

      <div className="space-y-3">
        {genderOptions.map((option, index) => (
          <motion.button
            key={option.key}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(option.key)}
            className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-rose-200 rounded-2xl text-rose-900 hover:bg-white hover:border-rose-300 transition-all duration-300 text-left font-medium hover:scale-105 shadow-sm hover:shadow-md"
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}