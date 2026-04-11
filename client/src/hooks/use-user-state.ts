import { useState, useEffect, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { Mood, UserState } from '@shared/schema';

const STORAGE_KEY = 'daily_quotes_user_state';

const defaultState: UserState = {
  favorites: [],
  streak: 0,
  lastVisit: null,
  moodHistory: [],
  dailyQuote: null,
};

// ✅ FIX TIMEZONE : getLocalDateString() utilise l'heure locale de l'appareil
// et non UTC comme toISOString() — évite le bug de streak sur les timezones UTC+X
function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayLocalString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

export function useUserState() {
  const [state, setState]   = useState<UserState>(defaultState);
  // ✅ isReady exposé au composant : permet d'attendre que Preferences soit
  // chargé avant d'appeler updateStreak() — évite le race condition qui
  // écrasait le streak avec defaultState (streak: 0) au montage
  const [isReady, setIsReady] = useState(false);
  const loaded = useRef(false);

  // Chargement initial depuis Capacitor Preferences
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    Preferences.get({ key: STORAGE_KEY }).then(({ value }) => {
      if (value) {
        try {
          setState(JSON.parse(value));
        } catch {
          setState(defaultState);
        }
      }
      setIsReady(true); // ✅ signale que les données sont prêtes
    });
  }, []);

  // Sauvegarde à chaque changement (seulement après chargement initial)
  useEffect(() => {
    if (!isReady) return;
    Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(state) });
  }, [state, isReady]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const toggleFavorite = (quoteId: number) => {
    setState(prev => {
      const isFav = prev.favorites.includes(quoteId);
      return {
        ...prev,
        favorites: isFav
          ? prev.favorites.filter(id => id !== quoteId)
          : [...prev.favorites, quoteId],
      };
    });
  };

  const logMood = (mood: Mood, note?: string) => {
    const today = getLocalDateString();
    setState(prev => {
      if (prev.moodHistory.some(m => m.date === today)) return prev;
      return {
        ...prev,
        moodHistory: [...prev.moodHistory, { date: today, mood, note }],
      };
    });
  };

  const updateStreak = () => {
    const today     = getLocalDateString();
    const yesterday = getYesterdayLocalString();

    setState(prev => {
      if (prev.lastVisit === today) return prev;

      const newStreak = prev.lastVisit === yesterday
        ? prev.streak + 1
        : 1;

      return {
        ...prev,
        streak:    newStreak,
        lastVisit: today,
      };
    });
  };

  const setDailyQuote = (quoteId: number) => {
    const today = getLocalDateString();
    setState(prev => ({
      ...prev,
      dailyQuote: { date: today, quoteId },
    }));
  };

  const hasLoggedMoodToday = (): boolean => {
    const today = getLocalDateString();
    return state.moodHistory.some(m => m.date === today);
  };

  const getTodaysMood = (): Mood | undefined => {
    const today = getLocalDateString();
    return state.moodHistory.find(m => m.date === today)?.mood;
  };

  return {
    state,
    isReady,        // ✅ nouveau — à utiliser dans Home.tsx
    toggleFavorite,
    logMood,
    updateStreak,
    setDailyQuote,
    hasLoggedMoodToday,
    getTodaysMood,
  };
}