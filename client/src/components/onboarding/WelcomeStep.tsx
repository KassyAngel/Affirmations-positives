import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Globe } from 'lucide-react';

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="max-w-md w-full text-center">
      {/* Sélecteur de langue adapté au fond clair */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-rose-200 rounded-full text-rose-700 hover:bg-white transition-all shadow-sm"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
      </motion.button>

      {/* Icône centrale */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-8 flex justify-center"
      >
        <div className="relative">
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center shadow-xl shadow-rose-200/60"
            animate={{
              boxShadow: [
                '0 0 20px rgba(253, 164, 175, 0.4)',
                '0 0 40px rgba(253, 164, 175, 0.7)',
                '0 0 20px rgba(253, 164, 175, 0.4)',
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-rose-300 rounded-full"
              style={{ top: '50%', left: '50%' }}
              animate={{
                x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
                y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
                opacity: [0.8, 0],
                scale: [1, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: 'easeOut' }}
            />
          ))}
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-5xl font-display font-bold text-rose-900 mb-4"
      >
        {t.onboarding.welcome.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-rose-600 mb-3 font-light"
      >
        {t.onboarding.welcome.subtitle}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-rose-800/70 mb-12 max-w-sm mx-auto leading-relaxed"
      >
        {t.onboarding.welcome.description}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={onContinue}
        className="w-full px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-full font-semibold text-lg shadow-lg shadow-rose-200/60 hover:shadow-xl hover:shadow-rose-300/60 transition-all duration-300 hover:scale-105"
      >
        {t.onboarding.welcome.continue}
      </motion.button>
    </div>
  );
}