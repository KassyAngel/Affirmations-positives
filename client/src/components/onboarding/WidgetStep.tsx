import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface WidgetStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function WidgetStep({ onContinue, onBack }: WidgetStepProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-md w-full space-y-8 text-center px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-4"
      >
        <h2 className="text-3xl font-bold">{t.onboarding.widget.title}</h2>
        <p className="text-white/60 leading-relaxed">{t.onboarding.widget.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mx-auto w-64 h-96 bg-slate-800 rounded-[3rem] border-4 border-slate-700 p-4 shadow-2xl"
      >
        <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto mb-8" />
        
        <div className="bg-white/90 rounded-3xl p-6 text-slate-900 text-sm font-medium shadow-lg mb-8">
          Vous êtes plus fort que vous ne le pensez.
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-700/50 rounded-xl" />
          ))}
        </div>
      </motion.div>

      <div className="space-y-3 pt-4">
        <Button 
          onClick={onContinue}
          className="w-full h-14 rounded-full bg-white text-slate-900 hover:bg-white/90 text-lg font-bold"
        >
          Installer le widget
        </Button>
        <button onClick={onContinue} className="text-white/40 hover:text-white text-sm block mx-auto">
          Me rappeler plus tard
        </button>
      </div>
    </div>
  );
}
