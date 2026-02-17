import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuotes } from '@/hooks/use-quotes';
import { useUserState } from '@/hooks/use-user-state';
import { usePremium } from '@/hooks/use-premium';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { QuoteCard } from '@/components/QuoteCard';
import { MoodOverlay } from '@/components/MoodOverlay';
import { Navigation } from '@/components/Navigation';
import { NotificationBanner } from '@/components/NotificationBanner';
import { ThemeSelector } from '@/components/ThemeSelector';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PremiumBadge } from '@/components/PremiumBadge';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { ReleaseJournal } from '@/components/ReleaseJournal';
import { FloatingJournalButton } from '@/components/FloatingJournalButton';
import { EmergencyMode } from '@/components/EmergencyMode';
import { DevResetButton } from '@/components/DevResetButton';
import { Loader2, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdMob, useQuoteAdCounter } from '@/hooks/use-admob';
import type { Mood } from '@shared/schema';

const MOOD_CATEGORY_MAP: Record<Mood, string> = {
  determined: 'success',
  happy: 'love',
  zen: 'philosophy',
  tired: 'support',
  frustrated: 'confidence',
};

const CATEGORY_STYLES: Record<string, string> = {
  work: 'gradient-work',
  love: 'gradient-love',
  sport: 'gradient-sport',
  confidence: 'gradient-confidence',
  support: 'gradient-support',
  breakup: 'gradient-breakup',
  philosophy: 'gradient-philosophy',
  success: 'gradient-success',
  default: 'gradient-default',
};

