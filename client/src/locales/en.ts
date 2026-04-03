import type { TranslationKeys } from './fr';

export const en: TranslationKeys = {
  nav: {
    home: 'Home',
    categories: 'Categories',
    favorites: 'Favorites',
    stats: 'Stats'
  },
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
  mood: {
    title: 'Hello',
    subtitle: 'How are you feeling today?',
    determined: 'Determined',
    happy: 'Motivated',
    zen: 'Zen',
    tired: 'Tired',
    frustrated: 'Frustrated'
  },
  categories: {
    title: 'Categories',
    subtitle: 'Explore quotes by category',
    work: 'Career',
    love: 'Love',
    sport: 'Energy & Sport',
    confidence: 'Self-confidence',
    support: 'Stress & Anxiety',
    breakup: 'Heartbreak',
    philosophy: 'Wisdom',
    success: 'Happiness',
    gratitude: 'Gratitude',
    family: 'Family',
    wellness: 'Wellness',
    femininity: 'Femininity',
    'letting-go': 'Letting Go',
    quotes: 'quotes',
    quote: 'quote'
  },
  favorites: {
    title: 'Favorites',
    subtitle: 'carefully saved quotes',
    empty: 'No favorites',
    emptySubtitle: 'Tap the heart on a quote to find it here.',
    savedCount: '{{count}} carefully saved quotes'
  },
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
      title: 'What is your name?',
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
    notifications: {
      title: 'Receive quotes throughout the day',
      subtitle: 'Small doses of motivation can make a big difference',
    },
    theme: {
      title: 'Which category would you like to start with?',
    },
    widget: {
      title: 'Add a widget to your home screen',
      subtitle: 'On your phone home screen, press and hold an empty area, then select the Motivation widget from the list',
    },
    complete: {
      title: 'All set!',
      subtitle: 'Your journey begins now',
      description: 'Every day is a new opportunity to grow and be inspired.',
      start: 'Discover'
    },
    skip: 'Skip'
  },
  releaseJournal: {
    title: 'Release Journal',
    subtitle: 'Release your negative thoughts',
    placeholder: 'Write your negative thoughts here...\n\nLet out what weighs on you, then release it.',
    saveButton: 'Keep this thought',
    burnButton: 'Release',
    savedThoughts: 'Saved thoughts',
    burnedCount: 'thoughts released',
    emptyState: 'No saved thoughts',
    emptyStateSubtitle: 'Write your thoughts and choose to save them or release them immediately',
    confirmBurn: 'Release this thought?',
    confirmBurnMessage: 'Once released, this thought will disappear permanently.',
    cancel: 'Cancel',
    confirm: 'Release',
    positiveMessages: [
      "You just released a burden. Take a deep breath.",
      "This thought does not define you. You are stronger than that.",
      "Every release is a step towards lightness.",
      "You deserve inner peace. Keep moving forward.",
      "Like a butterfly, you release yourself to soar higher.",
      "Let this negative wave drift away. Calm is returning.",
      "After the rain always comes sunshine.",
      "You show courage by releasing your thoughts.",
      "Lightness awaits you. You have earned it.",
      "Every thought released is a victory over yourself."
    ]
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    notifications: 'Daily notifications',
    notificationTime: 'Notification time',
    about: 'About',
    version: 'Version'
  },
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