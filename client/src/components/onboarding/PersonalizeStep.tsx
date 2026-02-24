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
        className="absolute top-6 left-6 transition-colors"
        style={{ color: '#FF8C69' }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-8 flex justify-center"
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #FFA882, #FF8C69)',
            boxShadow: '0 12px 32px rgba(255,140,105,0.30)',
          }}
        >
          <Settings className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl font-display font-bold mb-2"
        style={{ color: '#2D1A12' }}
      >
        {t.onboarding.personalize.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl mb-4 font-light"
        style={{ color: '#FF8C69' }}
      >
        {t.onboarding.personalize.subtitle}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12 max-w-sm mx-auto leading-relaxed"
        style={{ color: 'rgba(122,64,48,0.70)' }}
      >
        {t.onboarding.personalize.description}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onContinue}
        className="w-full px-8 py-4 text-white rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(to right, #FF8C69, #FFA882)',
          boxShadow: '0 8px 24px rgba(255,140,105,0.35)',
        }}
      >
        {t.onboarding.personalize.continue}
      </motion.button>
    </div>
  );
}