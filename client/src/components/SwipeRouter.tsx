import { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { X, Check } from 'lucide-react';
import { useTheme, THEMES, type ThemeId } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePremium } from '@/hooks/use-premium';
import { useAdMob, SWIPE_AD_INTERVAL } from '@/hooks/use-admob';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { Navigation } from '@/components/Navigation';
import { EmergencyMode } from '@/components/EmergencyMode';
import { UserStateProvider } from '@/contexts/UserStateContext';

const Home       = lazy(() => import('@/pages/Home'));
const Categories = lazy(() => import('@/pages/Categories'));
const Favorites  = lazy(() => import('@/pages/Favorites'));
const Stats      = lazy(() => import('@/pages/Stats'));

const PAGE_COUNT      = 5;
const SWIPE_THRESHOLD = 45;

const PATH_TO_INDEX: Record<string, number> = {
  '/':           0,
  '/categories': 1,
  '/favorites':  2,
  '/stats':      3,
  '/themes':     4,
};
const INDEX_TO_PATH = ['/', '/categories', '/favorites', '/stats', '/themes'];

const FREE_THEMES: ThemeId[] = [
  'afrique', 'ethereal',
  'minimaliste-1', 'minimaliste-2', 'minimaliste-3',
  'minimaliste-5', 'minimaliste-6', 'minimaliste-7', 'minimaliste-8',
  'zen-cascademinimaliste', 'zen',
];

let swipeNavCount = 0;

function PageSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/80 animate-spin" />
    </div>
  );
}

