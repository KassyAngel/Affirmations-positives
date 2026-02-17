import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ✅ BON CHEMIN : /themes/webp/mobile/ (et non /themes/mobile/webp/)
const getImagePath = (filename: string) => `/themes/webp/mobile/${filename}`;

export type ThemeId =
  | 'afrique'
  | 'ethereal'
  | 'gratitude-champ'
  | 'gratitude-fleurs'
  | 'jardin-japonais'
  | 'lacherprise-ciel'
  | 'lacherprise-ocean'
  | 'minimaliste-1'
  | 'minimaliste-2'
  | 'minimaliste-3'
  | 'minimaliste-6'
  | 'minimaliste-7'
  | 'minimaliste-8'
  | 'minimalite-5'
  | 'motivation-levedusoleil'
  | 'nature'
  | 'plage'
  | 'sombre'
  | 'sunset'
  | 'zen'
  | 'zen-cascade'
  | 'zen-montagnes';

export interface ThemeConfig {
  id: ThemeId;
  label: { fr: string; en: string };
  imagePath: string;
  bgClass: string;
  textClass: string;
  textMutedClass: string;
  cardClass: string;
  borderClass: string;
  buttonClass: string;
  subtleTextClass: string;
  inputClass: string;
  accentClass: string;
  progressClass: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  afrique: {
    id: 'afrique',
    label: { fr: 'Afrique', en: 'Africa' },
    imagePath: getImagePath('afrique.webp'),
    bgClass: 'bg-gradient-to-br from-amber-900 via-orange-800 to-red-900',
    textClass: 'text-white',
    textMutedClass: 'text-amber-100/80',
    cardClass: 'bg-white/10 border-amber-400/20',
    borderClass: 'border-amber-400/30',
    buttonClass: 'bg-amber-500 text-amber-950 hover:bg-amber-400',
    subtleTextClass: 'text-amber-200/60 hover:text-amber-100',
    inputClass: 'bg-white/10 border-amber-400/30 text-white placeholder:text-amber-200/40',
    accentClass: 'text-amber-400',
    progressClass: 'from-amber-400 to-orange-400',
  },
  ethereal: {
    id: 'ethereal',
    label: { fr: 'Éthéré', en: 'Ethereal' },
    imagePath: getImagePath('ethereal.webp'),
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
  'gratitude-champ': {
    id: 'gratitude-champ',
    label: { fr: 'Champ doré', en: 'Golden field' },
    imagePath: getImagePath('gratitude-champ.webp'),
    bgClass: 'bg-gradient-to-br from-yellow-700 via-amber-600 to-orange-700',
    textClass: 'text-white',
    textMutedClass: 'text-yellow-100/80',
    cardClass: 'bg-white/10 border-yellow-400/20',
    borderClass: 'border-yellow-400/30',
    buttonClass: 'bg-yellow-400 text-yellow-950 hover:bg-yellow-300',
    subtleTextClass: 'text-yellow-200/60 hover:text-yellow-100',
    inputClass: 'bg-white/10 border-yellow-400/30 text-white placeholder:text-yellow-200/40',
    accentClass: 'text-yellow-400',
    progressClass: 'from-yellow-400 to-amber-400',
  },
  'gratitude-fleurs': {
    id: 'gratitude-fleurs',
    label: { fr: 'Jardin fleuri', en: 'Flower garden' },
    imagePath: getImagePath('gratitude-fleurs.webp'),
    bgClass: 'bg-gradient-to-br from-pink-700 via-rose-600 to-purple-700',
    textClass: 'text-white',
    textMutedClass: 'text-pink-100/80',
    cardClass: 'bg-white/10 border-pink-400/20',
    borderClass: 'border-pink-400/30',
    buttonClass: 'bg-pink-400 text-pink-950 hover:bg-pink-300',
    subtleTextClass: 'text-pink-200/60 hover:text-pink-100',
    inputClass: 'bg-white/10 border-pink-400/30 text-white placeholder:text-pink-200/40',
    accentClass: 'text-pink-400',
    progressClass: 'from-pink-400 to-rose-400',
  },
  'jardin-japonais': {
    id: 'jardin-japonais',
    label: { fr: 'Jardin japonais', en: 'Japanese garden' },
    imagePath: getImagePath('jardin-japonais.webp'),
    bgClass: 'bg-gradient-to-br from-green-800 via-teal-700 to-emerald-900',
    textClass: 'text-white',
    textMutedClass: 'text-teal-100/80',
    cardClass: 'bg-white/10 border-teal-400/20',
    borderClass: 'border-teal-400/30',
    buttonClass: 'bg-teal-400 text-teal-950 hover:bg-teal-300',
    subtleTextClass: 'text-teal-200/60 hover:text-teal-100',
    inputClass: 'bg-white/10 border-teal-400/30 text-white placeholder:text-teal-200/40',
    accentClass: 'text-teal-400',
    progressClass: 'from-teal-400 to-emerald-400',
  },
  'lacherprise-ciel': {
    id: 'lacherprise-ciel',
    label: { fr: 'Lâcher prise - Ciel', en: 'Let go - Sky' },
    imagePath: getImagePath('lacherprise-ciel.webp'),
    bgClass: 'bg-gradient-to-br from-sky-600 via-blue-500 to-indigo-600',
    textClass: 'text-white',
    textMutedClass: 'text-sky-100/80',
    cardClass: 'bg-white/10 border-sky-400/20',
    borderClass: 'border-sky-400/30',
    buttonClass: 'bg-sky-400 text-sky-950 hover:bg-sky-300',
    subtleTextClass: 'text-sky-200/60 hover:text-sky-100',
    inputClass: 'bg-white/10 border-sky-400/30 text-white placeholder:text-sky-200/40',
    accentClass: 'text-sky-400',
    progressClass: 'from-sky-400 to-blue-400',
  },
  'lacherprise-ocean': {
    id: 'lacherprise-ocean',
    label: { fr: 'Lâcher prise - Océan', en: 'Let go - Ocean' },
    imagePath: getImagePath('lacherprise-ocean.webp'),
    bgClass: 'bg-gradient-to-br from-blue-800 via-cyan-700 to-teal-800',
    textClass: 'text-white',
    textMutedClass: 'text-cyan-100/80',
    cardClass: 'bg-white/10 border-cyan-400/20',
    borderClass: 'border-cyan-400/30',
    buttonClass: 'bg-cyan-400 text-cyan-950 hover:bg-cyan-300',
    subtleTextClass: 'text-cyan-200/60 hover:text-cyan-100',
    inputClass: 'bg-white/10 border-cyan-400/30 text-white placeholder:text-cyan-200/40',
    accentClass: 'text-cyan-400',
    progressClass: 'from-cyan-400 to-blue-400',
  },
  'minimaliste-1': {
    id: 'minimaliste-1',
    label: { fr: 'Minimaliste 1', en: 'Minimal 1' },
    imagePath: getImagePath('minimaliste-1.webp'),
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
  'minimaliste-2': {
    id: 'minimaliste-2',
    label: { fr: 'Minimaliste 2', en: 'Minimal 2' },
    imagePath: getImagePath('minimaliste-2.webp'),
    bgClass: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100',
    textClass: 'text-slate-900',
    textMutedClass: 'text-slate-600',
    cardClass: 'bg-white/80 border-slate-200',
    borderClass: 'border-slate-200',
    buttonClass: 'bg-slate-900 text-slate-50 hover:bg-slate-800',
    subtleTextClass: 'text-slate-400 hover:text-slate-600',
    inputClass: 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
    accentClass: 'text-slate-600',
    progressClass: 'from-slate-400 to-gray-400',
  },
  'minimaliste-3': {
    id: 'minimaliste-3',
    label: { fr: 'Minimaliste 3', en: 'Minimal 3' },
    imagePath: getImagePath('minimaliste-3.webp'),
    bgClass: 'bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100',
    textClass: 'text-neutral-900',
    textMutedClass: 'text-neutral-600',
    cardClass: 'bg-white/80 border-neutral-200',
    borderClass: 'border-neutral-200',
    buttonClass: 'bg-neutral-900 text-neutral-50 hover:bg-neutral-800',
    subtleTextClass: 'text-neutral-400 hover:text-neutral-600',
    inputClass: 'bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400',
    accentClass: 'text-neutral-600',
    progressClass: 'from-neutral-400 to-stone-400',
  },
  'minimaliste-6': {
    id: 'minimaliste-6',
    label: { fr: 'Minimaliste 6', en: 'Minimal 6' },
    imagePath: getImagePath('minimaliste-6.webp'),
    bgClass: 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50',
    textClass: 'text-gray-900',
    textMutedClass: 'text-gray-600',
    cardClass: 'bg-white/80 border-gray-200',
    borderClass: 'border-gray-200',
    buttonClass: 'bg-gray-900 text-gray-50 hover:bg-gray-800',
    subtleTextClass: 'text-gray-400 hover:text-gray-600',
    inputClass: 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400',
    accentClass: 'text-gray-600',
    progressClass: 'from-gray-400 to-slate-400',
  },
  'minimaliste-7': {
    id: 'minimaliste-7',
    label: { fr: 'Minimaliste 7', en: 'Minimal 7' },
    imagePath: getImagePath('minimaliste-7.webp'),
    bgClass: 'bg-gradient-to-br from-zinc-50 via-neutral-50 to-stone-50',
    textClass: 'text-zinc-900',
    textMutedClass: 'text-zinc-600',
    cardClass: 'bg-white/80 border-zinc-200',
    borderClass: 'border-zinc-200',
    buttonClass: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800',
    subtleTextClass: 'text-zinc-400 hover:text-zinc-600',
    inputClass: 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400',
    accentClass: 'text-zinc-600',
    progressClass: 'from-zinc-400 to-neutral-400',
  },
  'minimaliste-8': {
    id: 'minimaliste-8',
    label: { fr: 'Minimaliste 8', en: 'Minimal 8' },
    imagePath: getImagePath('minimaliste-8.webp'),
    bgClass: 'bg-gradient-to-br from-stone-50 via-neutral-50 to-slate-50',
    textClass: 'text-stone-900',
    textMutedClass: 'text-stone-600',
    cardClass: 'bg-white/80 border-stone-200',
    borderClass: 'border-stone-200',
    buttonClass: 'bg-stone-900 text-stone-50 hover:bg-stone-800',
    subtleTextClass: 'text-stone-400 hover:text-stone-600',
    inputClass: 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400',
    accentClass: 'text-stone-600',
    progressClass: 'from-stone-400 to-neutral-400',
  },
  'minimalite-5': {
    id: 'minimalite-5',
    label: { fr: 'Minimaliste 5', en: 'Minimal 5' },
    imagePath: getImagePath('minimalite-5.webp'),
    bgClass: 'bg-gradient-to-br from-gray-100 via-slate-100 to-zinc-100',
    textClass: 'text-gray-900',
    textMutedClass: 'text-gray-700',
    cardClass: 'bg-white/90 border-gray-300',
    borderClass: 'border-gray-300',
    buttonClass: 'bg-gray-800 text-gray-50 hover:bg-gray-700',
    subtleTextClass: 'text-gray-500 hover:text-gray-700',
    inputClass: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500',
    accentClass: 'text-gray-700',
    progressClass: 'from-gray-500 to-slate-500',
  },
  'motivation-levedusoleil': {
    id: 'motivation-levedusoleil',
    label: { fr: 'Lever du soleil', en: 'Sunrise' },
    imagePath: getImagePath('motivation-levedusoleil.webp'),
    bgClass: 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500',
    textClass: 'text-white',
    textMutedClass: 'text-orange-100/90',
    cardClass: 'bg-white/10 border-orange-300/20',
    borderClass: 'border-orange-300/30',
    buttonClass: 'bg-orange-400 text-orange-950 hover:bg-orange-300',
    subtleTextClass: 'text-orange-200/60 hover:text-orange-100',
    inputClass: 'bg-white/10 border-orange-300/30 text-white placeholder:text-orange-200/40',
    accentClass: 'text-orange-300',
    progressClass: 'from-orange-400 to-amber-400',
  },
  nature: {
    id: 'nature',
    label: { fr: 'Nature', en: 'Nature' },
    imagePath: getImagePath('nature.webp'),
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
  plage: {
    id: 'plage',
    label: { fr: 'Plage', en: 'Beach' },
    imagePath: getImagePath('plage.webp'),
    bgClass: 'bg-gradient-to-br from-cyan-600 via-blue-500 to-indigo-600',
    textClass: 'text-white',
    textMutedClass: 'text-cyan-100/80',
    cardClass: 'bg-white/10 border-cyan-400/20',
    borderClass: 'border-cyan-400/30',
    buttonClass: 'bg-cyan-400 text-cyan-950 hover:bg-cyan-300',
    subtleTextClass: 'text-cyan-200/60 hover:text-cyan-100',
    inputClass: 'bg-white/10 border-cyan-400/30 text-white placeholder:text-cyan-200/40',
    accentClass: 'text-cyan-400',
    progressClass: 'from-cyan-400 to-blue-400',
  },
  sombre: {
    id: 'sombre',
    label: { fr: 'Sombre', en: 'Dark' },
    imagePath: getImagePath('sombre.webp'),
    bgClass: 'bg-gradient-to-br from-gray-900 via-slate-900 to-black',
    textClass: 'text-white',
    textMutedClass: 'text-gray-400',
    cardClass: 'bg-white/5 border-white/10',
    borderClass: 'border-white/10',
    buttonClass: 'bg-white/10 text-white hover:bg-white/20',
    subtleTextClass: 'text-gray-500 hover:text-gray-400',
    inputClass: 'bg-white/5 border-white/10 text-white placeholder:text-gray-500',
    accentClass: 'text-gray-300',
    progressClass: 'from-gray-500 to-slate-500',
  },
  sunset: {
    id: 'sunset',
    label: { fr: 'Coucher de soleil', en: 'Sunset' },
    imagePath: getImagePath('sunset.webp'),
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
  zen: {
    id: 'zen',
    label: { fr: 'Zen', en: 'Zen' },
    imagePath: getImagePath('zen.webp'),
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
  'zen-cascade': {
    id: 'zen-cascade',
    label: { fr: 'Cascade zen', en: 'Zen waterfall' },
    imagePath: getImagePath('zen-cascade.webp'),
    bgClass: 'bg-gradient-to-br from-slate-700 via-teal-800 to-cyan-900',
    textClass: 'text-white',
    textMutedClass: 'text-slate-200/80',
    cardClass: 'bg-white/10 border-slate-400/20',
    borderClass: 'border-slate-400/30',
    buttonClass: 'bg-slate-300 text-slate-900 hover:bg-slate-200',
    subtleTextClass: 'text-slate-300/60 hover:text-slate-200',
    inputClass: 'bg-white/10 border-slate-400/30 text-white placeholder:text-slate-300/40',
    accentClass: 'text-cyan-400',
    progressClass: 'from-cyan-400 to-teal-400',
  },
  'zen-montagnes': {
    id: 'zen-montagnes',
    label: { fr: 'Montagnes zen', en: 'Zen mountains' },
    imagePath: getImagePath('zen-montagnes.webp'),
    bgClass: 'bg-gradient-to-br from-indigo-900 via-blue-800 to-slate-900',
    textClass: 'text-white',
    textMutedClass: 'text-indigo-200/80',
    cardClass: 'bg-white/10 border-indigo-400/20',
    borderClass: 'border-indigo-400/30',
    buttonClass: 'bg-indigo-400 text-indigo-950 hover:bg-indigo-300',
    subtleTextClass: 'text-indigo-200/60 hover:text-indigo-100',
    inputClass: 'bg-white/10 border-indigo-400/30 text-white placeholder:text-indigo-200/40',
    accentClass: 'text-indigo-400',
    progressClass: 'from-indigo-400 to-blue-400',
  },
};

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
  getThemeLabel: (id: ThemeId, lang: 'fr' | 'en') => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (stored && stored in THEMES) return stored;
    return 'zen';
  });

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    document.documentElement.setAttribute('data-theme', id);
  };

  const getThemeLabel = (id: ThemeId, lang: 'fr' | 'en') => {
    return THEMES[id].label[lang];
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, theme: THEMES[themeId], setTheme, getThemeLabel }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}