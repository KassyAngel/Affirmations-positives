import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, ChevronLeft } from 'lucide-react';

interface ThemeStepProps {
  onSelect: (theme: string) => void;
  onBack: () => void;
}

const THEMES = [
  { id: 'classic', label: 'Classique', color: 'bg-slate-900' },
  { id: 'nature', label: 'Nature', image: '/themes/nature.png' },
  { id: 'ethereal', label: 'Éthéré', image: '/themes/ethereal.png' },
  { id: 'mountain', label: 'Montagne', image: '/themes/mountain.png' },
  { id: 'minimal', label: 'Minimal', color: 'bg-[#f0ece2]', dark: false },
  { id: 'sunset', label: 'Coucher de soleil', image: '/themes/sunset.png' },
];

export function ThemeStep({ onSelect, onBack }: ThemeStepProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState('classic');

  return (
    <div className="max-w-md w-full space-y-6 px-2">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-rose-400 hover:text-rose-600 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center pt-4"
      >
        <h2 className="text-3xl font-display font-bold text-rose-900 leading-tight">
          {t.onboarding.theme.title}
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme, index) => (
          <motion.button
            key={theme.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => setSelected(theme.id)}
            className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
              selected === theme.id
                ? 'border-rose-400 ring-4 ring-rose-200'
                : 'border-rose-100 hover:border-rose-300'
            }`}
          >
            {theme.image ? (
              <img
                src={theme.image}
                alt={theme.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className={`absolute inset-0 ${theme.color}`} />
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-serif ${theme.dark === false ? 'text-slate-800' : 'text-white'}`}>
                Aa
              </span>
            </div>

            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                theme.dark === false
                  ? 'bg-black/10 text-slate-800'
                  : 'bg-black/30 text-white'
              }`}>
                {theme.label}
              </span>
            </div>

            {selected === theme.id && (
              <div className="absolute top-2 right-2 bg-rose-400 rounded-full p-1 shadow-md">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3 pt-2"
      >
        <button
          onClick={() => onSelect(selected)}
          className="w-full py-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-semibold text-lg shadow-lg shadow-rose-200/60 hover:shadow-xl hover:shadow-rose-300/60 transition-all duration-300 hover:scale-105"
        >
          {t.onboarding.complete.start}
        </button>
        <button
          onClick={onBack}
          className="block w-full text-center text-rose-400 hover:text-rose-600 text-sm transition-colors"
        >
          Retour
        </button>
      </motion.div>
    </div>
  );
}