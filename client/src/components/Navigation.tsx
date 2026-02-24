import { Home, Grid, Heart, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdMob } from '@/hooks/use-admob';
import { motion } from 'framer-motion';

export function Navigation() {
  const [location, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const { showInterstitial } = useAdMob();

  const AD_TRIGGER_PATHS = new Set(['/stats', '/categories']);

  const handleNav = async (path: string) => {
    if (location === path) return;
    if (AD_TRIGGER_PATHS.has(path)) {
      await showInterstitial();
    }
    setLocation(path);
  };

  const navItems = [
    { path: '/',           icon: Home,        label: language === 'fr' ? 'Accueil'     : 'Home'       },
    { path: '/categories', icon: Grid,        label: language === 'fr' ? 'Catégories'  : 'Categories' },
    { path: '/favorites',  icon: Heart,       label: language === 'fr' ? 'Favoris'     : 'Favorites'  },
    { path: '/stats',      icon: TrendingUp,  label: language === 'fr' ? 'Stats'       : 'Stats'      },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(255,250,248,0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,140,105,0.15)',
        boxShadow: '0 -4px 24px rgba(255,140,105,0.08)',
        // ✅ Respecte la barre système Android (gesture nav + boutons)
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center px-2 pt-2 pb-2 max-w-lg mx-auto"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200"
              style={{
                color: isActive ? '#FF8C69' : '#B07060',
                background: isActive ? 'rgba(255,140,105,0.10)' : 'transparent',
              }}
            >
              {/* Indicateur actif */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'rgba(255,140,105,0.10)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                className="w-5 h-5 relative z-10 transition-transform duration-200"
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ transform: isActive ? 'scale(1.12)' : 'scale(1)' }}
              />
              <span
                className="text-[11px] font-medium relative z-10 transition-all"
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}