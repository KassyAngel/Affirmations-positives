import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useUserState } from '@/hooks/use-user-state';
import { useLanguage } from '@/contexts/LanguageContext';

import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp, Heart, X, ChevronLeft, ChevronRight, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const MOOD_SCORES: Record<string, number> = { happy: 5, determined: 4, zen: 3, tired: 2, frustrated: 1 };
const MOOD_EMOJIS: Record<string, string> = { happy: '😊', determined: '⚡', zen: '🍃', tired: '☁️', frustrated: '😤' };

const P = {
  accent: '#FF8C69', accentL: '#FFA882', pale: '#FFCBB8',
  bg1: '#FFF5F0', bg2: '#FFE8DC', text: '#2D1A12',
  textMid: '#7A4030', textLight: '#B07060',
  card: 'rgba(255,255,255,0.80)', border: 'rgba(255,140,105,0.18)',
};

export default function Stats() {
  const [, setLocation] = useLocation();
  const { state } = useUserState();
  const { t, language } = useLanguage();

  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const goToPrevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const goToNextMonth = () => { if (isCurrentMonth) return; if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });
  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear  = viewMonth === 0 ? viewYear - 1 : viewYear;

  const moodLabels: Record<string, string> = {
    happy: language === 'fr' ? 'Motivé' : 'Motivated', determined: language === 'fr' ? 'Déterminé' : 'Determined',
    zen: 'Zen', tired: language === 'fr' ? 'Fatigué' : 'Tired', frustrated: language === 'fr' ? 'Frustré' : 'Frustrated',
  };

  const currentMonthData = useMemo(() =>
    state.moodHistory
      .filter(log => { const d = new Date(log.date); return d.getFullYear() === viewYear && d.getMonth() === viewMonth; })
      .map(log => ({
        date:  new Date(log.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short' }),
        score: MOOD_SCORES[log.mood] ?? 3, mood: log.mood,
        label: moodLabels[log.mood] || log.mood, emoji: MOOD_EMOJIS[log.mood] || '😐',
      }))
  , [state.moodHistory, viewYear, viewMonth, language]);

  const prevMonthData = useMemo(() =>
    state.moodHistory.filter(log => { const d = new Date(log.date); return d.getFullYear() === prevYear && d.getMonth() === prevMonth; })
  , [state.moodHistory, prevYear, prevMonth]);

  const avgScore     = currentMonthData.length > 0 ? currentMonthData.reduce((s, d) => s + d.score, 0) / currentMonthData.length : null;
  const prevAvgScore = prevMonthData.length > 0 ? prevMonthData.reduce((s, d) => s + (MOOD_SCORES[d.mood] ?? 3), 0) / prevMonthData.length : null;
  const trend = avgScore !== null && prevAvgScore !== null
    ? avgScore > prevAvgScore + 0.3 ? 'better' : avgScore < prevAvgScore - 0.3 ? 'worse' : 'same' : null;

  const scoreToMood = (s: number) => {
    if (s >= 4.5) return { emoji: '😊', label: language === 'fr' ? 'Excellent'     : 'Excellent'  };
    if (s >= 3.5) return { emoji: '⚡', label: language === 'fr' ? 'Bien'          : 'Good'       };
    if (s >= 2.5) return { emoji: '🍃', label: language === 'fr' ? 'Neutre'        : 'Neutral'    };
    if (s >= 1.5) return { emoji: '☁️', label: language === 'fr' ? 'Difficile'     : 'Hard'       };
    return              { emoji: '😤', label: language === 'fr' ? 'Très difficile' : 'Very hard'  };
  };

  const motivationMessage = () => {
    if (!trend) return null;
    if (trend === 'better') return language === 'fr' ? '🚀 Vous allez mieux que le mois dernier ! Continuez ainsi.' : '🚀 You are doing better than last month! Keep it up.';
    if (trend === 'worse')  return language === 'fr' ? '💪 Ce mois est plus difficile. Chaque jour est une nouvelle chance.' : '💪 This month is harder. Every day is a new chance.';
    return language === 'fr' ? '✨ Stable et régulier. La constance est une force.' : '✨ Stable and consistent. Consistency is a strength.';
  };

  const lastVisitFormatted = state.lastVisit ? new Date(state.lastVisit).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }) : '-';

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="px-3 py-2 rounded-xl text-center shadow-lg" style={{ background: 'white', border: `1px solid ${P.border}`, boxShadow: '0 4px 16px rgba(255,140,105,0.15)' }}>
        <p className="text-2xl">{d.emoji}</p>
        <p className="text-xs font-semibold" style={{ color: P.text }}>{d.label}</p>
        <p className="text-xs" style={{ color: P.textLight }}>{d.date}</p>
      </div>
    );
  };

  const cardStyle = { background: P.card, border: `1px solid ${P.border}`, borderRadius: '1rem', boxShadow: `0 2px 16px rgba(255,140,105,0.08)`, backdropFilter: 'blur(12px)' };

  return (
    <div className="min-h-screen pb-40" style={{ background: `linear-gradient(160deg, ${P.bg1} 0%, ${P.bg2} 50%, ${P.bg1} 100%)` }}>

      <header className="px-6 pt-10 pb-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold" style={{ color: P.text }}>{t.stats.title}</h1>
            <p className="mt-1 text-sm" style={{ color: P.textLight }}>{t.stats.subtitle}</p>
          </div>
          {/* ✅ Croix fermeture */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setLocation('/')}
            className="mt-1 w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,140,105,0.12)', border: '1px solid rgba(255,140,105,0.25)' }}
          >
            <X className="w-4 h-4" style={{ color: P.accent }} />
          </motion.button>
        </motion.div>
      </header>

      <div className="px-4 space-y-4">

        {/* Streak */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={cardStyle} className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: P.textLight }}>{t.stats.currentStreak}</p>
            <h2 className="text-4xl font-bold" style={{ background: `linear-gradient(135deg, ${P.accent}, ${P.accentL})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {state.streak} {state.streak <= 1 ? t.stats.day : t.stats.days}
            </h2>
          </div>
          <div className="p-4 rounded-full" style={{ background: 'rgba(255,140,105,0.12)' }}>
            <Flame className="w-8 h-8" style={{ color: P.accent }} />
          </div>
        </motion.div>

        {/* Graphique humeur */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: P.accent }} />
              <h3 className="text-base font-bold" style={{ color: P.text }}>{t.stats.moodHistory}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={goToPrevMonth} className="p-1.5 rounded-full" style={{ background: 'rgba(255,140,105,0.10)' }}>
                <ChevronLeft className="w-4 h-4" style={{ color: P.textMid }} />
              </button>
              <span className="text-xs font-medium capitalize min-w-[90px] text-center" style={{ color: P.textMid }}>{monthName}</span>
              <button onClick={goToNextMonth} disabled={isCurrentMonth} className="p-1.5 rounded-full disabled:opacity-30" style={{ background: 'rgba(255,140,105,0.10)' }}>
                <ChevronRight className="w-4 h-4" style={{ color: P.textMid }} />
              </button>
            </div>
          </div>

          {avgScore !== null && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,140,105,0.08)', border: `1px solid ${P.border}` }}>
              <span className="text-2xl">{scoreToMood(avgScore).emoji}</span>
              <div className="flex-1">
                <p className="text-xs" style={{ color: P.textLight }}>{language === 'fr' ? 'Humeur moyenne ce mois' : 'Average mood this month'}</p>
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  {scoreToMood(avgScore).label}
                  <span className="font-normal ml-1.5 text-xs" style={{ color: P.textLight }}>{avgScore.toFixed(1)}/5</span>
                </p>
              </div>
              {trend && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: trend === 'better' ? 'rgba(52,211,153,0.12)' : trend === 'worse' ? 'rgba(255,140,105,0.12)' : 'rgba(176,112,96,0.10)', color: trend === 'better' ? '#059669' : trend === 'worse' ? P.accent : P.textLight }}>
                  {trend === 'better' ? <TrendingUp className="w-3 h-3" /> : trend === 'worse' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  <span>{trend === 'better' ? (language === 'fr' ? '+Mieux' : '+Better') : trend === 'worse' ? (language === 'fr' ? '-Difficile' : '-Harder') : (language === 'fr' ? 'Stable' : 'Stable')}</span>
                  {prevAvgScore !== null && <span className="opacity-60 ml-0.5">vs {prevAvgScore.toFixed(1)}</span>}
                </div>
              )}
            </div>
          )}

          <div className="h-44 w-full">
            {currentMonthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentMonthData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={P.accent} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={P.accent} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke={P.textLight} fontSize={9} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis hide domain={[0, 6]} />
                  <ReferenceLine y={3} stroke={P.pale} strokeDasharray="4 4" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke={P.accent} strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)"
                    dot={{ fill: P.accent, strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: P.accentL }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-sm gap-2" style={{ color: P.textLight }}>
                <span className="text-3xl">📭</span>
                <p>{t.stats.noData}</p>
              </div>
            )}
          </div>

          {currentMonthData.length > 0 && (
            <p className="text-[10px] mt-2 text-center" style={{ color: P.textLight }}>
              {language === 'fr' ? '— — ligne pointillée = humeur neutre (Zen)' : '— — dashed line = neutral mood (Zen)'}
            </p>
          )}

          <div className="mt-4 pt-4" style={{ borderTop: `1px solid rgba(255,140,105,0.15)` }}>
            <p className="text-xs mb-3" style={{ color: P.textLight }}>{language === 'fr' ? 'Légende' : 'Legend'}</p>
            <div className="flex items-center justify-between">
              {[
                { score: 1, emoji: '😤', label: language === 'fr' ? 'Frustré'   : 'Frustrated' },
                { score: 2, emoji: '☁️', label: language === 'fr' ? 'Fatigué'   : 'Tired'      },
                { score: 3, emoji: '🍃', label: 'Zen'                                           },
                { score: 4, emoji: '⚡', label: language === 'fr' ? 'Déterminé' : 'Determined' },
                { score: 5, emoji: '😊', label: language === 'fr' ? 'Motivé'    : 'Motivated'  },
              ].map(item => (
                <div key={item.score} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-[9px] text-center leading-tight max-w-[40px]" style={{ color: P.textLight }}>{item.label}</span>
                  <span className="text-[9px] font-bold" style={{ color: P.accent }}>{item.score}/5</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Message motivant */}
        {motivationMessage() && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl"
            style={{ background: trend === 'better' ? 'rgba(52,211,153,0.10)' : trend === 'worse' ? 'rgba(255,140,105,0.10)' : 'rgba(255,203,184,0.20)', border: `1px solid ${trend === 'better' ? 'rgba(52,211,153,0.25)' : trend === 'worse' ? 'rgba(255,140,105,0.25)' : P.border}` }}>
            <p className="text-sm font-medium leading-relaxed" style={{ color: trend === 'better' ? '#059669' : trend === 'worse' ? P.accent : P.textMid }}>
              {motivationMessage()}
            </p>
          </motion.div>
        )}

        {/* Grid stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={cardStyle} className="p-5">
            <div className="p-2 w-fit rounded-xl mb-3" style={{ background: 'rgba(52,211,153,0.12)' }}>
              <Calendar className="w-5 h-5" style={{ color: '#059669' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: P.text }}>{lastVisitFormatted}</p>
            <p className="text-xs mt-1" style={{ color: P.textLight }}>{t.stats.lastVisit}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={cardStyle} className="p-5">
            <div className="p-2 w-fit rounded-xl mb-3" style={{ background: 'rgba(255,140,105,0.12)' }}>
              <Heart className="w-5 h-5" style={{ color: P.accent }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: P.text }}>{state.favorites.length}</p>
            <p className="text-xs mt-1" style={{ color: P.textLight }}>{t.stats.favoritesCount}</p>
          </motion.div>
        </div>

      </div>

      
    </div>
  );
}