import { fr } from './fr';
import { en } from './en';

export const translations = {
  fr,
  en
};

export type Language = 'fr' | 'en';

export const languages = [
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' }
];

export { fr, en };