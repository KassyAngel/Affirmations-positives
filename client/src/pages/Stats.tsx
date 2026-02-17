import { useState, useMemo } from 'react';
import { useUserState } from '@/hooks/use-user-state';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';

import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp, Heart, ChevronLeft, ChevronRight, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const MOOD_SCORES: Record<string, number> = {
  happy: 5,
  determined: 4,
  zen: 3,
  tired: 2,
  frustrated: 1,
};

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊',
  determined: '⚡',
  zen: '🍃',
  tired: '☁️',
  frustrated: '😤',
};

export default function Stats() {
  const { state } = useUserState();
  const { t, language } = useLanguage();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    language === 'fr' ? 'fr-FR' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;

  const moodLabels: Record<string, string> = {
    happy: language === 'fr' ? 'Motivé' : 'Motivated',
    determined: language === 'fr' ? 'Déterminé' : 'Determined',
    zen: 'Zen',
    tired: language === 'fr' ? 'Fatigué' : 'Tired',
    frustrated: language === 'fr' ? 'Frustré' : 'Frustrated',
  };

  const currentMonthData = useMemo(() =>
    state.moodHistory
      .filter(log => {
        const d = new Date(log.date);
        return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
      })
      .map(log => ({
        date: new Date(log.date).toLocaleDateString(
          language === 'fr' ? 'fr-FR' : 'en-US',
          { day: '2-digit', month: 'short' }
        ),
        score: MOOD_SCORES[log.mood] ?? 3,
        mood: log.mood,
        label: moodLabels[log.mood] || log.mood,
        emoji: MOOD_EMOJIS[log.mood] || '😐',
      }))
  , [state.moodHistory, viewYear, viewMonth, language]);

  const prevMonthData = useMemo(() =>
    state.moodHistory.filter(log => {
      const d = new Date(log.date);
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    })
  , [state.moodHistory, prevYear, prevMonth]);

  const avgScore = currentMonthData.length > 0
    ? currentMonthData.reduce((sum, d) => sum + d.score, 0) / currentMonthData.length
    : null;

  const prevAvgScore = prevMonthData.length > 0
    ? prevMonthData.reduce((sum, d) => sum + (MOOD_SCORES[d.mood] ?? 3), 0) / prevMonthData.length
    : null;

  const trend = avgScore !== null && prevAvgScore !== null
    ? avgScore > prevAvgScore + 0.3 ? 'better'
    : avgScore < prevAvgScore - 0.3 ? 'worse'
    : 'same'
    : null;

  const scoreToMood = (score: number) => {
    if (score >= 4.5) return { emoji: '😊', label: language === 'fr' ? 'Excellent' : 'Excellent' };
    if (score >= 3.5) return { emoji: '⚡', label: language === 'fr' ? 'Bien' : 'Good' };
    if (score >= 2.5) return { emoji: '🍃', label: language === 'fr' ? 'Neutre' : 'Neutral' };
    if (score >= 1.5) return { emoji: '☁️', label: language === 'fr' ? 'Difficile' : 'Hard' };
    return { emoji: '😤', label: language === 'fr' ? 'Très difficile' : 'Very hard' };
  };

  const motivationMessage = () => {
    if (!trend) return null;
    if (trend === 'better') return language === 'fr'
      ? '🚀 Vous allez mieux que le mois dernier ! Continuez ainsi.'
      : '🚀 You are doing better than last month! Keep it up.';
    if (trend === 'worse') return language === 'fr'
      ? '💪 Ce mois est plus difficile. Chaque jour est une nouvelle chance.'
      : '💪 This month is harder. Every day is a new chance.';
    return language === 'fr'
      ? '✨ Stable et régulier. La constance est une force.'
      : '✨ Stable and consistent. Consistency is a strength.';
  };

  const lastVisitFormatted = state.lastVisit
    ? new Date(state.lastVisit).toLocaleDateString(
        language === 'fr' ? 'fr-FR' : 'en-US',
        { month: 'short', day: 'numeric' }
      )
    : '-';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#1a1a1a] px-3 py-2 rounded-xl border border-white/10 text-center">
          <p className="text-2xl">{d.emoji}</p>
          <p className="text-white text-xs font-medium">{d.label}</p>
          <p className="text-gray-400 text-xs">{d.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-24">

      <header className="px-6 py-8">
        <h1 className="text-3xl font-display font-bold">{t.stats.title}</h1>
        <p className="text-muted-foreground mt-2">{t.stats.subtitle}</p>
      </header>

      <div className="px-4 space-y-6">
        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-white/5 p-6 rounded-2xl flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">
              {t.stats.currentStreak}
            </p>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              {state.streak} {state.streak <= 1 ? t.stats.day : t.stats.days}
            </h2>
          </div>
          <div className="p-4 bg-orange-500/10 rounded-full">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>

        {/* Graphique */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-white/5 p-6 rounded-2xl"
        >
          {/* Header graphique */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">{t.stats.moodHistory}</h3>
            </div>
            {/* Navigation mois */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevMonth}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <span className="text-xs font-medium text-muted-foreground capitalize min-w-[90px] text-center">
                {monthName}
              </span>
              <button
                onClick={goToNextMonth}
                disabled={isCurrentMonth}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Score moyen + tendance */}
          {avgScore !== null && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
              <span className="text-2xl">{scoreToMood(avgScore).emoji}</span>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Humeur moyenne ce mois' : 'Average mood this month'}
                </p>
                <p className="text-sm font-semibold text-white">
                  {scoreToMood(avgScore).label}
                  <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                    {avgScore.toFixed(1)}/5
                  </span>
                </p>
              </div>
              {/* Badge tendance */}
              {trend && (
                <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                  trend === 'better' ? 'bg-emerald-500/15 text-emerald-400' :
                  trend === 'worse'  ? 'bg-rose-500/15 text-rose-400' :
                                       'bg-white/10 text-muted-foreground'
                }`}>
                  {trend === 'better' ? <TrendingUp className="w-3 h-3" /> :
                   trend === 'worse'  ? <TrendingDown className="w-3 h-3" /> :
                                        <Minus className="w-3 h-3" />}
                  <span>
                    {trend === 'better' ? (language === 'fr' ? '+Mieux' : '+Better') :
                     trend === 'worse'  ? (language === 'fr' ? '-Difficile' : '-Harder') :
                                          (language === 'fr' ? 'Stable' : 'Stable')}
                  </span>
                  {prevAvgScore !== null && (
                    <span className="opacity-60 ml-0.5">vs {prevAvgScore.toFixed(1)}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Graphique */}
          <div className="h-44 w-full">
            {currentMonthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentMonthData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide domain={[0, 6]} />
                  {/* Ligne de référence = humeur neutre */}
                  <ReferenceLine y={3} stroke="#555" strokeDasharray="4 4" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    dot={{ fill: '#7c3aed', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: '#a855f7' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <span className="text-3xl">📭</span>
                <p>{t.stats.noData}</p>
              </div>
            )}
          </div>

          {/* Ligne de référence - explication */}
          {currentMonthData.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              {language === 'fr'
                ? '— — ligne pointillée = humeur neutre (Zen)'
                : '— — dashed line = neutral mood (Zen)'}
            </p>
          )}

          {/* Légende emojis */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-muted-foreground mb-3">
              {language === 'fr' ? 'Légende' : 'Legend'}
            </p>
            <div className="flex items-center justify-between">
              {[
                { score: 1, emoji: '😤', label: language === 'fr' ? 'Frustré' : 'Frustrated' },
                { score: 2, emoji: '☁️', label: language === 'fr' ? 'Fatigué' : 'Tired' },
                { score: 3, emoji: '🍃', label: 'Zen' },
                { score: 4, emoji: '⚡', label: language === 'fr' ? 'Déterminé' : 'Determined' },
                { score: 5, emoji: '😊', label: language === 'fr' ? 'Motivé' : 'Motivated' },
              ].map(item => (
                <div key={item.score} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-[9px] text-muted-foreground text-center leading-tight max-w-[40px]">
                    {item.label}
                  </span>
                  <span className="text-[9px] text-purple-400 font-bold">{item.score}/5</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Message motivant */}
        {motivationMessage() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-2xl border ${
              trend === 'better' ? 'bg-emerald-500/10 border-emerald-500/20' :
              trend === 'worse'  ? 'bg-rose-500/10 border-rose-500/20' :
                                   'bg-white/5 border-white/10'
            }`}
          >
            <p className={`text-sm font-medium leading-relaxed ${
              trend === 'better' ? 'text-emerald-300' :
              trend === 'worse'  ? 'text-rose-300' :
                                   'text-muted-foreground'
            }`}>
              {motivationMessage()}
            </p>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-white/5 p-5 rounded-2xl"
          >
            <div className="p-2 w-fit bg-emerald-500/10 rounded-lg mb-3">
              <Calendar className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold">{lastVisitFormatted}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.stats.lastVisit}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-white/5 p-5 rounded-2xl"
          >
            <div className="p-2 w-fit bg-rose-500/10 rounded-lg mb-3">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <p className="text-2xl font-bold">{state.favorites.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.stats.favoritesCount}</p>
          </motion.div>
        </div>
      </div>

      <Navigation />
    </div>
  );
}