export default function Home() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [location] = useLocation();
  const {
    state, logMood, updateStreak,
    hasLoggedMoodToday, toggleFavorite, getTodaysMood,
  } = useUserState();

  // ── Premium ──────────────────────────────────────────────────────────────
  const { isPremium, canViewQuote, incrementQuotesViewed, getRemainingQuotes } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  const [showMoodOverlay, setShowMoodOverlay] = useState(() => !hasLoggedMoodToday());
  const [showReleaseJournal, setShowReleaseJournal] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(() => {
    const mood = getTodaysMood();
    return mood ? MOOD_CATEGORY_MAP[mood] : undefined;
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── AdMob ─────────────────────────────────────────────────────────────────
  const { showInterstitial } = useAdMob();
  const { onNewQuote } = useQuoteAdCounter(showInterstitial);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setCurrentIndex(0);
    }
  }, [location]);

  useEffect(() => { updateStreak(); }, []);

  const { data: quotes, isLoading, isError, refetch } = useQuotes({ category: activeCategory });

  const handleMoodSelect = (mood: Mood) => {
    logMood(mood);
    setShowMoodOverlay(false);
    setActiveCategory(MOOD_CATEGORY_MAP[mood]);
    setCurrentIndex(0);
  };

  // ✅ Vérifier limite citations AVANT d'afficher une nouvelle
  const handleNext = async () => {
    // Vérifier si l'utilisateur peut voir une citation
    if (!canViewQuote()) {
      setShowPaywall(true);
      return;
    }

    if (!quotes) return;
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
    incrementQuotesViewed(); // Incrémenter le compteur
    await onNewQuote();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${theme.imagePath})` }} />
        <div className={`absolute inset-0 ${theme.bgClass} opacity-10`} />
        <div className="relative z-10"><Loader2 className={`w-8 h-8 animate-spin ${theme.accentClass}`} /></div>
      </div>
    );
  }

  if (isError || !quotes || quotes.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${theme.imagePath})` }} />
        <div className={`absolute inset-0 ${theme.bgClass} opacity-10`} />
        <div className="relative z-10">
          <p className={`mb-4 drop-shadow-lg ${theme.textClass}`}>{t.home.error}</p>
          <button onClick={() => refetch()} className={`px-4 py-2 rounded-lg transition-colors ${theme.buttonClass}`}>
            {t.home.retry}
          </button>
        </div>
      </div>
    );
  }

  const currentQuote = quotes[currentIndex];
  const isFavorite = state.favorites.includes(currentQuote.id);
  const bgStyle = CATEGORY_STYLES[currentQuote.category] || CATEGORY_STYLES.default;

  const formattedDate = new Date().toLocaleDateString(t.home.dateFormat, {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="min-h-screen pb-24 overflow-hidden relative transition-all duration-700">
      <div className="fixed inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${theme.imagePath})` }} />
      <div className={`fixed inset-0 ${theme.bgClass} opacity-10 transition-all duration-700`} />

      <MoodOverlay isOpen={showMoodOverlay} onSelectMood={handleMoodSelect} />

      <div className="relative z-10">
        <ReleaseJournal isOpen={showReleaseJournal} onClose={() => setShowReleaseJournal(false)} />
        <EmergencyMode isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
        <FloatingJournalButton onClick={() => setShowReleaseJournal(true)} />
        <DevResetButton />
        <NotificationBanner />

        <header className="px-6 py-6 flex justify-between items-center">
          <div>
            <p className={`text-sm font-medium uppercase tracking-widest drop-shadow-lg ${theme.textClass}`}>
              {formattedDate}
            </p>
            <h1 className={`text-2xl font-display font-bold drop-shadow-lg ${theme.textClass}`}>
              {t.home.quoteOfTheDay}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="header" />
            <ThemeSelector />

            {/* Badge Premium ou Devenir Premium */}
            {isPremium() ? (
              <div className="px-3 py-1 rounded-full flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                <span className="text-xs font-bold text-white">✨</span>
              </div>
            ) : (
              <>
                <PremiumBadge variant="icon" onClick={() => setShowPaywall(true)} />
                {/* Compteur citations restantes */}
                <div className="text-xs px-2 py-1 rounded-full backdrop-blur-sm"
                  style={{ 
                    background: 'rgba(251,191,36,0.15)', 
                    border: '1px solid rgba(251,191,36,0.3)',
                    color: '#fbbf24' 
                  }}>
                  {getRemainingQuotes()}/3
                </div>
              </>
            )}

            <div className={`border rounded-full px-3 py-1 flex items-center gap-2 backdrop-blur-md ${theme.cardClass}`}>
              <span className="text-amber-500">🔥</span>
              <span className={`font-bold ${theme.textClass}`}>{state.streak}</span>
            </div>
          </div>
        </header>

        <main className="px-4 mt-4 flex flex-col items-center gap-8">
          <QuoteCard
            key={currentQuote.id}
            quote={currentQuote}
            isFavorite={isFavorite}
            onToggleFavorite={() => toggleFavorite(currentQuote.id)}
            categoryColors={bgStyle}
          />

          <div className="flex gap-4">
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 shadow-lg backdrop-blur-md ${theme.cardClass} ${theme.textClass}`}
            >
              <RefreshCcw className="w-4 h-4" />
              <span>{t.home.newQuote}</span>
            </button>
          </div>

          {/* Bouton urgence émotionnelle */}
          <motion.button
            onClick={() => setShowEmergency(true)}
            whileHover={{ scale: 1.05, y: -3 }} 
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
            className="relative flex items-center justify-center gap-3 px-7 py-4 rounded-2xl backdrop-blur-lg transition-all shadow-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)`,
              border: `2px solid rgba(255,255,255,0.25)`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0"
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: 'radial-gradient(circle at center, rgba(239,68,68,0.4), transparent 70%)',
              }}
            />

            <span className="relative flex h-3.5 w-3.5 flex-shrink-0 z-10">
              <motion.span 
                animate={{ scale: [1, 2.2, 1], opacity: [1, 0, 1] }} 
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inline-flex h-full w-full rounded-full" 
                style={{ backgroundColor: 'rgba(239,68,68,0.6)' }} 
              />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5" 
                style={{ 
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 8px rgba(239,68,68,0.5)'
                }} 
              />
            </span>
            <span className={`text-base font-bold tracking-wide z-10 ${theme.textClass}`}>
              {language === 'fr' ? "J'ai besoin d'aide" : 'I need help'}
            </span>
            <motion.span 
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl leading-none z-10"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
            >
              🆘
            </motion.span>
          </motion.button>
        </main>

        <Navigation />
      </div>

      {/* Premium Paywall */}
      <PremiumPaywall 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)}
        trigger="quote_limit"
      />
    </div>
  );
}