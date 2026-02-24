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
      {/* Sélecteur de langue */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full transition-all shadow-sm"
        style={{
          background: 'rgba(255,255,255,0.70)',
          border: '1px solid #FFCBB8',
          color: '#7A4030',
        }}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">{language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
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
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
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
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: '#FFA882',
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos((i * 60 * Math.PI) / 180) * 60],
                y: [0, Math.sin((i * 60 * Math.PI) / 180) * 60],
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
        className="text-5xl font-display font-bold mb-4"
        style={{ color: '#2D1A12' }}
      >
        {t.onboarding.welcome.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl mb-3 font-light"
        style={{ color: '#FF8C69' }}
      >
        {t.onboarding.welcome.subtitle}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-12 max-w-sm mx-auto leading-relaxed"
        style={{ color: 'rgba(122,64,48,0.70)' }}
      >
        {t.onboarding.welcome.description}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={onContinue}
        className="w-full px-8 py-4 text-white rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(to right, #FF8C69, #FFA882)',
          boxShadow: '0 8px 24px rgba(255,140,105,0.35)',
        }}
      >
        {t.onboarding.welcome.continue}
      </motion.button>
    </div>
  );
}