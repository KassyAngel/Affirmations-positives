import { useEffect, useState, useRef, memo, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuotes } from '@/hooks/use-quotes';
import { useUserStateContext } from '@/contexts/UserStateContext';
import { usePremium } from '@/hooks/use-premium';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDeviceType } from '@/hooks/use-device-type';
import { QuoteCard } from '@/components/QuoteCard';
import { MoodOverlay } from '@/components/MoodOverlay';
import { NotificationBanner } from '@/components/NotificationBanner';
import { ThemeSelector } from '@/components/ThemeSelector';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { ReleaseJournal } from '@/components/ReleaseJournal';
import { FloatingJournalButton } from '@/components/FloatingJournalButton';
import { EmergencyMode } from '@/components/EmergencyMode';
import { DevResetButton } from '@/components/DevResetButton';
import { Loader2, RefreshCcw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdMob, useQuoteAdCounter } from '@/hooks/use-admob';
import { Preferences } from '@capacitor/preferences';
import type { Mood, Quote } from '@shared/schema';
import { SettingsMenu } from '@/components/SettingsMenu';
import { RatingModal } from '@/components/RatingModal';
import { useRating } from '@/hooks/use-rating';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MOOD_CATEGORY_MAP: Record<Mood, string> = {
  determined: 'work',
  happy:      'love',
  zen:        'wellness',
  tired:      'support',
  frustrated: 'confidence',
};

const CATEGORY_STYLES: Record<string, string> = {
  work:         'gradient-work',
  love:         'gradient-love',
  sport:        'gradient-sport',
  confidence:   'gradient-confidence',
  support:      'gradient-support',
  breakup:      'gradient-breakup',
  philosophy:   'gradient-philosophy',
  success:      'gradient-success',
  gratitude:    'gradient-default',
  wellness:     'gradient-default',
  family:       'gradient-default',
  femininity:   'gradient-default',
  'letting-go': 'gradient-default',
  default:      'gradient-default',
};

const KEY_CATEGORY = 'home_active_category';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function saveQuoteForWidget(quote: Quote, lang: string): Promise<void> {
  try {
    const text = lang === 'en' && quote.contentEn ? quote.contentEn : quote.content;
    await Promise.all([
      Preferences.set({ key: 'current_widget_quote', value: text }),
      Preferences.set({ key: 'app_language',         value: lang }),
    ]);
  } catch (e) {
    console.warn('[Widget] Erreur sauvegarde:', e);
  }
}

function randomShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function loadPersistedCategory(): Promise<string | undefined> {
  try {
    const { value } = await Preferences.get({ key: KEY_CATEGORY });
    return value ?? undefined;
  } catch {
    return undefined;
  }
}

async function persistCategory(category: string | undefined): Promise<void> {
  try {
    if (category) {
      await Preferences.set({ key: KEY_CATEGORY, value: category });
    } else {
      await Preferences.remove({ key: KEY_CATEGORY });
    }
  } catch {}
}

// ─── NewQuoteButton ───────────────────────────────────────────────────────────

interface NewQuoteButtonProps {
  onClick: () => void;
  label: string;
}

const NewQuoteButton = memo(({ onClick, label }: NewQuoteButtonProps) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.04, y: -2 }}
    whileTap={{ scale: 0.96 }}
    className="flex items-center gap-2 px-6 py-3 rounded-full transition-colors"
    style={{
      background:     'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(16px)',
      border:         '1.5px solid rgba(255,255,255,0.35)',
      boxShadow:      '0 4px 20px rgba(0,0,0,0.12)',
      color:          'white',
      textShadow:     '0 1px 4px rgba(0,0,0,0.25)',
    }}
  >
    <RefreshCcw className="w-4 h-4" />
    <span className="font-medium">{label}</span>
  </motion.button>
));
NewQuoteButton.displayName = 'NewQuoteButton';

// ─── Composant principal ──────────────────────────────────────────────────────

