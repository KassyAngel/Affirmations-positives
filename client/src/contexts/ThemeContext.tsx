import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeId =
  | 'classic'
  | 'nature'
  | 'ethereal'
  | 'mountain'
  | 'minimal'
  | 'sunset';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  /** Classes Tailwind pour le fond de l'app */
  bgClass: string;
  /** Classes pour les textes principaux */
  textClass: string;
  /** Classes pour les textes secondaires */
  textMutedClass: string;
  /** Classes pour les cartes / surfaces */
  cardClass: string;
  /** Classes pour les bordures */
  borderClass: string;
  /** Classes pour les boutons principaux */
  buttonClass: string;
  /** Couleur du bouton "Ignorer" / retour */
  subtleTextClass: string;
  /** Classes pour les inputs */
  inputClass: string;
  /** Couleur du slider / accent */
  accentClass: string;
  /** Couleur de la barre de progression de l'onboarding */
  progressClass: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  classic: {
    id: 'classic',
    label: 'Classique',
    bgClass: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    textClass: 'text-white',
    textMutedClass: 'text-white/70',
    cardClass: 'bg-white/10 border-white/20',
    borderClass: 'border-white/20',
    buttonClass: 'bg-white text-slate-900 hover:bg-white/90',
    subtleTextClass: 'text-white/50 hover:text-white/80',
    inputClass: 'bg-white/10 border-white/20 text-white placeholder:text-white/40',
    accentClass: 'text-violet-400',
    progressClass: 'from-violet-400 to-purple-500',
  },
  nature: {
    id: 'nature',
    label: 'Nature',
    bgClass: 'bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900',
    textClass: 'text-white',
    textMutedClass: 'text-emerald-100/80',
    cardClass: 'bg-white/10 border-emerald-400/20',
    borderClass: 'border-emerald-400/30',
    buttonClass: 'bg-emerald-400 text-emerald-900 hover:bg-emerald-300',
    subtleTextClass: 'text-emerald-200/60 hover:text-emerald-100',
    inputClass: 'bg-white/10 border-emerald-400/30 text-white placeholder:text-emerald-200/40',
    accentClass: 'text-emerald-400',
    progressClass: 'from-emerald-400 to-teal-400',
  },
  ethereal: {
    id: 'ethereal',
    label: 'Éthéré',
    bgClass: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-900',
    textClass: 'text-white',
    textMutedClass: 'text-purple-200/80',
    cardClass: 'bg-white/10 border-purple-400/20',
    borderClass: 'border-purple-400/30',
    buttonClass: 'bg-gradient-to-r from-purple-400 to-violet-400 text-white hover:from-purple-300 hover:to-violet-300',
    subtleTextClass: 'text-purple-300/60 hover:text-purple-200',
    inputClass: 'bg-white/10 border-purple-400/30 text-white placeholder:text-purple-300/40',
    accentClass: 'text-violet-400',
    progressClass: 'from-purple-400 to-violet-400',
  },
  mountain: {
    id: 'mountain',
    label: 'Montagne',
    bgClass: 'bg-gradient-to-br from-slate-700 via-blue-900 to-slate-900',
    textClass: 'text-white',
    textMutedClass: 'text-blue-200/80',
    cardClass: 'bg-white/10 border-blue-400/20',
    borderClass: 'border-blue-400/30',
    buttonClass: 'bg-blue-400 text-blue-950 hover:bg-blue-300',
    subtleTextClass: 'text-blue-200/60 hover:text-blue-100',
    inputClass: 'bg-white/10 border-blue-400/30 text-white placeholder:text-blue-200/40',
    accentClass: 'text-blue-400',
    progressClass: 'from-blue-400 to-cyan-400',
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    bgClass: 'bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100',
    textClass: 'text-stone-900',
    textMutedClass: 'text-stone-600',
    cardClass: 'bg-white/80 border-stone-200',
    borderClass: 'border-stone-200',
    buttonClass: 'bg-stone-900 text-stone-50 hover:bg-stone-800',
    subtleTextClass: 'text-stone-400 hover:text-stone-600',
    inputClass: 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400',
    accentClass: 'text-amber-600',
    progressClass: 'from-amber-400 to-orange-400',
  },
  sunset: {
    id: 'sunset',
    label: 'Coucher de soleil',
    bgClass: 'bg-gradient-to-br from-orange-900 via-rose-900 to-pink-950',
    textClass: 'text-white',
    textMutedClass: 'text-orange-200/80',
    cardClass: 'bg-white/10 border-orange-400/20',
    borderClass: 'border-orange-400/30',
    buttonClass: 'bg-gradient-to-r from-orange-400 to-rose-400 text-white hover:from-orange-300 hover:to-rose-300',
    subtleTextClass: 'text-orange-200/60 hover:text-orange-100',
    inputClass: 'bg-white/10 border-orange-400/30 text-white placeholder:text-orange-200/40',
    accentClass: 'text-orange-400',
    progressClass: 'from-orange-400 to-rose-400',
  },
};

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (stored && stored in THEMES) return stored;
    return 'classic';
  });

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    // Applique la classe de thème sur <html> pour les styles globaux
    document.documentElement.setAttribute('data-theme', id);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, theme: THEMES[themeId], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}