import { useState, useEffect } from 'react';
import type { Mood, MoodLog, UserState } from '@shared/schema';

const STORAGE_KEY = 'daily_quotes_user_state';

const defaultState: UserState = {
  favorites: [],
  streak: 0,
  lastVisit: null,
  moodHistory: [],
  dailyQuote: null,
};

export function useUserState() {
  const [state, setState] = useState<UserState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Actions
  const toggleFavorite = (quoteId: number) => {
    setState(prev => {
      const isFav = prev.favorites.includes(quoteId);
      return {
        ...prev,
        favorites: isFav 
          ? prev.favorites.filter(id => id !== quoteId)
          : [...prev.favorites, quoteId]
      };
    });
  };

  const logMood = (mood: Mood, note?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      // Check if already logged today
      if (prev.moodHistory.some(m => m.date === today)) {
        return prev;
      }
      return {
        ...prev,
        moodHistory: [...prev.moodHistory, { date: today, mood, note }]
      };
    });
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      if (prev.lastVisit === today) return prev; // Already visited today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = prev.streak;
      if (prev.lastVisit === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1; // Reset or start
      }

      return {
        ...prev,
        streak: newStreak,
        lastVisit: today
      };
    });
  };

  const setDailyQuote = (quoteId: number) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      dailyQuote: { date: today, quoteId }
    }));
  };

  const hasLoggedMoodToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return state.moodHistory.some(m => m.date === today);
  };
  
  const getTodaysMood = (): Mood | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return state.moodHistory.find(m => m.date === today)?.mood;
  };

  return {
    state,
    toggleFavorite,
    logMood,
    updateStreak,
    setDailyQuote,
    hasLoggedMoodToday,
    getTodaysMood
  };
}
