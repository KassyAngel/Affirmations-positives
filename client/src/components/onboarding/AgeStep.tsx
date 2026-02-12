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
        className="absolute top-6 left-6 text-rose-400 hover:text-rose-600 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-display font-bold text-rose-900 mb-10 text-center"
      >
        {t.onboarding.age.title}
      </motion.h1>

      <div className="space-y-3">
        {ageRanges.map((range, index) => (
          <motion.button
            key={range.key}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => onSelect(range.key)}
            className={`w-full px-6 py-4 bg-white/80 backdrop-blur-sm border rounded-2xl text-left font-medium transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md ${
              value === range.key
                ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-rose-100'
                : 'border-rose-100 text-rose-900 hover:border-rose-300 hover:bg-white'
            }`}
          >
            {range.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}