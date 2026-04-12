import { useMemo, memo } from 'react';
import { Home, Grid, Heart, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdMob, useNavAdCounter } from '@/hooks/use-admob';
import { EmergencyMode } from '@/components/EmergencyMode';
import { useState } from 'react';

// ✅ motion retiré entièrement de la nav — trop lourd sur Android A-series
// L'indicateur actif est géré en CSS pur (transform + transition)
// Le pulse SOS est une animation CSS keyframe — zéro JS par frame

interface NavigationProps {
  onSosPress?: () => void;
}

export const Navigation = memo(function Navigation({ onSosPress }: NavigationProps) {
  const [location, setLocation] = useLocation();
  const { language } = useLanguage();
  const { showInterstitial } = useAdMob();
  const { onNavClick } = useNavAdCounter(showInterstitial);
  const [showEmergency, setShowEmergency] = useState(false);

  const handleNav = async (path: string) => {
    if (location === path) return;
    await onNavClick(path);
    setLocation(path);
  };

  const handleSos = () => {
    if (onSosPress) onSosPress();
    else setShowEmergency(true);
  };

  const navItems = useMemo(() => [
    { path: '/',           icon: Home,       label: language === 'fr' ? 'Accueil'    : 'Home'       },
    { path: '/categories', icon: Grid,       label: language === 'fr' ? 'Catégories' : 'Categories' },
    { path: '/favorites',  icon: Heart,      label: language === 'fr' ? 'Favoris'    : 'Favorites'  },
    { path: '/stats',      icon: TrendingUp, label: language === 'fr' ? 'Stats'      : 'Stats'      },
  ], [language]);

  return (
    <>
      <style>{`
        @keyframes nav-sos-pulse {
          0%, 100% { transform: scale(1);   opacity: 0.6; }
          50%       { transform: scale(1.9); opacity: 0;   }
        }
        .nav-sos-ring {
          animation: nav-sos-pulse 2.5s ease-in-out infinite;
        }
        .nav-btn-icon {
          transition: transform 0.18s ease, color 0.18s ease;
        }
        .nav-btn-icon.active {
          transform: scale(1.12);
        }
        .nav-btn-bg {
          position: absolute; inset: 0;
          border-radius: 1rem;
          background: rgba(255,140,105,0.10);
          opacity: 0;
          transition: opacity 0.18s ease;
        }
        .nav-btn-bg.active {
          opacity: 1;
        }
      `}</style>

        <nav
          className="fixed bottom-0 left-0 right-0 z-40"
          ref={(el) => {
            if (el) {
              // ✅ Expose la hauteur réelle de la nav comme variable CSS globale
              document.documentElement.style.setProperty(
                '--nav-height',
                `${el.offsetHeight}px`
              );
            }
          }}
          style={{
            background: 'rgba(255,250,248,0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,140,105,0.15)',
            boxShadow: '0 -4px 24px rgba(255,140,105,0.08)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
        <div className="flex items-center px-1 py-2 max-w-lg mx-auto gap-0.5">

          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className="relative flex flex-col items-center gap-1 py-2 rounded-2xl flex-1"
                style={{ color: isActive ? '#FF8C69' : '#B07060' }}
              >
                {/* ✅ Indicateur CSS pur — pas de layoutId, pas de mesure DOM */}
                <div className={`nav-btn-bg ${isActive ? 'active' : ''}`} />

                <Icon
                  className={`w-5 h-5 relative z-10 nav-btn-icon ${isActive ? 'active' : ''}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className="text-[11px] relative z-10"
                  style={{ fontWeight: isActive ? 600 : 400 }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* ── Bouton SOS — CSS keyframe, zéro framer ── */}
          <button
            onClick={handleSos}
            className="relative flex flex-col items-center gap-1 py-2 px-1 rounded-2xl flex-1 active:scale-95"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1.5px solid rgba(239,68,68,0.18)',
              transition: 'transform 0.12s ease',
            }}
          >
            <span className="relative flex items-center justify-center w-5 h-5">
              {/* ✅ Pulse CSS — pas de motion.span */}
              <span
                className="nav-sos-ring absolute inline-flex rounded-full"
                style={{
                  width: '100%', height: '100%',
                  backgroundColor: 'rgba(239,68,68,0.4)',
                }}
              />
              <span
                className="relative inline-flex rounded-full w-3 h-3"
                style={{ backgroundColor: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.5)' }}
              />
            </span>
            <span className="text-[11px] font-semibold" style={{ color: '#ef4444' }}>
              {language === 'fr' ? 'Aide' : 'Help'}
            </span>
          </button>

        </div>
      </nav>

      <EmergencyMode
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
      />
    </>
  );
});