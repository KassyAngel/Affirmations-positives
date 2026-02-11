import type { TranslationKeys } from './fr';

export const en: TranslationKeys = {
  // Navigation
  nav: {
    home: 'Home',
    categories: 'Themes',
    favorites: 'Favorites',
    stats: 'Stats'
  },
  // Home page
  home: {
    greeting: 'Hello',
    dateFormat: 'en-US',
    quoteOfTheDay: 'Quote of the Day',
    newQuote: 'New quote',
    currentStreak: 'Current streak',
    days: 'Days',
    day: 'Day',
    loading: 'Loading...',
    error: 'Unable to load quotes at the moment.',
    retry: 'Retry',
    quoteCopied: 'Quote copied!',
    shareTitle: 'Quote of the day'
  },
  // Mood Overlay
  mood: {
    title: 'Hello',
    subtitle: 'How are you feeling today?',
    determined: 'Determined',
    happy: 'Motivated',
    zen: 'Zen',
    tired: 'Tired',
    frustrated: 'Frustrated'
  },
  // Categories
  categories: {
    title: 'Themes',
    subtitle: 'Explore quotes by category',
    work: 'Work',
    love: 'Love',
    sport: 'Sport',
    confidence: 'Confidence',
    support: 'Support',
    breakup: 'Breakup',
    philosophy: 'Philosophy',
    success: 'Success',
    quotes: 'quotes',
    quote: 'quote'
  },
  // Favorites
  favorites: {
    title: 'Favorites',
    subtitle: 'carefully saved quotes',
    empty: 'No favorites',
    emptySubtitle: 'Tap the heart on a quote to find it here.',
    savedCount: '{{count}} carefully saved quotes'
  },
  // Statistics
  stats: {
    title: 'Statistics',
    subtitle: 'Your progress and your mood',
    currentStreak: 'Current streak',
    moodHistory: 'Mood history',
    lastVisit: 'Last visit',
    favoritesCount: 'Favorites',
    noData: 'Not enough data yet',
    days: 'Days',
    day: 'Day'
  },
  // Notifications
  notifications: {
    title: '🌟 Your daily quote',
    body: 'Your daily motivation awaits!',
    permissionTitle: 'Enable notifications',
    permissionMessage: 'Receive an inspiring quote every day at 8am',
    permissionGranted: 'Notifications enabled! 🎉',
    permissionDenied: 'Notifications disabled',
    enable: 'Enable',
    cancel: 'Later',
    viewNow: 'View now',
    later: 'Later'
  },
  // Onboarding
  onboarding: {
    welcome: {
      title: 'Welcome',
      subtitle: 'Discover your daily dose of inspiration',
      description: 'Every day, a quote to guide you, motivate you and inspire you.',
      continue: 'Get Started'
    },
    personalize: {
      title: 'Personalize',
      subtitle: 'your experience',
      description: 'A few details to better accompany you',
      continue: 'Continue'
    },
    age: {
      title: 'How old are you?',
      ranges: {
        young: '13 to 17 years',
        youngAdult: '18 to 24 years',
        adult: '25 to 34 years',
        mature: '35 to 44 years',
        experienced: '45 to 54 years',
        senior: 'Over 55 years'
      }
    },
    name: {
      title: 'What\'s your name?',
      placeholder: 'Your first name',
      continue: 'Continue'
    },
    gender: {
      title: 'Which option best represents you?',
      options: {
        female: 'Female',
        male: 'Male',
        other: 'Other',
        preferNot: 'I prefer not to say'
      }
    },
    complete: {
      title: 'All set!',
      subtitle: 'Your journey begins now',
      description: 'Every day is a new opportunity to grow and be inspired.',
      start: 'Discover'
    },
    skip: 'Skip'
  },
  // Settings
  settings: {
    title: 'Settings',
    language: 'Language',
    notifications: 'Daily notifications',
    notificationTime: 'Notification time',
    about: 'About',
    version: 'Version'
  },
  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    close: 'Close',
    share: 'Share',
    copy: 'Copy',
    delete: 'Delete'
  }
};