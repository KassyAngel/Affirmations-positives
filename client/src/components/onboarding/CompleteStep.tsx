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
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 flex justify-center"
      >
        <motion.div
          className="relative w-32 h-32"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Cercles concentriques animés */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-emerald-300/40"
              style={{
                scale: 1 + i * 0.2,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}

          <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-200/50">
            <Check className="w-16 h-16 text-white" strokeWidth={3} />
          </div>
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-5xl font-display font-bold text-rose-900 mb-4"
      >
        {t.onboarding.complete.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-emerald-600 mb-2 font-light"
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
        className="w-full px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-full font-semibold text-lg shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 transition-all duration-300 hover:scale-105"
      >
        {t.onboarding.complete.start}
      </motion.button>

      {/* Confettis */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: `hsl(${Math.random() * 60 + 320}, 70%, 60%)`, // Rose/Pink hues
            top: '50%',
            left: '50%',
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 400],
            y: [0, (Math.random() - 0.5) * 400],
            opacity: [1, 0],
            scale: [1, 0],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}