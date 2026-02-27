import { Home, Grid, Heart, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdMob, useNavAdCounter } from '@/hooks/use-admob';
import { motion } from 'framer-motion';

interface NavigationProps {
  onSosPress?: () => void;
}

export function Navigation({ onSosPress }: NavigationProps) {
  const [location, setLocation] = useLocation();
  const { language } = useLanguage();
  const { showInterstitial } = useAdMob();

  // ✅ Compteur nav : pub à partir du 2ème clic, puis toutes les 2
  const { onNavClick } = useNavAdCounter(showInterstitial);

  const handleNav = async (path: string) => {
    if (location === path) return; // pas de pub si déjà sur la page
    await onNavClick();            // gère le compteur et déclenche la pub si nécessaire
    setLocation(path);
  };

  const navItems = [
    { path: '/',           icon: Home,       label: language === 'fr' ? 'Accueil'    : 'Home'       },
    { path: '/categories', icon: Grid,       label: language === 'fr' ? 'Catégories' : 'Categories' },
    { path: '/favorites',  icon: Heart,      label: language === 'fr' ? 'Favoris'    : 'Favorites'  },
    { path: '/stats',      icon: TrendingUp, label: language === 'fr' ? 'Stats'      : 'Stats'      },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(255,250,248,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,140,105,0.15)',
        boxShadow: '0 -4px 24px rgba(255,140,105,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center px-1 py-2 max-w-lg mx-auto gap-0.5">

        {/* 4 items normaux */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className="relative flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-200 flex-1"
              style={{
                color: isActive ? '#FF8C69' : '#B07060',
                background: isActive ? 'rgba(255,140,105,0.10)' : 'transparent',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'rgba(255,140,105,0.10)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className="w-5 h-5 relative z-10"
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ transform: isActive ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.2s' }}
              />
              <span className="text-[11px] relative z-10" style={{ fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* ── Bouton SOS intégré ── */}
        <motion.button
          onClick={onSosPress}
          whileTap={{ scale: 0.92 }}
          className="relative flex flex-col items-center gap-1 py-2 px-1 rounded-2xl flex-1"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1.5px solid rgba(239,68,68,0.18)',
          }}
        >
          <span className="relative flex items-center justify-center w-5 h-5">
            <motion.span
              animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inline-flex rounded-full"
              style={{ width: '100%', height: '100%', backgroundColor: 'rgba(239,68,68,0.4)' }}
            />
            <span
              className="relative inline-flex rounded-full w-3 h-3"
              style={{ backgroundColor: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.5)' }}
            />
          </span>
          <span className="text-[11px] font-semibold" style={{ color: '#ef4444' }}>
            {language === 'fr' ? 'Aide' : 'Help'}
          </span>
        </motion.button>
      </div>
    </nav>
  );
}