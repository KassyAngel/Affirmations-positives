import { motion } from 'framer-motion';
import { Heart, Share2, Quote as QuoteIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDeviceType } from '@/hooks/use-device-type';
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
  const device = useDeviceType();

  const displayContent = language === 'en' && quote.contentEn ? quote.contentEn : quote.content;

  const handleShare = async () => {
    const shareText = `"${displayContent}" - ${quote.author}`;
    if (navigator.share) {
      try { await navigator.share({ title: t.home.shareTitle, text: shareText, url: window.location.href }); }
      catch (err) { console.error('Error sharing', err); }
    } else {
      try { await navigator.clipboard.writeText(shareText); alert(t.home.quoteCopied); }
      catch (err) { console.error('Error copying', err); }
    }
  };

  const cardStyle = {
    background: theme.cardClass.includes('bg-white') ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
  };

  const ActionButtons = ({ size }: { size: 'sm' | 'lg' }) => (
    <div className={`flex justify-center ${size === 'lg' ? 'gap-8' : 'gap-6'}`}>
      <button
        onClick={onToggleFavorite}
        className={`${size === 'lg' ? 'p-4' : 'p-3'} rounded-full transition-all active:scale-95 hover:scale-110 shadow-lg`}
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <Heart className={`${size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'} transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : theme.textClass}`} />
      </button>
      <button
        onClick={handleShare}
        className={`${size === 'lg' ? 'p-4' : 'p-3'} rounded-full transition-all active:scale-95 hover:scale-110 shadow-lg`}
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <Share2 className={`${size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'} ${theme.textClass}`} />
      </button>
    </div>
  );

  // ─── 📱 MOBILE — identique à l'original qui fonctionnait bien ───────────────
  if (device === 'mobile') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl"
        style={{ ...cardStyle, aspectRatio: '4/5' }}
      >
        {quote.backgroundImage && (
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${quote.backgroundImage})` }} />
        )}
        <div className="relative h-full flex flex-col justify-between p-7 z-10">
          <div className="flex justify-between items-start">
            <QuoteIcon className={`w-9 h-9 ${theme.textClass} opacity-40`} />
            <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
              style={{ background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', backdropFilter: 'blur(12px)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {t.categories[quote.category as keyof typeof t.categories] || quote.category}
            </span>
          </div>
          <div className="space-y-4 text-center my-auto">
            <h2 className={`font-display font-bold text-xl leading-tight drop-shadow-lg ${theme.textClass}`}>
              "{displayContent}"
            </h2>
            <div className="w-10 h-1 mx-auto rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
            <p className={`font-sans font-medium text-sm ${theme.textClass} opacity-90 uppercase tracking-wide`}>
              {quote.author}
            </p>
          </div>
          <ActionButtons size="sm" />
        </div>
      </motion.div>
    );
  }

  // ─── 📟 TABLETTE & DESKTOP — carte large format paysage ─────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl"
      style={{
        ...cardStyle,
        width: device === 'desktop' ? '680px' : '580px',
        height: device === 'desktop' ? '420px' : '380px',
      }}
    >
      {quote.backgroundImage && (
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${quote.backgroundImage})` }} />
      )}
      <div className="relative h-full flex flex-col justify-between p-10 z-10">
        <div className="flex justify-between items-start">
          <QuoteIcon className={`w-12 h-12 ${theme.textClass} opacity-40`} />
          <span className="px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg"
            style={{ background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', backdropFilter: 'blur(12px)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {t.categories[quote.category as keyof typeof t.categories] || quote.category}
          </span>
        </div>
        <div className="space-y-5 text-center my-auto px-4">
          <h2 className={`font-display font-bold text-3xl leading-snug drop-shadow-lg ${theme.textClass}`}>
            "{displayContent}"
          </h2>
          <div className="w-14 h-1 mx-auto rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <p className={`font-sans font-medium text-lg ${theme.textClass} opacity-90 uppercase tracking-widest`}>
            {quote.author}
          </p>
        </div>
        <ActionButtons size="lg" />
      </div>
    </motion.div>
  );
}