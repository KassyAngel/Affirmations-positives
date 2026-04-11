import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { Mood, UserState } from '@shared/schema';

const STORAGE_KEY = 'daily_quotes_user_state';

const defaultState: UserState = {
  favorites:   [],
  streak:      0,
  lastVisit:   null,
  moodHistory: [],
  dailyQuote:  null,
};

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

function useUserStateInternal() {
  const [state, setState]     = useState<UserState>(defaultState);
  const [isReady, setIsReady] = useState(false);
  const loaded                = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    Preferences.get({ key: STORAGE_KEY }).then(({ value }) => {
      if (value) {
        try { setState(JSON.parse(value)); } catch { setState(defaultState); }
      }
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;
    Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(state) });
  }, [state, isReady]);

  const toggleFavorite = (quoteId: number) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(quoteId)
        ? prev.favorites.filter(id => id !== quoteId)
        : [...prev.favorites, quoteId],
    }));
  };

  const logMood = (mood: Mood, note?: string) => {
    const today = getLocalDateString();
    setState(prev => {
      if (prev.moodHistory.some(m => m.date === today)) return prev;
      return { ...prev, moodHistory: [...prev.moodHistory, { date: today, mood, note }] };
    });
  };

  const updateStreak = () => {
    const today     = getLocalDateString();
    const yesterday = getYesterdayLocalString();
    setState(prev => {
      if (prev.lastVisit === today) return prev;
      return {
        ...prev,
        streak:    prev.lastVisit === yesterday ? prev.streak + 1 : 1,
        lastVisit: today,
      };
    });
  };

  const setDailyQuote = (quoteId: number) => {
    const today = getLocalDateString();
    setState(prev => ({ ...prev, dailyQuote: { date: today, quoteId } }));
  };

  const hasLoggedMoodToday = (): boolean =>
    state.moodHistory.some(m => m.date === getLocalDateString());

  const getTodaysMood = (): Mood | undefined =>
    state.moodHistory.find(m => m.date === getLocalDateString())?.mood;

  return {
    state, isReady,
    toggleFavorite, logMood, updateStreak,
    setDailyQuote, hasLoggedMoodToday, getTodaysMood,
  };
}

type UserStateContextType = ReturnType<typeof useUserStateInternal>;

const UserStateContext = createContext<UserStateContextType | null>(null);

export function UserStateProvider({ children }: { children: ReactNode }) {
  const value = useUserStateInternal();
  return (
    <UserStateContext.Provider value={value}>
      {children}
    </UserStateContext.Provider>
  );
}

export function useUserStateContext(): UserStateContextType {
  const ctx = useContext(UserStateContext);
  if (!ctx) throw new Error('useUserStateContext must be used inside UserStateProvider');
  return ctx;
}