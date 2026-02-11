export const fr = {
  // Navigation
  nav: {
    home: 'Accueil',
    categories: 'Thèmes',
    favorites: 'Favoris',
    stats: 'Stats'
  },
  // Page d'accueil
  home: {
    greeting: 'Bonjour',
    dateFormat: 'fr-FR',
    quoteOfTheDay: 'Citation du Jour',
    newQuote: 'Nouvelle citation',
    currentStreak: 'Série actuelle',
    days: 'Jours',
    day: 'Jour',
    loading: 'Chargement...',
    error: 'Impossible de charger les citations pour le moment.',
    retry: 'Réessayer',
    quoteCopied: 'Citation copiée !',
    shareTitle: 'Citation du jour'
  },
  // Mood Overlay
  mood: {
    title: 'Bonjour',
    subtitle: 'Comment te sens-tu aujourd\'hui ?',
    determined: 'Déterminé',
    happy: 'Motivé',
    zen: 'Zen',
    tired: 'Fatigué',
    frustrated: 'Frustré'
  },
  // Catégories
  categories: {
    title: 'Thèmes',
    subtitle: 'Explorez les citations par catégorie',
    work: 'Travail',
    love: 'Amour',
    sport: 'Sport',
    confidence: 'Confiance',
    support: 'Soutien',
    breakup: 'Rupture',
    philosophy: 'Philosophie',
    success: 'Succès',
    quotes: 'citations',
    quote: 'citation'
  },
  // Favoris
  favorites: {
    title: 'Favoris',
    subtitle: 'citations gardées précieusement',
    empty: 'Aucun favori',
    emptySubtitle: 'Touchez le cœur sur une citation pour la retrouver ici.',
    savedCount: '{{count}} citations gardées précieusement'
  },
  // Statistiques
  stats: {
    title: 'Statistiques',
    subtitle: 'Votre progression et votre humeur',
    currentStreak: 'Série actuelle',
    moodHistory: 'Historique d\'humeur',
    lastVisit: 'Dernière visite',
    favoritesCount: 'Favoris',
    noData: 'Pas assez de données pour le moment',
    days: 'Jours',
    day: 'Jour'
  },
  // Notifications
  notifications: {
    title: '🌟 Ta citation du jour',
    body: 'Ta dose de motivation quotidienne t\'attend !',
    permissionTitle: 'Activer les notifications',
    permissionMessage: 'Recevez une citation inspirante chaque jour à 8h',
    permissionGranted: 'Notifications activées ! 🎉',
    permissionDenied: 'Notifications désactivées',
    enable: 'Activer',
    cancel: 'Plus tard',
    viewNow: 'Voir maintenant',
    later: 'Plus tard'
  },
  // Onboarding
  onboarding: {
    welcome: {
      title: 'Bienvenue',
      subtitle: 'Découvrez votre dose quotidienne d\'inspiration',
      description: 'Chaque jour, une citation pour vous accompagner, vous motiver et vous inspirer.',
      continue: 'Commencer'
    },
    personalize: {
      title: 'Personnalisez',
      subtitle: 'votre expérience',
      description: 'Quelques informations pour mieux vous accompagner',
      continue: 'Continuer'
    },
    age: {
      title: 'Quel âge avez-vous ?',
      ranges: {
        young: '13 à 17 ans',
        youngAdult: '18 à 24 ans',
        adult: '25 à 34 ans',
        mature: '35 à 44 ans',
        experienced: '45 à 54 ans',
        senior: 'Plus de 55 ans'
      }
    },
    name: {
      title: 'Comment vous appelez-vous ?',
      placeholder: 'Votre prénom',
      continue: 'Continuer'
    },
    gender: {
      title: 'Quelle option vous représente le mieux ?',
      options: {
        female: 'Femme',
        male: 'Homme',
        other: 'Autre',
        preferNot: 'Je préfère ne pas le dire'
      }
    },
    complete: {
      title: 'Tout est prêt !',
      subtitle: 'Votre voyage commence maintenant',
      description: 'Chaque jour est une nouvelle opportunité de grandir et de s\'inspirer.',
      start: 'Découvrir'
    },
    skip: 'Ignorer'
  },
  // Settings
  settings: {
    title: 'Paramètres',
    language: 'Langue',
    notifications: 'Notifications quotidiennes',
    notificationTime: 'Heure de notification',
    about: 'À propos',
    version: 'Version'
  },
  // Général
  common: {
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    success: 'Succès',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    close: 'Fermer',
    share: 'Partager',
    copy: 'Copier',
    delete: 'Supprimer'
  }
};

export type TranslationKeys = typeof fr;