export default function Home() {
  const { t, language } = useLanguage();
  const { theme }       = useTheme();
  const device          = useDeviceType();
  const [location]      = useLocation();

  const { state, isReady, logMood, updateStreak, hasLoggedMoodToday, toggleFavorite, getTodaysMood } = useUserStateContext();
  const { isPremium, tier } = usePremium();
  const userIsPremium = useMemo(() => isPremium(), [tier]); // eslint-disable-line

  const { showRating, onQuoteSeen, onRated, onDismiss } = useRating();

  const [showPaywall,        setShowPaywall]        = useState(false);
  const [showMoodOverlay,    setShowMoodOverlay]    = useState(() => !hasLoggedMoodToday());
  const [showReleaseJournal, setShowReleaseJournal] = useState(false);
  const [showEmergency,      setShowEmergency]      = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [shuffledQuotes, setShuffledQuotes] = useState<Quote[]>([]);

  // ✅ shuffleKey : incrémenté au montage pour forcer un nouveau shuffle
  // même si rawQuotes est déjà en cache React Query (même catégorie)
  const [shuffleKey, setShuffleKey] = useState(0);

  const { showInterstitial } = useAdMob();
  const { onNewQuote }       = useQuoteAdCounter(showInterstitial);

  const { data: rawQuotes, isLoading, isError, refetch } = useQuotes({ category: activeCategory });

  // ✅ Au montage : restaure la catégorie persistée + force un nouveau shuffle
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const persisted = await loadPersistedCategory();
      if (cancelled) return;

      const params = new URLSearchParams(window.location.search);
      const urlCat = params.get('category');
      if (urlCat) {
        setActiveCategory(urlCat);
      } else if (persisted) {
        setActiveCategory(persisted);
      } else {
        const mood = getTodaysMood();
        setActiveCategory(mood ? MOOD_CATEGORY_MAP[mood] : undefined);
      }

      // ✅ Force un nouveau shuffle à chaque ouverture de l'app
      setShuffleKey(k => k + 1);
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  // Sync catégorie depuis URL (navigation depuis Categories)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setCurrentIndex(0);
      persistCategory(categoryParam);
      // ✅ Nouveau shuffle aussi quand on change de catégorie
      setShuffleKey(k => k + 1);
    }
  }, [location]);

  useEffect(() => {
    if (!isReady) return;
    updateStreak();
  }, [isReady]); // eslint-disable-line

  // ✅ Shuffle déclenché par rawQuotes OU par shuffleKey (montage/changement catégorie)
  useEffect(() => {
    if (!rawQuotes || rawQuotes.length === 0) return;
    const shuffled = randomShuffle(rawQuotes);
    setShuffledQuotes(shuffled);
    setCurrentIndex(0);
  }, [rawQuotes, shuffleKey]); // eslint-disable-line

  useEffect(() => {
    if (shuffledQuotes.length === 0) return;
    saveQuoteForWidget(shuffledQuotes[0], language);
  }, [shuffledQuotes, language]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleMoodSelect = useCallback((mood: Mood) => {
    logMood(mood);
    setShowMoodOverlay(false);
    const cat = MOOD_CATEGORY_MAP[mood];
    setActiveCategory(cat);
    setCurrentIndex(0);
    persistCategory(cat);
    setShuffleKey(k => k + 1);
  }, [logMood]);

  const handleNext = useCallback(async () => {
    if (shuffledQuotes.length === 0) return;
    const nextIndex = (currentIndex + 1) % shuffledQuotes.length;
    setCurrentIndex(nextIndex);
    await saveQuoteForWidget(shuffledQuotes[nextIndex], language);
    await onNewQuote();
    onQuoteSeen();
  }, [shuffledQuotes, currentIndex, language, onNewQuote, onQuoteSeen]);

  const handleOpenJournal    = useCallback(() => setShowReleaseJournal(true),  []);
  const handleCloseJournal   = useCallback(() => setShowReleaseJournal(false), []);
  const handleOpenEmergency  = useCallback(() => setShowEmergency(true),       []);
  const handleCloseEmergency = useCallback(() => setShowEmergency(false),      []);
  const handleOpenPaywall    = useCallback(() => setShowPaywall(true),         []);
  const handleClosePaywall   = useCallback(() => setShowPaywall(false),        []);

  // ─── Rendu ────────────────────────────────────────────────────────────────

  if (isLoading || shuffledQuotes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${theme.imagePath})` }} />
        <div className={`absolute inset-0 ${theme.bgClass} opacity-10`} />
        <div className="relative z-10">
          <Loader2 className={`w-8 h-8 animate-spin ${theme.accentClass}`} />
        </div>
      </div>
    );
  }

  if (isError || rawQuotes?.length === 0) {
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

  const safeIndex    = Math.min(currentIndex, shuffledQuotes.length - 1);
  const currentQuote = shuffledQuotes[safeIndex];
  const isFavorite   = state.favorites.includes(currentQuote.id);
  const bgStyle      = CATEGORY_STYLES[currentQuote.category] || CATEGORY_STYLES.default;
  const formattedDate = new Date().toLocaleDateString(t.home.dateFormat, {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const isTabletOrDesktop = device === 'tablet' || device === 'desktop';

  return (
    <div className="min-h-screen pb-20 overflow-hidden relative">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${theme.imagePath})`, transition: 'background-image 0.7s ease' }}
      />
      <div className={`fixed inset-0 ${theme.bgClass} opacity-10`} />

      <MoodOverlay isOpen={showMoodOverlay} onSelectMood={handleMoodSelect} />

      <div className="relative z-10">
        <ReleaseJournal isOpen={showReleaseJournal} onClose={handleCloseJournal} />
        <EmergencyMode  isOpen={showEmergency}      onClose={handleCloseEmergency} />
        <FloatingJournalButton onClick={handleOpenJournal} />
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
            <SettingsMenu />
            <ThemeSelector />
          </div>
        </header>

        <div className="px-6 mb-3 flex items-center justify-between">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md ${theme.cardClass}`}>
            <span className="text-amber-500 text-sm">🔥</span>
            <span className={`font-bold text-sm ${theme.textClass}`}>{state.streak}</span>
            <span className={`text-xs ${theme.textClass} opacity-70`}>
              {language === 'fr' ? 'jour' : 'day'}{state.streak > 1 ? 's' : ''}
            </span>
          </div>

          {userIsPremium ? (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.1))',
                border:     '1px solid rgba(251,191,36,0.4)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
              <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>Premium</span>
            </div>
          ) : (
            <motion.button
              onClick={handleOpenPaywall}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md"
              style={{
                background: 'rgba(251,191,36,0.15)',
                border:     '1.5px solid rgba(251,191,36,0.5)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
              <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>
                {language === 'fr' ? 'Débloquer Premium' : 'Unlock Premium'}
              </span>
            </motion.button>
          )}
        </div>

        {!isTabletOrDesktop && (
          <main className="px-4 flex flex-col items-center gap-8">
            <QuoteCard
              quote={currentQuote}
              isFavorite={isFavorite}
              onToggleFavorite={() => toggleFavorite(currentQuote.id)}
              categoryColors={bgStyle}
            />
            <NewQuoteButton onClick={handleNext} label={t.home.newQuote} />
          </main>
        )}

        {isTabletOrDesktop && (
          <main className="px-8 mt-2 flex items-center justify-center gap-10 min-h-[calc(100vh-200px)]">
            <QuoteCard
              quote={currentQuote}
              isFavorite={isFavorite}
              onToggleFavorite={() => toggleFavorite(currentQuote.id)}
              categoryColors={bgStyle}
            />
            <div className="flex flex-col items-start gap-4 shrink-0">
              <NewQuoteButton onClick={handleNext} label={t.home.newQuote} />
            </div>
          </main>
        )}
      </div>

      <PremiumPaywall isOpen={showPaywall} onClose={handleClosePaywall} trigger="quote_limit" />
      <RatingModal isOpen={showRating} onRated={onRated} onDismiss={onDismiss} />
    </div>
  );
}