import { useLocation } from 'wouter';
import { useState } from 'react';

import { PremiumPaywall } from '@/components/PremiumPaywall';
import { usePremium } from '@/hooks/use-premium';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuoteCounts } from '@/hooks/use-quote-counts';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const BASE = '/themes/webp/mobile';

const CATEGORIES = [
  { id: 'work',        image: `${BASE}/work.webp`,        premium: false },
  { id: 'love',        image: `${BASE}/love.webp`,        premium: false },
  { id: 'confidence',  image: `${BASE}/confidence.webp`,  premium: false },
  { id: 'support',     image: `${BASE}/support.webp`,     premium: false },
  { id: 'gratitude',   image: `${BASE}/gratitude.webp`,   premium: false },
  { id: 'wellness',    image: `${BASE}/bienetre.webp`,    premium: false },
  { id: 'sport',       image: `${BASE}/sport.webp`,       premium: true  },
  { id: 'breakup',     image: `${BASE}/breakup.webp`,     premium: true  },
  { id: 'philosophy',  image: `${BASE}/philosophy.webp`,  premium: true  },
  { id: 'success',     image: `${BASE}/success.webp`,     premium: true  },
  { id: 'family',      image: `${BASE}/family.webp`,      premium: true  },
  { id: 'femininity',  image: `${BASE}/femininity.webp`,  premium: true  },
  { id: 'letting-go',  image: `${BASE}/letting-go.webp`,  premium: true  },
];

export default function Categories() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { data: counts, isLoading } = useQuoteCounts();
  const { isPremium } = usePremium();
  const userIsPremium = isPremium();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleCategoryClick = (categoryId: string, isPremiumCategory: boolean) => {
    if (isPremiumCategory && !userIsPremium) {
      setShowPaywall(true);
      return;
    }
    setLocation(`/?category=${categoryId}`);
  };

  return (
    <div
      className="min-h-screen pb-36"
      style={{ background: 'linear-gradient(160deg, #FFF5F0 0%, #FFF0E8 50%, #FFF8F5 100%)' }}
    >
      <header className="px-6 pt-10 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl font-display font-bold leading-tight" style={{ color: '#2D1A12' }}>
              {t.categories.title}
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#B07060' }}>
              {t.categories.subtitle}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setLocation('/')}
            className="mt-1 w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,140,105,0.12)', border: '1px solid rgba(255,140,105,0.25)' }}
          >
            <X className="w-4 h-4" style={{ color: '#FF8C69' }} />
          </motion.button>
        </motion.div>
      </header>

      <div className="px-4 grid grid-cols-2 gap-3">
        {CATEGORIES.map((category, index) => {
          const count     = counts?.[category.id] || 0;
          const label     = t.categories[category.id as keyof typeof t.categories] as string;
          const quoteWord = count === 1 ? t.categories.quote : t.categories.quotes;
          const isLocked  = category.premium && !userIsPremium;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 18 }}
              whileHover={{ scale: isLocked ? 1.01 : 1.035, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCategoryClick(category.id, category.premium)}
              className="relative overflow-hidden rounded-2xl text-left flex flex-col"
              style={{ height: '188px' }}
            >
              <img src={category.image} alt={label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.58) 100%)' }} />
              {isLocked && (
                <div
                  className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #D4657A, #E8849A)', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                >
                  ⭐ Premium
                </div>
              )}
              <div className="relative z-10 p-4 flex flex-col h-full justify-end">
                <p className="font-bold text-sm leading-tight" style={{ color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                  {label}
                </p>
                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {isLoading ? '...' : isLocked ? <><span>🔒</span> Premium</> : `${count} ${quoteWord}`}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/*
        ✅ FIX : suppression du bloc qui existait avant :

          {showPaywall && (
            <>
              <motion.button     ← CE BOUTON ÉTAIT LE PROBLÈME
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowPaywall(false)}
                className="fixed top-5 right-5 z-[60] ..."   ← z-[60] par-dessus le paywall z-[200] sur Samsung
              >
                <span>✕</span>
              </motion.button>
              <PremiumPaywall ... />
            </>
          )}

        Ce bouton fixed z-[60] créait un stacking context isolé sur Samsung One UI
        qui s'affichait visuellement AU-DESSUS du PremiumPaywall malgré un z-index plus bas,
        à cause des animations Framer Motion (initial/animate crée un stacking context).

        Solution : on rend PremiumPaywall directement, sans wrapper, sans bouton externe.
        Le paywall possède déjà son propre bouton X en haut à droite.
      */}
      <PremiumPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="category_locked"
      />
    </div>
  );
}