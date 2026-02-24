import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft } from 'lucide-react';

interface WidgetStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function WidgetStep({ onContinue, onBack }: WidgetStepProps) {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-md w-full space-y-6 text-center px-2">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 transition-colors"
        style={{ color: '#FF8C69' }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-3 pt-4"
      >
        <h2 className="text-3xl font-display font-bold leading-tight" style={{ color: '#2D1A12' }}>
          {t.onboarding.widget.title}
        </h2>
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: '#B07060' }}>
          {t.onboarding.widget.subtitle}
        </p>
      </motion.div>

      {/* Maquette téléphone */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mx-auto w-56 h-80 rounded-[2.5rem] border-4 p-4 shadow-xl"
        style={{
          background: 'linear-gradient(to bottom, #FFF5F0, #FFE8DC)',
          borderColor: '#FFCBB8',
          boxShadow: '0 20px 40px rgba(255,140,105,0.15)',
        }}
      >
        {/* Encoche */}
        <div className="w-12 h-1.5 rounded-full mx-auto mb-6" style={{ background: '#FFCBB8' }} />

        {/* Widget preview animé */}
        <motion.div
          className="backdrop-blur-sm rounded-2xl p-4 text-sm font-medium shadow-md mb-5"
          style={{
            background: 'rgba(255,255,255,0.90)',
            border: '1px solid #FFE4D9',
            color: '#2D1A12',
          }}
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full" style={{ background: 'linear-gradient(135deg, #FF8C69, #FFA882)' }} />
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#FF8C69' }}>
              {language === 'fr' ? 'Citation du jour' : 'Quote of the day'}
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#7A4030' }}>
            {language === 'fr'
              ? 'Vous êtes plus fort que vous ne le pensez.'
              : 'You are stronger than you think.'}
          </p>
        </motion.div>

        {/* Icônes d'applications */}
        <div className="grid grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl"
              style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid #FFE4D9' }}
            />
          ))}
        </div>
      </motion.div>

      {/* Instructions Android */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-sm rounded-2xl p-4 text-left space-y-2"
        style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid #FFE4D9' }}
      >
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#FF8C69' }}>
          🤖 {language === 'fr' ? 'Comment installer (Android)' : 'How to install (Android)'}
        </p>
        {[
          language === 'fr' ? "① Appuyez longtemps sur votre écran d'accueil" : '① Long press your home screen',
          language === 'fr' ? '② Sélectionnez "Widgets"' : '② Select "Widgets"',
          language === 'fr' ? '③ Cherchez "Affirmations Positives"' : '③ Find "Affirmations Positives"',
          language === 'fr' ? '④ Faites glisser sur l\'écran — Terminé ! 🎉' : '④ Drag to screen — Done! 🎉',
        ].map((step, i) => (
          <p key={i} className="text-xs" style={{ color: '#7A4030' }}>{step}</p>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-3 pt-2"
      >
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-full text-white font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(to right, #FF8C69, #FFA882)',
            boxShadow: '0 8px 24px rgba(255,140,105,0.35)',
          }}
        >
          {language === 'fr' ? "J'ai compris !" : 'Got it!'}
        </button>
        <button
          onClick={onContinue}
          className="block w-full text-center text-sm transition-colors"
          style={{ color: '#B07060' }}
        >
          {language === 'fr' ? 'Me rappeler plus tard' : 'Remind me later'}
        </button>
      </motion.div>
    </div>
  );
}