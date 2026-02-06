import { useUserState } from '@/hooks/use-user-state';
import { Navigation } from '@/components/Navigation';
import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Stats() {
  const { state } = useUserState();

  // Process mood history for chart
  const data = state.moodHistory.slice(-30).map(log => ({
    date: new Date(log.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    score: getMoodScore(log.mood),
    mood: log.mood
  }));

  function getMoodScore(mood: string): number {
    switch (mood) {
      case 'happy': return 5;
      case 'determined': return 4;
      case 'zen': return 3;
      case 'tired': return 2;
      case 'frustrated': return 1;
      default: return 3;
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 py-8">
        <h1 className="text-3xl font-display font-bold">Statistiques</h1>
        <p className="text-muted-foreground mt-2">Votre progression et votre humeur</p>
      </header>

      <div className="px-4 space-y-6">
        {/* Streak Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-white/5 p-6 rounded-2xl flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Série actuelle</p>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              {state.streak} Jours
            </h2>
          </div>
          <div className="p-4 bg-orange-500/10 rounded-full">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-white/5 p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Historique d'humeur</h3>
          </div>
          
          <div className="h-48 w-full">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide domain={[0, 6]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#7c3aed" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                <p>Pas assez de données pour le moment</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-white/5 p-5 rounded-2xl">
            <div className="p-2 w-fit bg-emerald-500/10 rounded-lg mb-3">
              <Calendar className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold">{state.lastVisit ? new Date(state.lastVisit).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : '-'}</p>
            <p className="text-xs text-muted-foreground mt-1">Dernière visite</p>
          </div>
          
          <div className="bg-card border border-white/5 p-5 rounded-2xl">
            <div className="p-2 w-fit bg-rose-500/10 rounded-lg mb-3">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <p className="text-2xl font-bold">{state.favorites.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Favoris</p>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
}
