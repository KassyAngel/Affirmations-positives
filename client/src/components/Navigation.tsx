import { Home, Grid, Heart, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

export function Navigation() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', icon: Home, label: t.nav.home },
    { path: '/categories', icon: Grid, label: t.nav.categories },
    { path: '/favorites', icon: Heart, label: t.nav.favorites },
    { path: '/stats', icon: TrendingUp, label: t.nav.stats },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/5 z-40">
      <div className="flex justify-around items-center px-4 py-3 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-all ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}