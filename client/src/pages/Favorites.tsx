import { useUserState } from '@/hooks/use-user-state';
import { useQuotes } from '@/hooks/use-quotes';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';

import { QuoteCard } from '@/components/QuoteCard';
import { Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_STYLES: Record<string, string> = {
  work: 'gradient-work',
  love: 'gradient-love',
  sport: 'gradient-sport',
  confidence: 'gradient-confidence',
  support: 'gradient-support',
  breakup: 'gradient-breakup',
  philosophy: 'gradient-philosophy',
  success: 'gradient-success',
  default: 'bg-gradient-to-br from-slate-800 to-slate-900'
};

export default function Favorites() {
  const { state, toggleFavorite } = useUserState();
  const { t } = useLanguage();
  const { data: allQuotes, isLoading } = useQuotes();

  const favoriteQuotes = allQuotes?.filter(q => state.favorites.includes(q.id)) || [];

  const countLabel = favoriteQuotes.length === 1
    ? `1 ${t.favorites.subtitle}`
    : `${favoriteQuotes.length} ${t.favorites.subtitle}`;

  return (
    <div className="min-h-screen bg-background pb-24">

      <header className="px-6 py-8">
        <h1 className="text-3xl font-display font-bold">{t.favorites.title}</h1>
        <p className="text-muted-foreground mt-2">{countLabel}</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : favoriteQuotes.length > 0 ? (
        <div className="px-4 space-y-8">
          {favoriteQuotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
            >
              <QuoteCard
                quote={quote}
                isFavorite={true}
                onToggleFavorite={() => toggleFavorite(quote.id)}
                categoryColors={CATEGORY_STYLES[quote.category] || CATEGORY_STYLES.default}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 px-6 text-center"
        >
          <div className="p-4 bg-secondary/50 rounded-full mb-4">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t.favorites.empty}</h3>
          <p className="text-muted-foreground max-w-xs">
            {t.favorites.emptySubtitle}
          </p>
        </motion.div>
      )}

      <Navigation />
    </div>
  );
}