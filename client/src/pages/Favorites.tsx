import { useLocation } from 'wouter';
import { useUserState } from '@/hooks/use-user-state';
import { useQuotes } from '@/hooks/use-quotes';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Loader2, Heart, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_CONFIG: Record<string, { accent: string; bgFrom: string; bgTo: string; label: { fr: string; en: string } }> = {
  work:         { accent: '#C96A5A', bgFrom: '#FFF3EE', bgTo: '#FFE8DC', label: { fr: 'Carrière',        en: 'Career'          } },
  love:         { accent: '#C4607A', bgFrom: '#FFF0F2', bgTo: '#FFE0E6', label: { fr: 'Amour',            en: 'Love'            } },
  sport:        { accent: '#B87040', bgFrom: '#FFF8EE', bgTo: '#FFECD4', label: { fr: 'Énergie & Sport',  en: 'Energy & Sport'  } },
  confidence:   { accent: '#B8607A', bgFrom: '#FFF0F2', bgTo: '#FFE0E6', label: { fr: 'Confiance en soi', en: 'Self-confidence' } },
  support:      { accent: '#A06080', bgFrom: '#FDF0F5', bgTo: '#F5D8E8', label: { fr: 'Stress & Anxiété', en: 'Stress & Anxiety'} },
  breakup:      { accent: '#A05870', bgFrom: '#FDF0F4', bgTo: '#F5D8E4', label: { fr: 'Rupture',          en: 'Heartbreak'      } },
  philosophy:   { accent: '#A07850', bgFrom: '#FFFBF0', bgTo: '#FFF0CC', label: { fr: 'Sagesse',          en: 'Wisdom'          } },
  success:      { accent: '#B86870', bgFrom: '#FFF0F2', bgTo: '#FFE0E6', label: { fr: 'Bonheur',          en: 'Happiness'       } },
  gratitude:    { accent: '#C47A5A', bgFrom: '#FFF5EE', bgTo: '#FFEADC', label: { fr: 'Gratitude',        en: 'Gratitude'       } },
  family:       { accent: '#8A6E9A', bgFrom: '#F8F0FF', bgTo: '#EBD8FF', label: { fr: 'Famille',          en: 'Family'          } },
  wellness:     { accent: '#6A9A7A', bgFrom: '#F0FBF5', bgTo: '#D8F3E6', label: { fr: 'Bien-être',        en: 'Wellness'        } },
  femininity:   { accent: '#C4607A', bgFrom: '#FFF0F2', bgTo: '#FFE0E6', label: { fr: 'Féminité',         en: 'Femininity'      } },
  'letting-go': { accent: '#7A90B0', bgFrom: '#F0F5FF', bgTo: '#DAE5FF', label: { fr: 'Lâcher prise',     en: 'Letting Go'      } },
  default:      { accent: '#FF8C69', bgFrom: '#FFF5F0', bgTo: '#FFE8DC', label: { fr: 'Autre',            en: 'Other'           } },
};

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { state, toggleFavorite } = useUserState();
  const { t, language } = useLanguage();
  const { data: allQuotes, isLoading } = useQuotes();

  const favoriteQuotes = allQuotes?.filter(q => state.favorites.includes(q.id)) || [];
  const countLabel = favoriteQuotes.length === 1
    ? `1 ${t.favorites.subtitle}`
    : `${favoriteQuotes.length} ${t.favorites.subtitle}`;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #FFF5F0 0%, #FFF0E8 50%, #FFF8F5 100%)' }}>

      <header className="px-6 pt-10 pb-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold" style={{ color: '#2D1A12' }}>{t.favorites.title}</h1>
            <p className="mt-1 text-sm" style={{ color: '#B07060' }}>{countLabel}</p>
          </div>
          {/* ✅ Croix fermeture */}
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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF8C69' }} />
        </div>
      ) : favoriteQuotes.length > 0 ? (
        <div className="px-4 space-y-4">
          <AnimatePresence>
            {favoriteQuotes.map((quote, index) => {
              const cfg           = CATEGORY_CONFIG[quote.category] ?? CATEGORY_CONFIG.default;
              const categoryLabel = language === 'fr' ? cfg.label.fr : cfg.label.en;
              const quoteText     = language === 'en' ? (quote.contentEn ?? quote.content ?? '') : (quote.content ?? '');
              const authorText    = quote.author ?? '';

              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  transition={{ delay: index * 0.07, type: 'spring', stiffness: 200, damping: 20 }}
                  className="relative overflow-hidden rounded-2xl"
                  style={{ background: `linear-gradient(145deg, ${cfg.bgFrom} 0%, ${cfg.bgTo} 100%)`, border: `1.5px solid ${cfg.accent}28`, boxShadow: `0 4px 20px ${cfg.accent}18` }}
                >
                  <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}70, transparent)` }} />
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl" style={{ background: `${cfg.accent}18` }} />
                  <div className="relative z-10 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-3xl font-serif leading-none opacity-25" style={{ color: cfg.accent }}>"</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{ background: `${cfg.accent}18`, color: cfg.accent, border: `1px solid ${cfg.accent}30` }}>
                        {categoryLabel}
                      </span>
                    </div>
                    <p className="text-base font-display font-semibold leading-snug mb-4 text-center px-2" style={{ color: '#2D1A12' }}>
                      {quoteText || (language === 'fr' ? 'Citation non disponible' : 'Quote not available')}
                    </p>
                    <div className="w-10 h-0.5 mx-auto mb-3 rounded-full" style={{ background: `${cfg.accent}50` }} />
                    {authorText && (
                      <p className="text-xs text-center font-medium uppercase tracking-widest mb-5" style={{ color: `${cfg.accent}B0` }}>{authorText}</p>
                    )}
                    <div className="flex items-center justify-center gap-3">
                      <motion.button whileTap={{ scale: 0.88 }} onClick={() => toggleFavorite(quote.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                        style={{ background: `${cfg.accent}18`, border: `1px solid ${cfg.accent}35`, color: cfg.accent }}>
                        <Heart className="w-4 h-4 fill-current" />
                        <span>{language === 'fr' ? 'Retirer' : 'Remove'}</span>
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.88 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                        style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(0,0,0,0.08)', color: '#7A4030' }}
                        onClick={() => { if (navigator.share && quoteText) navigator.share({ text: `${quoteText}${authorText ? ` — ${authorText}` : ''}` }); }}>
                        <Share2 className="w-4 h-4" />
                        <span>{language === 'fr' ? 'Partager' : 'Share'}</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <motion.div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, #FFE8DC, #FFCBB8)', boxShadow: '0 8px 24px rgba(255,140,105,0.20)' }}
            animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <Heart className="w-9 h-9" style={{ color: '#FF8C69' }} />
          </motion.div>
          <h3 className="text-xl font-display font-bold mb-2" style={{ color: '#2D1A12' }}>{t.favorites.empty}</h3>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#B07060' }}>{t.favorites.emptySubtitle}</p>
        </motion.div>
      )}

      <Navigation />
    </div>
  );
}