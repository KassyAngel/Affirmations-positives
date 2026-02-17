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

// ✅ Catégories gratuites et premium
const FREE_CATEGORIES = ['work', 'love', 'confidence', 'support'];
const PREMIUM_CATEGORIES = ['sport', 'breakup', 'philosophy', 'success'];

const CATEGORIES = [
  {
    id: 'work',
    icon: Briefcase,
    color: '#7eb8d4',
    quote: { fr: '"Le travail est la clé de tout succès."', en: '"Work is the key to all success."' },
    premium: false,
  },
  {
    id: 'love',
    icon: Heart,
    color: '#e8a0b8',
    quote: { fr: '"Aimer, c\'est se donner entièrement."', en: '"To love is to give yourself entirely."' },
    premium: false,
  },
  {
    id: 'sport',
    icon: Dumbbell,
    color: '#e8c07a',
    quote: { fr: '"Le corps accomplit ce que l\'esprit croit."', en: '"The body achieves what the mind believes."' },
    premium: true, // 💎
  },
  {
    id: 'confidence',
    icon: Star,
    color: '#80c8a0',
    quote: { fr: '"Crois en toi et tu seras invincible."', en: '"Believe in yourself and you will be unstoppable."' },
    premium: false,
  },
  {
    id: 'support',
    icon: LifeBuoy,
    color: '#a0a8e8',
    quote: { fr: '"Tu n\'es jamais seul dans cette bataille."', en: '"You are never alone in this fight."' },
    premium: false,
  },
  {
    id: 'breakup',
    icon: HeartCrack,
    color: '#c8a0d8',
    quote: { fr: '"Chaque fin est un nouveau commencement."', en: '"Every ending is a new beginning."' },
    premium: true, // 💎
  },
  {
    id: 'philosophy',
    icon: BookOpen,
    color: '#d4b87a',
    quote: { fr: '"Connais-toi toi-même."', en: '"Know thyself."' },
    premium: true, // 💎
  },
  {
    id: 'success',
    icon: Trophy,
    color: '#70c8c8',
    quote: { fr: '"Tomber 7 fois, se relever 8."', en: '"Fall 7 times, rise 8."' },
    premium: true, // 💎
  },
];

export default function Categories() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const { data: counts, isLoading } = useQuoteCounts();
  const { isPremium } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleCategoryClick = (categoryId: string, isPremiumCategory: boolean) => {
    // Vérifier si la catégorie est premium
    if (isPremiumCategory && !isPremium()) {
      setShowPaywall(true);
      return;
    }

    // Naviguer vers la catégorie
    setLocation(`/?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">

      <header className="px-6 py-8">
        <h1 className="text-3xl font-display font-bold">{t.categories.title}</h1>
        <p className="text-muted-foreground mt-2">{t.categories.subtitle}</p>
      </header>

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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.06, type: 'spring', stiffness: 180 }}
              whileHover={{ scale: isLocked ? 1.01 : 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCategoryClick(category.id, category.premium)}
              className="relative overflow-hidden rounded-2xl text-left flex flex-col"
              style={{
                height: '180px',
                background: '#1a1a2a',
                border: `1.5px solid ${category.color}60`,
                boxShadow: `0 4px 24px ${category.color}25, inset 0 1px 0 ${category.color}30`,
                opacity: isLocked ? 0.7 : 1,
              }}
            >
              {/* Badge Premium si bloqué */}
              {isLocked && (
                <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#fff' }}>
                  ⭐ Premium
                </div>
              )}

              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${category.color}80, transparent)` }}
              />
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30"
                style={{ background: category.color }}
              />

              <div className="relative z-10 p-4 flex flex-col h-full">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${category.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: category.color }} />
                </div>

                <p
                  className="text-xs leading-relaxed italic flex-1"
                  style={{ color: `${category.color}99` }}
                >
                  {quoteText}
                </p>

                <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${category.color}20` }}>
                  <p className="font-bold text-sm text-white leading-tight">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: `${category.color}70` }}>
                    {isLoading ? '...' : isLocked ? '🔒 Premium' : `${count} ${quoteWord}`}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <Navigation />

      {/* Premium Paywall */}
      <PremiumPaywall 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)}
        trigger="category_locked"
      />
    </div>
  );
}