function ThemesPage({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage();
  const { themeId, setTheme } = useTheme();
  const { isPremium } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleSelect = (id: ThemeId) => {
    if (!FREE_THEMES.includes(id) && !isPremium()) {
      setShowPaywall(true);
      return;
    }
    setTheme(id);
  };

  return (
    <div
      className="min-h-screen pb-32"
      style={{ background: 'linear-gradient(160deg, #FFF5F0 0%, #FFF0E8 50%, #FFF8F5 100%)' }}
    >
      <header className="px-6 pt-10 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-display font-bold" style={{ color: '#2D1A12' }}>
              {language === 'fr' ? 'Thèmes' : 'Themes'}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#B07060' }}>
              {language === 'fr' ? 'Personnalise ton espace' : 'Customize your space'}
            </p>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ background: 'rgba(255,140,105,0.12)', border: '1.5px solid rgba(255,140,105,0.25)' }}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" style={{ color: '#FF8C69' }} />
          </motion.button>
        </motion.div>
      </header>

      <div className="px-4 grid grid-cols-2 gap-4 pb-8">
        {(Object.keys(THEMES) as ThemeId[]).map((id, i) => {
          const cfg        = THEMES[id];
          const isSelected = id === themeId;
          const isLocked   = !FREE_THEMES.includes(id) && !isPremium();

          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              onClick={() => handleSelect(id)}
              className="relative"
              style={{ opacity: isLocked ? 0.75 : 1 }}
            >
              <div
                className="h-32 rounded-2xl overflow-hidden relative"
                style={{
                  border:     isSelected ? '2.5px solid #FF8C69' : '2px solid rgba(255,203,184,0.5)',
                  transform:  isSelected ? 'scale(1.04)' : 'scale(1)',
                  boxShadow:  isSelected ? '0 4px 20px rgba(255,140,105,0.35)' : '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s',
                }}
              >
                <img
                  src={cfg.imagePath}
                  alt={cfg.label.fr}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className={`absolute inset-0 ${cfg.bgClass} opacity-10`} />
                {isLocked && <div className="absolute inset-0 bg-black/20" />}
              </div>

              <p className="text-[11px] font-medium text-center mt-1.5 truncate px-1" style={{ color: '#7A4030' }}>
                {cfg.label.fr}
              </p>

              {isLocked && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
                >
                  <span className="text-xs">🔒</span>
                </div>
              )}
              {isLocked && (
                <div
                  className="absolute bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #FF8C69, #FFA882)', color: 'white' }}
                >
                  Premium
                </div>
              )}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <PremiumPaywall isOpen={showPaywall} onClose={() => setShowPaywall(false)} trigger="theme_locked" />
    </div>
  );
}

const DOT_EMOJIS = ['🏠', '📂', '❤️', '📊', '🎨'];

function PageDots({ current, onDotClick }: { current: number; onDotClick: (i: number) => void }) {
  return (
    <div
      className="fixed z-30 flex items-center gap-2"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 82px)',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {Array.from({ length: PAGE_COUNT }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onDotClick(i)}
          title={DOT_EMOJIS[i]}
          animate={{
            width:           i === current ? 26 : 7,
            height:          7,
            borderRadius:    99,
            backgroundColor: i === current ? '#FF8C69' : 'rgba(255,140,105,0.30)',
          }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

function SwipeRouterInner() {
  const [location, setLocation] = useLocation();
  const [pageIndex, setPageIndex] = useState(() => PATH_TO_INDEX[location] ?? 0);
  const [showEmergency, setShowEmergency] = useState(false);

  const { showInterstitial } = useAdMob();
  const { isPremium, tier }  = usePremium();

  const isPremiumRef    = useRef(isPremium());
  const pageIndexRef    = useRef(pageIndex);
  const containerRef    = useRef<HTMLDivElement>(null);

  const touchStartX     = useRef(0);
  const touchStartY     = useRef(0);
  const touchDeltaX     = useRef(0);
  const isDragging      = useRef(false);
  const isScrolling     = useRef(false);
  const isTransitioning = useRef(false);

  useEffect(() => { isPremiumRef.current = isPremium(); }, [tier]); // eslint-disable-line

  const prevLocationRef = useRef(location);
  useEffect(() => {
    if (location === prevLocationRef.current) return;
    prevLocationRef.current = location;
    const idx = PATH_TO_INDEX[location];
    if (idx !== undefined && idx !== pageIndexRef.current) {
      navigateTo(idx);
    }
  }, [location]); // eslint-disable-line

  const triggerSwipeAd = useCallback(async () => {
    if (isPremiumRef.current) return;
    swipeNavCount += 1;
    if (swipeNavCount % SWIPE_AD_INTERVAL === 0) await showInterstitial();
  }, [showInterstitial]);

  const setTransform = useCallback((el: HTMLDivElement, idx: number, animated: boolean) => {
    el.style.transition = animated
      ? 'transform 260ms cubic-bezier(0.25,0.46,0.45,0.94)'
      : 'none';
    el.style.transform = `translate3d(${-idx * 100}vw, 0, 0)`;
  }, []);

  const navigateTo = useCallback((newIdx: number) => {
    if (newIdx < 0 || newIdx >= PAGE_COUNT) return;
    if (newIdx === pageIndexRef.current) return;
    if (isTransitioning.current) return;

    isTransitioning.current = true;
    pageIndexRef.current    = newIdx;
    setPageIndex(newIdx);
    setLocation(INDEX_TO_PATH[newIdx]);
    triggerSwipeAd();

    if (containerRef.current) {
      setTransform(containerRef.current, newIdx, true);
    }

    setTimeout(() => {
      document.querySelectorAll('.sr-page').forEach(el => { (el as HTMLElement).scrollTop = 0; });
      isTransitioning.current = false;
    }, 280);
  }, [setLocation, triggerSwipeAd, setTransform]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (isTransitioning.current) return;
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchDeltaX.current = 0;
    isDragging.current  = false;
    isScrolling.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (isTransitioning.current || isScrolling.current) return;
    const t  = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;

    if (!isDragging.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      if (Math.abs(dy) > Math.abs(dx) * 1.2) {
        isScrolling.current = true;
        return;
      }
      isDragging.current = true;
    }

    if (!isDragging.current) return;

    e.preventDefault();
    touchDeltaX.current = dx;

    const resistance = 0.35;
    const current    = pageIndexRef.current;
    let visualDx     = dx;
    if ((dx > 0 && current === 0) || (dx < 0 && current === PAGE_COUNT - 1)) {
      visualDx = dx * resistance;
    }

    if (containerRef.current) {
      const baseX = -current * window.innerWidth;
      containerRef.current.style.transition = 'none';
      containerRef.current.style.transform  = `translate3d(${baseX + visualDx}px, 0, 0)`;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current || isTransitioning.current) {
      isDragging.current = false;
      return;
    }
    isDragging.current = false;

    const dx      = touchDeltaX.current;
    const current = pageIndexRef.current;
    const goLeft  = dx < -SWIPE_THRESHOLD && current < PAGE_COUNT - 1;
    const goRight = dx >  SWIPE_THRESHOLD && current > 0;

    if (goLeft || goRight) {
      navigateTo(current + (goLeft ? 1 : -1));
    } else {
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 220ms cubic-bezier(0.25,0.46,0.45,0.94)';
        containerRef.current.style.transform  = `translate3d(${-current * 100}vw, 0, 0)`;
      }
    }
  }, [navigateTo]);

  useEffect(() => {
    if (containerRef.current) {
      setTransform(containerRef.current, pageIndex, true);
    }
  }, [pageIndex, setTransform]);

  const handleCloseThemes    = useCallback(() => navigateTo(0), [navigateTo]);
  const handleOpenEmergency  = useCallback(() => setShowEmergency(true), []);
  const handleCloseEmergency = useCallback(() => setShowEmergency(false), []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      <div
        ref={containerRef}
        style={{
          display:    'flex',
          width:      `${PAGE_COUNT * 100}vw`,
          height:     '100%',
          transform:  `translate3d(${-(PATH_TO_INDEX[location] ?? 0) * 100}vw, 0, 0)`,
          willChange: 'transform',
        }}
      >
        {([
          <Home />,
          <Categories />,
          <Favorites />,
          <Stats />,
          <ThemesPage onClose={handleCloseThemes} />,
        ] as React.ReactElement[]).map((page, i) => (
          <div
            key={i}
            className="sr-page overflow-y-auto overflow-x-hidden"
            style={{
              width:      '100vw',
              height:     '100%',
              flexShrink: 0,
              transform:  'translateZ(0)',
              willChange: i === pageIndex || i === pageIndex - 1 || i === pageIndex + 1
                ? 'transform'
                : 'auto',
            }}
          >
            <Suspense fallback={<PageSkeleton />}>
              {page}
            </Suspense>
          </div>
        ))}
      </div>

      <Navigation onSosPress={handleOpenEmergency} />
      <PageDots current={pageIndex} onDotClick={navigateTo} />

      <AnimatePresence>
        {showEmergency && (
          <EmergencyMode
            isOpen={showEmergency}
            onClose={handleCloseEmergency}
          />
        )}
      </AnimatePresence>

      <style>{`
        .sr-page { -webkit-overflow-scrolling: touch; overscroll-behavior-x: none; }
      `}</style>
    </div>
  );
}

// ✅ Export principal — UserStateProvider entoure tout
export function SwipeRouter() {
  return (
    <UserStateProvider>
      <SwipeRouterInner />
    </UserStateProvider>
  );
}