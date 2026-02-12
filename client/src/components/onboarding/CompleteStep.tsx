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
              className="absolute rounded-full border-2 border-emerald-200"
              style={{
                inset: `-${(i + 1) * 12}px`,
              }}
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}

          <motion.div
            className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-200/60"
            animate={{
              boxShadow: [
                '0 0 20px rgba(110, 231, 183, 0.4)',
                '0 0 40px rgba(110, 231, 183, 0.7)',
                '0 0 20px rgba(110, 231, 183, 0.4)',
              ]
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
        className="text-5xl font-display font-bold text-rose-900 mb-4 mt-8"
      >
        {t.onboarding.complete.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-emerald-600 mb-3 font-light"
      >
        {t.onboarding.complete.subtitle}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-rose-800/70 mb-12 max-w-sm mx-auto leading-relaxed"
      >
        {t.onboarding.complete.description}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={onComplete}
        className="w-full px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-full font-semibold text-lg shadow-lg shadow-emerald-200/60 hover:shadow-xl hover:shadow-emerald-300/60 transition-all duration-300 hover:scale-105"
      >
        {t.onboarding.complete.start}
      </motion.button>

      {/* Confettis rose/pink */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            background: `hsl(${Math.random() * 40 + 320}, 70%, ${Math.random() * 20 + 60}%)`,
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