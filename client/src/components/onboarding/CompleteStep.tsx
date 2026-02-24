import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check } from 'lucide-react';

interface CompleteStepProps {
  onComplete: () => void;
}

export function CompleteStep({ onComplete }: CompleteStepProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-md w-full text-center">
      {/* Icône de validation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-8 flex justify-center"
      >
        <div className="relative">
          {/* Anneaux concentriques */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                inset: `-${(i + 1) * 12}px`,
                border: '2px solid rgba(255,168,130,0.35)',
              }}
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
          <motion.div
            className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #FF8C69, #FFA882)' }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,140,105,0.4)',
                '0 0 40px rgba(255,140,105,0.7)',
                '0 0 20px rgba(255,140,105,0.4)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Check className="w-14 h-14 text-white" strokeWidth={2.5} />
          </motion.div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-5xl font-display font-bold mb-4 mt-8"
        style={{ color: '#2D1A12' }}
      >
        {t.onboarding.complete.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl mb-3 font-light"
        style={{ color: '#FF8C69' }}
      >
        {t.onboarding.complete.subtitle}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-12 max-w-sm mx-auto leading-relaxed"
        style={{ color: 'rgba(122,64,48,0.70)' }}
      >
        {t.onboarding.complete.description}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={onComplete}
        className="w-full px-8 py-4 text-white rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(to right, #FF8C69, #FFA882)',
          boxShadow: '0 8px 24px rgba(255,140,105,0.35)',
        }}
      >
        {t.onboarding.complete.start}
      </motion.button>

      {/* Confettis pêche/orangé */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            background: `hsl(${Math.random() * 30 + 15}, 85%, ${Math.random() * 20 + 60}%)`,
            top: '50%',
            left: '50%',
          }}
          animate={{
            x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 500],
            y: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 500],
            opacity: [1, 0],
            scale: [1, 0],
            rotate: [0, Math.random() * 720 - 360],
          }}
          transition={{
            duration: 1.5 + Math.random() * 1.5,
            delay: Math.random() * 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}