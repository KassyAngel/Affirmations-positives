import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft } from 'lucide-react';

interface AgeStepProps {
  value?: string;
  onSelect: (age: string) => void;
  onBack: () => void;
}

export function AgeStep({ value, onSelect, onBack }: AgeStepProps) {
  const { t } = useLanguage();

  const ageRanges = [
    { key: 'young', label: t.onboarding.age.ranges.young },
    { key: 'youngAdult', label: t.onboarding.age.ranges.youngAdult },
    { key: 'adult', label: t.onboarding.age.ranges.adult },
    { key: 'mature', label: t.onboarding.age.ranges.mature },
    { key: 'experienced', label: t.onboarding.age.ranges.experienced },
    { key: 'senior', label: t.onboarding.age.ranges.senior },
  ];

  return (
    <div className="max-w-md w-full">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-white/60 hover:text-white/90 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-display font-bold text-white mb-12 text-center"
      >
        {t.onboarding.age.title}
      </motion.h1>

      <div className="space-y-3">
        {ageRanges.map((range, index) => (
          <motion.button
            key={range.key}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(range.key)}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 text-left font-medium hover:scale-105 hover:border-purple-400/50"
          >
            {range.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}