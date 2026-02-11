import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Settings, ChevronLeft } from 'lucide-react';

interface PersonalizeStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function PersonalizeStep({ onContinue, onBack }: PersonalizeStepProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-md w-full text-center">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-rose-600/70 hover:text-rose-600 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8 flex justify-center"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-200/50">
          <Settings className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl font-display font-bold text-rose-900 mb-2"
      >
        {t.onboarding.personalize.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl text-rose-600 mb-4 font-light"
      >
        {t.onboarding.personalize.subtitle}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-rose-800/70 mb-12 max-w-sm mx-auto leading-relaxed"
      >
        {t.onboarding.personalize.description}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onContinue}
        className="w-full px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-full font-semibold text-lg shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/50 transition-all duration-300 hover:scale-105"
      >
        {t.onboarding.personalize.continue}
      </motion.button>
    </div>
  );
}