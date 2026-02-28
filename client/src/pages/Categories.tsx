import { useLocation } from 'wouter';
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { usePremium } from '@/hooks/use-premium';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuoteCounts } from '@/hooks/use-quote-counts';
import { motion } from 'framer-motion';

const BASE = '/themes/webp/mobile';

const CATEGORIES = [
  // ── GRATUIT ──
  { id: 'work',        image: `${BASE}/work.webp`,        premium: false },
  { id: 'love',        image: `${BASE}/love.webp`,        premium: false },
  { id: 'confidence',  image: `${BASE}/confidence.webp`,  premium: false },
  { id: 'support',     image: `${BASE}/support.webp`,     premium: false },
  { id: 'gratitude',   image: `${BASE}/gratitude.webp`,   premium: false },
  { id: 'wellness',    image: `${BASE}/bienetre.webp`,     premium: false },
  // ── PREMIUM ──
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

  const { isPremium, tier } = usePremium();
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
      // ✅ pb-36 au lieu de pb-28 pour que la dernière carte ne soit pas coupée
      className="min-h-screen pb-36"
      style={{ background: 'linear-gradient(160deg, #FFF5F0 0%, #FFF0E8 50%, #FFF8F5 100%)' }}
    >
      {/* Header */}
      <header className="px-6 pt-10 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1
            className="text-3xl font-display font-bold leading-tight"
            style={{ color: '#2D1A12' }}
          >
            {t.categories.title}
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#B07060' }}>
            {t.categories.subtitle}
          </p>
        </motion.div>
      </header>

      {/* Grille */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {CATEGORIES.map((category, index) => {
          const count = counts?.[category.id] || 0;
          const label = t.categories[category.id as keyof typeof t.categories] as string;
          const quoteWord = count === 1 ? t.categories.quote : t.categories.quotes;
          const isLocked = category.premium && !userIsPremium;

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
              <img
                src={category.image}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.58) 100%)',
                }}
              />

              {/* Badge Premium */}
              {isLocked && (
                <div
                  className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #D4657A, #E8849A)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  }}
                >
                  ⭐ Premium
                </div>
              )}

              {/* Texte en bas */}
              <div className="relative z-10 p-4 flex flex-col h-full justify-end">
                <p
                  className="font-bold text-sm leading-tight"
                  style={{ color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                >
                  {label}
                </p>
                <p
                  className="text-xs mt-0.5 flex items-center gap-1"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  {isLoading
                    ? '...'
                    : isLocked
                    ? <><span>🔒</span> Premium</>
                    : `${count} ${quoteWord}`}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <Navigation />

      {/* ✅ PremiumPaywall avec overlay cliquable pour fermer */}
      {showPaywall && (
        <>
          {/* Croix de fermeture flottante */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowPaywall(false)}
            className="fixed top-5 right-5 z-[60] flex items-center justify-center w-9 h-9 rounded-full shadow-lg"
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <span className="text-lg font-bold leading-none" style={{ color: '#7A4030' }}>✕</span>
          </motion.button>

          <PremiumPaywall
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            trigger="category_locked"
          />
        </>
      )}
    </div>
  );
}