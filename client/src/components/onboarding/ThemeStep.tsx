import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface ThemeStepProps {
  onSelect: (theme: string) => void;
  onBack: () => void;
}

const THEMES = [
  { id: 'classic', label: 'Classique', color: 'bg-slate-900' },
  { id: 'nature', label: 'Nature', image: '/themes/nature.png' },
  { id: 'ethereal', label: 'Éthéré', image: '/themes/ethereal.png' },
  { id: 'mountain', label: 'Montagne', image: '/themes/sunset.png' },
  { id: 'minimal', label: 'Minimal', color: 'bg-[#f0ece2]' },
  { id: 'sunset', label: 'Coucher de soleil', image: '/themes/sunset.png' },
];

export function ThemeStep({ onSelect, onBack }: ThemeStepProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState('classic');

  return (
    <div className="max-w-md w-full space-y-8 text-center px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-2"
      >
        <h2 className="text-3xl font-bold">{t.onboarding.theme.title}</h2>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {THEMES.map((theme, index) => (
          <motion.button
            key={theme.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelected(theme.id)}
            className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${
              selected === theme.id ? 'border-white ring-4 ring-white/10' : 'border-white/5 hover:border-white/20'
            }`}
          >
            {theme.image ? (
              <img src={theme.image} alt={theme.label} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className={`absolute inset-0 ${theme.color}`} />
            )}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-serif ${theme.id === 'minimal' ? 'text-black' : 'text-white'}`}>Aa</span>
            </div>

            {selected === theme.id && (
              <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                <Check className="w-3 h-3 text-slate-900" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="space-y-3 pt-4">
        <Button 
          onClick={() => onSelect(selected)}
          className="w-full h-14 rounded-full bg-white text-slate-900 hover:bg-white/90 text-lg font-bold"
        >
          {t.onboarding.continue}
        </Button>
        <button onClick={onBack} className="text-white/40 hover:text-white text-sm">
          Retour
        </button>
      </div>
    </div>
  );
}
