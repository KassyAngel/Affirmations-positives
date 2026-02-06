import { Link, useLocation } from "wouter";
import { Home, Grid, Heart, BarChart2 } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/categories", icon: Grid, label: "Thèmes" },
    { href: "/favorites", icon: Heart, label: "Favoris" },
    { href: "/stats", icon: BarChart2, label: "Stats" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="max-w-md mx-auto px-6 h-16 flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 group w-16">
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
