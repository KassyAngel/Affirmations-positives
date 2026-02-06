import { useLocation } from 'wouter';
import { Navigation } from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { 
  Briefcase, Heart, Dumbbell, Star, 
  LifeBuoy, HeartCrack, BookOpen, Trophy, 
  ChevronRight 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'work', icon: Briefcase, color: 'from-slate-700 to-slate-900', count: 24 },
  { id: 'love', icon: Heart, color: 'from-pink-600 to-rose-900', count: 18 },
  { id: 'sport', icon: Dumbbell, color: 'from-orange-600 to-amber-900', count: 15 },
  { id: 'confidence', icon: Star, color: 'from-emerald-600 to-teal-900', count: 32 },
  { id: 'support', icon: LifeBuoy, color: 'from-indigo-600 to-blue-900', count: 12 },
  { id: 'breakup', icon: HeartCrack, color: 'from-purple-600 to-violet-900', count: 9 },
  { id: 'philosophy', icon: BookOpen, color: 'from-amber-600 to-yellow-900', count: 45 },
  { id: 'success', icon: Trophy, color: 'from-cyan-600 to-sky-900', count: 28 },
];

export default function Categories() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 py-8">
        <h1 className="text-3xl font-display font-bold">{t.categories.title}</h1>
        <p className="text-muted-foreground mt-2">{t.categories.subtitle}</p>
      </header>

      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORIES.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setLocation(`/?category=${category.id}`)}
            className="group relative overflow-hidden rounded-2xl h-28 text-left"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
            <div className="absolute inset-0 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t.categories[category.id as keyof typeof t.categories]}
                  </h3>
                  <p className="text-xs text-white/60 font-medium">
                    {category.count} {t.categories.quotes}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        ))}
      </div>

      <Navigation />
    </div>
  );
}