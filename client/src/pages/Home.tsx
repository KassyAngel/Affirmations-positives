import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuotes } from '@/hooks/use-quotes';
import { useUserState } from '@/hooks/use-user-state';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { QuoteCard } from '@/components/QuoteCard';
import { MoodOverlay } from '@/components/MoodOverlay';
import { Navigation } from '@/components/Navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBanner } from '@/components/NotificationBanner';
import { Loader2, RefreshCcw } from 'lucide-react';
import type { Mood } from '@shared/schema';

const MOOD_CATEGORY_MAP: Record<Mood, string> = {
  determined: 'success',
  happy: 'success',
  zen: 'philosophy',
  tired: 'support',
  frustrated: 'confidence'
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
  default: 'gradient-default'
};

export default function Home() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [location] = useLocation();
  const {
    state,
    logMood,
    updateStreak,
    hasLoggedMoodToday,
    toggleFavorite,
    getTodaysMood
  } = useUserState();

  const [showMoodOverlay, setShowMoodOverlay] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setCurrentIndex(0);
    }
  }, [location]);

  useEffect(() => {
    updateStreak();
    if (!hasLoggedMoodToday()) {
      setShowMoodOverlay(true);
    } else {
      const mood = getTodaysMood();
      if (mood && !new URLSearchParams(window.location.search).get('category')) {
        setActiveCategory(MOOD_CATEGORY_MAP[mood]);
      }
    }
  }, []);

  const { data: quotes, isLoading, isError, refetch } = useQuotes({ category: activeCategory });

  const handleMoodSelect = (mood: Mood) => {
    logMood(mood);
    setShowMoodOverlay(false);
    setActiveCategory(MOOD_CATEGORY_MAP[mood]);
  };

  const handleNext = () => {
    if (!quotes) return;
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bgClass}`}>
        <Loader2 className={`w-8 h-8 animate-spin ${theme.accentClass}`} />
      </div>
    );
  }

  if (isError || !quotes || quotes.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${theme.bgClass}`}>
        <p className={`mb-4 ${theme.textMutedClass}`}>{t.home.error}</p>
        <button
          onClick={() => refetch()}
          className={`px-4 py-2 rounded-lg transition-colors ${theme.buttonClass}`}
        >
          {t.home.retry}
        </button>
      </div>
    );
  }

  const currentQuote = quotes[currentIndex];
  const isFavorite = state.favorites.includes(currentQuote.id);
  const bgStyle = CATEGORY_STYLES[currentQuote.category] || CATEGORY_STYLES.default;

  const formattedDate = new Date().toLocaleDateString(t.home.dateFormat, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className={`min-h-screen pb-24 overflow-hidden relative transition-all duration-700 ${theme.bgClass}`}>
      <MoodOverlay isOpen={showMoodOverlay} onSelectMood={handleMoodSelect} />
      <LanguageSwitcher variant="floating" />
      <NotificationBanner />

      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center">
        <div>
          <p className={`text-sm font-medium uppercase tracking-widest ${theme.textMutedClass}`}>
            {formattedDate}
          </p>
          <h1 className={`text-2xl font-display font-bold ${theme.textClass}`}>
            {t.home.quoteOfTheDay}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`border rounded-full px-3 py-1 flex items-center gap-2 ${theme.cardClass}`}>
            <span className="text-amber-500">🔥</span>
            <span className={`font-bold ${theme.textClass}`}>{state.streak}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 shadow-lg ${theme.cardClass} ${theme.textClass}`}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>{t.home.newQuote}</span>
          </button>
        </div>
      </main>

      <Navigation />
    </div>
  );
}