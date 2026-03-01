import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useLocation } from 'wouter';
import { useTheme, THEMES, type ThemeId } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePremium } from '@/hooks/use-premium';
import { useAdMob, SWIPE_AD_INTERVAL } from '@/hooks/use-admob';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { Check } from 'lucide-react';

import Home       from '@/pages/Home';
import Categories from '@/pages/Categories';
import Favorites  from '@/pages/Favorites';
import Stats      from '@/pages/Stats';

// ─── Config ───────────────────────────────────────────────────────────────────
const PAGE_COUNT      = 5;
const SWIPE_THRESHOLD = 55;
const SWIPE_VELOCITY  = 350;

const PATH_TO_INDEX: Record<string, number> = {
  '/':           0,
  '/categories': 1,
  '/favorites':  2,
  '/stats':      3,
  '/themes':     4,
};
const INDEX_TO_PATH = ['/', '/categories', '/favorites', '/stats', '/themes'];

// ✅ Compteur global swipe — module-level, survit aux re-renders
let swipeNavCount = 0;

// ─── Thèmes gratuits ──────────────────────────────────────────────────────────
const FREE_THEMES: ThemeId[] = [
  'afrique', 'ethereal',
  'minimaliste-1', 'minimaliste-2', 'minimaliste-3',
  'minimaliste-5', 'minimaliste-6', 'minimaliste-7', 'minimaliste-8',
  'zen-cascademinimaliste', 'zen',
];

// ─── Page Thèmes ──────────────────────────────────────────────────────────────
function ThemesPage() {
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
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold" style={{ color: '#2D1A12' }}>
            {language === 'fr' ? 'Thèmes' : 'Themes'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#B07060' }}>
            {language === 'fr' ? 'Personnalise ton espace' : 'Customize your space'}
          </p>
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
              transition={{ delay: i * 0.03 }}
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
                <img src={cfg.imagePath} alt={cfg.label.fr} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className={`absolute inset-0 ${cfg.bgClass} opacity-10`} />
                {isLocked && <div className="absolute inset-0 bg-black/20" />}
              </div>
              <p className="text-[11px] font-medium text-center mt-1.5 truncate px-1" style={{ color: '#7A4030' }}>
                {cfg.label.fr}
              </p>
              {isLocked && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
                  <span className="text-xs">🔒</span>
                </div>
              )}
              {isLocked && (
                <div className="absolute bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #FF8C69, #FFA882)', color: 'white' }}>
                  Premium
                </div>
              )}
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
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

// ─── Dots ─────────────────────────────────────────────────────────────────────
const DOT_EMOJIS = ['🏠', '📂', '❤️', '📊', '🎨'];

function PageDots({ current, onDotClick }: { current: number; onDotClick: (i: number) => void }) {
  return (
    <div
      className="fixed z-30 flex items-center gap-2"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)', left: '50%', transform: 'translateX(-50%)' }}
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

// ─── SwipeRouter ──────────────────────────────────────────────────────────────
export function SwipeRouter() {
  const [location, setLocation] = useLocation();
  const [pageIndex, setPageIndex] = useState(() => PATH_TO_INDEX[location] ?? 0);
  const [direction, setDirection]  = useState(0);

  const { showInterstitial } = useAdMob();
  const { isPremium } = usePremium();
  const isPremiumRef = useRef(isPremium());
  useEffect(() => { isPremiumRef.current = isPremium(); }, [isPremium()]);

  // Sync URL → index (ex: croix ✕ dans Stats/Favorites/Categories → home)
  const prevLocationRef = useRef(location);
  useEffect(() => {
    if (location === prevLocationRef.current) return;
    prevLocationRef.current = location;
    const idx = PATH_TO_INDEX[location];
    if (idx !== undefined && idx !== pageIndex) {
      setDirection(idx > pageIndex ? 1 : -1);
      setPageIndex(idx);
      // ✅ La croix compte aussi dans le compteur swipe
      triggerSwipeAd();
    }
  }, [location]);

  // ✅ Pub toutes les SWIPE_AD_INTERVAL (5) navigations
  const triggerSwipeAd = useCallback(async () => {
    if (isPremiumRef.current) return;
    swipeNavCount += 1;
    console.log(`[AdMob] Swipe nav #${swipeNavCount}`);
    if (swipeNavCount % SWIPE_AD_INTERVAL === 0) {
      console.log('[AdMob] Seuil swipe atteint → pub');
      await showInterstitial();
    }
  }, [showInterstitial]);

  const dragCancelledRef = useRef(false);

  const goTo = useCallback(async (newIdx: number) => {
    if (newIdx < 0 || newIdx >= PAGE_COUNT || newIdx === pageIndex) return;
    setDirection(newIdx > pageIndex ? 1 : -1);
    setPageIndex(newIdx);
    setLocation(INDEX_TO_PATH[newIdx]);
    await triggerSwipeAd();
  }, [pageIndex, setLocation, triggerSwipeAd]);

  const handleDragStart = useCallback(() => { dragCancelledRef.current = false; }, []);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    const dx = Math.abs(info.offset.x);
    const dy = Math.abs(info.offset.y);
    if (dy > dx * 1.3 && dy > 8) dragCancelledRef.current = true;
  }, []);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (dragCancelledRef.current) return;
    const { offset, velocity } = info;
    if (Math.abs(offset.y) > Math.abs(offset.x) * 1.4) return;
    const swipeLeft  = offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY;
    const swipeRight = offset.x >  SWIPE_THRESHOLD || velocity.x >  SWIPE_VELOCITY;
    if (swipeLeft  && pageIndex < PAGE_COUNT - 1) goTo(pageIndex + 1);
    if (swipeRight && pageIndex > 0)              goTo(pageIndex - 1);
  }, [pageIndex, goTo]);

  const variants = {
    enter:  (dir: number) => ({ x: dir >= 0 ? '100%' : '-100%', opacity: 0 }),
    center:                  ({ x: 0,                             opacity: 1 }),
    exit:   (dir: number) => ({ x: dir >= 0 ? '-100%' : '100%',  opacity: 0 }),
  };

  const renderPage = () => {
    switch (pageIndex) {
      case 0: return <Home />;
      case 1: return <Categories />;
      case 2: return <Favorites />;
      case 3: return <Stats />;
      case 4: return <ThemesPage />;
      default: return <Home />;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <motion.div
        className="w-full h-full"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.06}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <AnimatePresence custom={direction} mode="popLayout" initial={false}>
          <motion.div
            key={pageIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x:       { type: 'spring', stiffness: 300, damping: 32, mass: 0.85 },
              opacity: { duration: 0.1 },
            }}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden"
            style={{ touchAction: 'pan-y' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <PageDots current={pageIndex} onDotClick={goTo} />
    </div>
  );
}