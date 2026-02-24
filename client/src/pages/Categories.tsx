import { useLocation } from 'wouter';
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { usePremium } from '@/hooks/use-premium';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuoteCounts } from '@/hooks/use-quote-counts';
import { motion } from 'framer-motion';
import {
  Briefcase, Heart, Dumbbell, Star,
  LifeBuoy, HeartCrack, BookOpen, Trophy,
} from 'lucide-react';

const FREE_CATEGORIES = ['work', 'love', 'confidence', 'support'];
const PREMIUM_CATEGORIES = ['sport', 'breakup', 'philosophy', 'success'];

const CATEGORIES = [
  {
    id: 'work',
    icon: Briefcase,
    accent: '#E07B5A',        // terre cuite
    bgFrom: '#FFF3EE',
    bgTo: '#FFE8DC',
    quote: { fr: '"Le travail est la clé de tout succès."', en: '"Work is the key to all success."' },
    premium: false,
  },
  {
    id: 'love',
    icon: Heart,
    accent: '#D4657A',        // rose saumon profond
    bgFrom: '#FFF0F2',
    bgTo: '#FFE0E6',
    quote: { fr: '"Aimer, c\'est se donner entièrement."', en: '"To love is to give yourself entirely."' },
    premium: false,
  },
  {
    id: 'sport',
    icon: Dumbbell,
    accent: '#C97B30',        // ambre chaud
    bgFrom: '#FFF8EE',
    bgTo: '#FFECD4',
    quote: { fr: '"Le corps accomplit ce que l\'esprit croit."', en: '"The body achieves what the mind believes."' },
    premium: true,
  },
  {
    id: 'confidence',
    icon: Star,
    accent: '#3A9E6F',        // vert sauge
    bgFrom: '#F0FBF5',
    bgTo: '#D8F3E6',
    quote: { fr: '"Crois en toi et tu seras invincible."', en: '"Believe in yourself and you will be unstoppable."' },
    premium: false,
  },
  {
    id: 'support',
    icon: LifeBuoy,
    accent: '#5580C8',        // bleu ardoise
    bgFrom: '#F0F5FF',
    bgTo: '#DAE5FF',
    quote: { fr: '"Tu n\'es jamais seul dans cette bataille."', en: '"You are never alone in this fight."' },
    premium: false,
  },
  {
    id: 'breakup',
    icon: HeartCrack,
    accent: '#9B6BB5',        // mauve
    bgFrom: '#F8F0FF',
    bgTo: '#EBD8FF',
    quote: { fr: '"Chaque fin est un nouveau commencement."', en: '"Every ending is a new beginning."' },
    premium: true,
  },
  {
    id: 'philosophy',
    icon: BookOpen,
    accent: '#B08040',        // or chaud
    bgFrom: '#FFFBF0',
    bgTo: '#FFF0CC',
    quote: { fr: '"Connais-toi toi-même."', en: '"Know thyself."' },
    premium: true,
  },
  {
    id: 'success',
    icon: Trophy,
    accent: '#3AABB0',        // teal
    bgFrom: '#F0FAFA',
    bgTo: '#CCF0F2',
    quote: { fr: '"Tomber 7 fois, se relever 8."', en: '"Fall 7 times, rise 8."' },
    premium: true,
  },
];

export default function Categories() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const { data: counts, isLoading } = useQuoteCounts();
  const { isPremium } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleCategoryClick = (categoryId: string, isPremiumCategory: boolean) => {
    if (isPremiumCategory && !isPremium()) {
      setShowPaywall(true);
      return;
    }
    setLocation(`/?category=${categoryId}`);
  };

  return (
    <div
      className="min-h-screen pb-28"
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
          const Icon = category.icon;
          const count = counts?.[category.id] || 0;
          const label = t.categories[category.id as keyof typeof t.categories] as string;
          const quoteWord = count === 1 ? t.categories.quote : t.categories.quotes;
          const quoteText = language === 'fr' ? category.quote.fr : category.quote.en;
          const isLocked = category.premium && !isPremium();

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.06, type: 'spring', stiffness: 200, damping: 18 }}
              whileHover={{ scale: isLocked ? 1.01 : 1.035, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCategoryClick(category.id, category.premium)}
              className="relative overflow-hidden rounded-2xl text-left flex flex-col"
              style={{
                height: '188px',
                background: `linear-gradient(145deg, ${category.bgFrom} 0%, ${category.bgTo} 100%)`,
                border: `1.5px solid ${category.accent}28`,
                boxShadow: `0 2px 16px ${category.accent}18`,
              }}
            >
              {/* Glow décoratif en haut à droite */}
              <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl"
                style={{ background: `${category.accent}22` }}
              />

              {/* Ligne accent en haut */}
              <div
                className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${category.accent}60, transparent)` }}
              />

              {/* Badge Premium */}
              {isLocked && (
                <div
                  className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #FF8C69, #FFA882)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(255,140,105,0.35)',
                  }}
                >
                  ⭐ Premium
                </div>
              )}

              <div className="relative z-10 p-4 flex flex-col h-full">
                {/* Icône */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shadow-sm"
                  style={{
                    background: `${category.accent}18`,
                    border: `1px solid ${category.accent}30`,
                  }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: category.accent }} />
                </div>

                {/* Citation */}
                <p
                  className="text-xs leading-relaxed italic flex-1 line-clamp-3"
                  style={{ color: `${category.accent}B0` }}
                >
                  {quoteText}
                </p>

                {/* Footer carte */}
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: `1px solid ${category.accent}20` }}
                >
                  <p
                    className="font-bold text-sm leading-tight"
                    style={{ color: '#2D1A12' }}
                  >
                    {label}
                  </p>
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: `${category.accent}90` }}>
                    {isLoading
                      ? '...'
                      : isLocked
                      ? <><span>🔒</span> Premium</>
                      : `${count} ${quoteWord}`}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <Navigation />

      <PremiumPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="category_locked"
      />
    </div>
  );
}