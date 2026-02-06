import { motion } from 'framer-motion';
import { Heart, Share2, Quote as QuoteIcon } from 'lucide-react';
import type { Quote } from '@shared/schema';

interface QuoteCardProps {
  quote: Quote;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  categoryColors: string;
}

export function QuoteCard({ quote, isFavorite, onToggleFavorite, categoryColors }: QuoteCardProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Citation du jour',
          text: `"${quote.content}" - ${quote.author}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`"${quote.content}" - ${quote.author}`);
      alert('Citation copiée !');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full aspect-[4/5] sm:aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl ${categoryColors}`}
    >
      {/* Background Image Layer */}
      {quote.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url(${quote.backgroundImage})` }}
        />
      )}
      
      {/* Decorative Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-between p-8 sm:p-12 z-10">
        <div className="flex justify-between items-start">
          <QuoteIcon className="w-10 h-10 text-white/40" />
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-white/80 border border-white/20">
            {quote.category}
          </span>
        </div>

        <div className="space-y-6 text-center my-auto">
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white leading-tight drop-shadow-md">
            "{quote.content}"
          </h2>
          <div className="w-12 h-1 bg-white/30 mx-auto rounded-full" />
          <p className="font-sans font-medium text-white/80 text-lg uppercase tracking-wide">
            {quote.author}
          </p>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={onToggleFavorite}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 group"
          >
            <Heart 
              className={`w-6 h-6 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`} 
            />
          </button>
          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-95"
          >
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
