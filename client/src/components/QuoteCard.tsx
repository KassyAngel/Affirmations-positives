import { motion } from 'framer-motion';
import { Heart, Share2, Quote as QuoteIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { Quote } from '@shared/schema';

interface QuoteCardProps {
  quote: Quote;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  categoryColors: string;
}

export function QuoteCard({ quote, isFavorite, onToggleFavorite, categoryColors }: QuoteCardProps) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  // Choisir le contenu selon la langue
  const displayContent = language === 'en' && quote.contentEn ? quote.contentEn : quote.content;

  const handleShare = async () => {
    const shareText = `"${displayContent}" - ${quote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.home.shareTitle,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert(t.home.quoteCopied);
      } catch (err) {
        console.error('Error copying to clipboard', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="relative w-full aspect-[4/5] sm:aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl"
      style={{
        // Fond semi-transparent qui s'adapte au thème
        background: `${theme.cardClass.includes('bg-white') 
          ? 'rgba(255, 255, 255, 0.15)' 
          : 'rgba(0, 0, 0, 0.2)'}`,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Image de fond si présente */}
      {quote.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${quote.backgroundImage})` }}
        />
      )}

      {/* Contenu */}
      <div className="relative h-full flex flex-col justify-between p-8 sm:p-12 z-10">
        <div className="flex justify-between items-start">
          <QuoteIcon className={`w-10 h-10 ${theme.textClass} opacity-40 drop-shadow-lg`} />

          {/* ✨ Badge de catégorie PLUS VISIBLE */}
          <span 
            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              border: '1.5px solid',
              color: 'white',
              backdropFilter: 'blur(12px)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            {t.categories[quote.category as keyof typeof t.categories] || quote.category}
          </span>
        </div>

        <div className="space-y-6 text-center my-auto">
          <h2 className={`font-display font-bold text-2xl sm:text-3xl md:text-4xl ${theme.textClass} leading-tight drop-shadow-lg`}>
            "{displayContent}"
          </h2>
          <div 
            className="w-12 h-1 mx-auto rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.4)' }}
          />
          <p className={`font-sans font-medium ${theme.textClass} opacity-90 text-lg uppercase tracking-wide drop-shadow-md`}>
            {quote.author}
          </p>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={onToggleFavorite}
            className="p-3 rounded-full transition-all active:scale-95 hover:scale-110 group shadow-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={`w-6 h-6 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : theme.textClass}`} 
            />
          </button>
          <button
            onClick={handleShare}
            className="p-3 rounded-full transition-all active:scale-95 hover:scale-110 shadow-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
            aria-label="Share quote"
          >
            <Share2 className={`w-6 h-6 ${theme.textClass}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}