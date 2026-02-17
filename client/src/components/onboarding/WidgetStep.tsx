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
        className="absolute top-6 left-6 text-rose-400 hover:text-rose-600 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-3 pt-4"
      >
        <h2 className="text-3xl font-display font-bold text-rose-900 leading-tight">
          {t.onboarding.widget.title}
        </h2>
        <p className="text-rose-600/80 text-sm leading-relaxed max-w-sm mx-auto">
          {t.onboarding.widget.subtitle}
        </p>
      </motion.div>

      {/* Maquette téléphone — votre design original */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mx-auto w-56 h-80 bg-gradient-to-b from-rose-100 to-pink-100 rounded-[2.5rem] border-4 border-rose-200 p-4 shadow-xl shadow-rose-100/60"
      >
        {/* Encoche */}
        <div className="w-12 h-1.5 bg-rose-200 rounded-full mx-auto mb-6" />

        {/* Widget preview animé */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-rose-900 text-sm font-medium shadow-md border border-rose-100 mb-5"
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-300 to-pink-400" />
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">
              {language === 'fr' ? 'Citation du jour' : 'Quote of the day'}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-rose-800">
            {language === 'fr'
              ? 'Vous êtes plus fort que vous ne le pensez.'
              : 'You are stronger than you think.'}
          </p>
        </motion.div>

        {/* Icônes d'applications */}
        <div className="grid grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-white/60 rounded-xl border border-rose-100" />
          ))}
        </div>
      </motion.div>

      {/* Instructions Android */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-rose-100 text-left space-y-2"
      >
        <p className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-1">
          🤖 {language === 'fr' ? 'Comment installer (Android)' : 'How to install (Android)'}
        </p>
        {[
          language === 'fr' ? '① Appuyez longtemps sur votre écran d\'accueil' : '① Long press your home screen',
          language === 'fr' ? '② Sélectionnez "Widgets"' : '② Select "Widgets"',
          language === 'fr' ? '③ Cherchez "Affirmations Positives"' : '③ Find "Affirmations Positives"',
          language === 'fr' ? '④ Faites glisser sur l\'écran — Terminé ! 🎉' : '④ Drag to screen — Done! 🎉',
        ].map((step, i) => (
          <p key={i} className="text-xs text-rose-700">{step}</p>
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
          className="w-full py-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-semibold text-lg shadow-lg shadow-rose-200/60 hover:shadow-xl hover:shadow-rose-300/60 transition-all duration-300 hover:scale-105"
        >
          {language === 'fr' ? "J'ai compris !" : 'Got it!'}
        </button>
        <button
          onClick={onContinue}
          className="block w-full text-center text-rose-400 hover:text-rose-600 text-sm transition-colors"
        >
          {language === 'fr' ? 'Me rappeler plus tard' : 'Remind me later'}
        </button>
      </motion.div>
    </div>
  );
}