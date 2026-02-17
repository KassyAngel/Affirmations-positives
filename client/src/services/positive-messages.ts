// 📚 Base de 100 messages inspirants et motivants (FR/EN)
// Catégories : Motivation (40), Rassurant (30), Positif (30)

export interface PositiveMessage {
  id: string;
  content: { fr: string; en: string };
  type: 'motivation' | 'reassurance' | 'positive';
}

export const POSITIVE_MESSAGES: PositiveMessage[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MOTIVATION (40 messages)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'mot-1', content: { fr: "Vous êtes plus fort(e) que vous ne le pensez. Continuez d'avancer ! 💪", en: "You are stronger than you think. Keep moving forward! 💪" }, type: 'motivation' },
  { id: 'mot-2', content: { fr: "Chaque petit pas compte. Vous faites du bon travail ! 🌟", en: "Every small step counts. You're doing great! 🌟" }, type: 'motivation' },
  { id: 'mot-3', content: { fr: "Croyez en vos rêves, ils sont à portée de main ✨", en: "Believe in your dreams, they are within reach ✨" }, type: 'motivation' },
  { id: 'mot-4', content: { fr: "Le succès commence par la décision d'essayer 🚀", en: "Success begins with the decision to try 🚀" }, type: 'motivation' },
  { id: 'mot-5', content: { fr: "Vous avez en vous tout ce qu'il faut pour réussir 🎯", en: "You have everything you need to succeed 🎯" }, type: 'motivation' },
  { id: 'mot-6', content: { fr: "Les défis d'aujourd'hui font les victoires de demain 🏆", en: "Today's challenges make tomorrow's victories 🏆" }, type: 'motivation' },
  { id: 'mot-7', content: { fr: "Continuez, vous êtes sur la bonne voie ! 🛤️", en: "Keep going, you're on the right path! 🛤️" }, type: 'motivation' },
  { id: 'mot-8', content: { fr: "Votre détermination est votre plus grande force 💎", en: "Your determination is your greatest strength 💎" }, type: 'motivation' },
  { id: 'mot-9', content: { fr: "Chaque effort vous rapproche de votre objectif 🎯", en: "Every effort brings you closer to your goal 🎯" }, type: 'motivation' },
  { id: 'mot-10', content: { fr: "Vous êtes capable de grandes choses 🌠", en: "You are capable of great things 🌠" }, type: 'motivation' },

  { id: 'mot-11', content: { fr: "La persévérance transforme l'impossible en possible 🔥", en: "Perseverance turns the impossible into possible 🔥" }, type: 'motivation' },
  { id: 'mot-12', content: { fr: "Aujourd'hui est le jour parfait pour commencer 🌅", en: "Today is the perfect day to begin 🌅" }, type: 'motivation' },
  { id: 'mot-13', content: { fr: "Votre potentiel est illimité 🚀", en: "Your potential is unlimited 🚀" }, type: 'motivation' },
  { id: 'mot-14', content: { fr: "Transformez vos doutes en actions 💫", en: "Turn your doubts into actions 💫" }, type: 'motivation' },
  { id: 'mot-15', content: { fr: "Vous êtes l'architecte de votre propre succès 🏗️", en: "You are the architect of your own success 🏗️" }, type: 'motivation' },
  { id: 'mot-16', content: { fr: "Chaque obstacle est une opportunité déguisée 🎭", en: "Every obstacle is a disguised opportunity 🎭" }, type: 'motivation' },
  { id: 'mot-17', content: { fr: "Votre courage inspire les autres 🦁", en: "Your courage inspires others 🦁" }, type: 'motivation' },
  { id: 'mot-18', content: { fr: "Faites ce que vous aimez, aimez ce que vous faites ❤️", en: "Do what you love, love what you do ❤️" }, type: 'motivation' },
  { id: 'mot-19', content: { fr: "Le moment est venu de briller ✨", en: "It's time to shine ✨" }, type: 'motivation' },
  { id: 'mot-20', content: { fr: "Vos efforts ne sont jamais vains 🌱", en: "Your efforts are never in vain 🌱" }, type: 'motivation' },

  { id: 'mot-21', content: { fr: "Osez sortir de votre zone de confort 🦋", en: "Dare to step out of your comfort zone 🦋" }, type: 'motivation' },
  { id: 'mot-22', content: { fr: "Vous êtes en train de créer votre meilleure version 🎨", en: "You are creating your best version 🎨" }, type: 'motivation' },
  { id: 'mot-23', content: { fr: "La constance est la clé du succès 🔑", en: "Consistency is the key to success 🔑" }, type: 'motivation' },
  { id: 'mot-24', content: { fr: "Transformez la peur en carburant 🔋", en: "Turn fear into fuel 🔋" }, type: 'motivation' },
  { id: 'mot-25', content: { fr: "Votre histoire inspire déjà quelqu'un 📖", en: "Your story already inspires someone 📖" }, type: 'motivation' },
  { id: 'mot-26', content: { fr: "Chaque fin est un nouveau commencement 🌈", en: "Every ending is a new beginning 🌈" }, type: 'motivation' },
  { id: 'mot-27', content: { fr: "Vous avez le pouvoir de changer votre vie 🔮", en: "You have the power to change your life 🔮" }, type: 'motivation' },
  { id: 'mot-28', content: { fr: "L'excellence est un voyage, pas une destination 🛤️", en: "Excellence is a journey, not a destination 🛤️" }, type: 'motivation' },
  { id: 'mot-29', content: { fr: "Vos actions d'aujourd'hui créent votre demain 🌟", en: "Your actions today create your tomorrow 🌟" }, type: 'motivation' },
  { id: 'mot-30', content: { fr: "Soyez la meilleure version de vous-même 💎", en: "Be the best version of yourself 💎" }, type: 'motivation' },

  { id: 'mot-31', content: { fr: "Le courage n'est pas l'absence de peur 🦸", en: "Courage is not the absence of fear 🦸" }, type: 'motivation' },
  { id: 'mot-32', content: { fr: "Votre attitude détermine votre altitude 🚁", en: "Your attitude determines your altitude 🚁" }, type: 'motivation' },
  { id: 'mot-33', content: { fr: "Investissez en vous, c'est le meilleur investissement 💰", en: "Invest in yourself, it's the best investment 💰" }, type: 'motivation' },
  { id: 'mot-34', content: { fr: "Chaque jour est une page blanche à écrire 📝", en: "Every day is a blank page to write 📝" }, type: 'motivation' },
  { id: 'mot-35', content: { fr: "Vous êtes exactement là où vous devez être 🗺️", en: "You are exactly where you need to be 🗺️" }, type: 'motivation' },
  { id: 'mot-36', content: { fr: "La discipline d'aujourd'hui est la liberté de demain 🕊️", en: "Today's discipline is tomorrow's freedom 🕊️" }, type: 'motivation' },
  { id: 'mot-37', content: { fr: "Faites-le avec passion ou pas du tout 🔥", en: "Do it with passion or not at all 🔥" }, type: 'motivation' },
  { id: 'mot-38', content: { fr: "Vos rêves méritent votre engagement total 💯", en: "Your dreams deserve your full commitment 💯" }, type: 'motivation' },
  { id: 'mot-39', content: { fr: "Soyez patient, les grandes choses prennent du temps ⏳", en: "Be patient, great things take time ⏳" }, type: 'motivation' },
  { id: 'mot-40', content: { fr: "Vous êtes né(e) pour réussir, pas pour survivre 🌟", en: "You were born to thrive, not just survive 🌟" }, type: 'motivation' },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RASSURANT (30 messages)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'ras-1', content: { fr: "Tout va bien. Prenez une grande respiration 🌸", en: "Everything is okay. Take a deep breath 🌸" }, type: 'reassurance' },
  { id: 'ras-2', content: { fr: "Vous n'êtes pas seul(e). Nous sommes là 💙", en: "You are not alone. We are here 💙" }, type: 'reassurance' },
  { id: 'ras-3', content: { fr: "C'est normal de se sentir ainsi 🤗", en: "It's okay to feel this way 🤗" }, type: 'reassurance' },
  { id: 'ras-4', content: { fr: "Accordez-vous une pause, vous la méritez 🫖", en: "Give yourself a break, you deserve it 🫖" }, type: 'reassurance' },
  { id: 'ras-5', content: { fr: "Chaque jour est un nouveau départ 🌅", en: "Every day is a fresh start 🌅" }, type: 'reassurance' },
  { id: 'ras-6', content: { fr: "Vous faites de votre mieux, c'est suffisant 💚", en: "You're doing your best, that's enough 💚" }, type: 'reassurance' },
  { id: 'ras-7', content: { fr: "Il est bon de ralentir parfois ⏸️", en: "It's good to slow down sometimes ⏸️" }, type: 'reassurance' },
  { id: 'ras-8', content: { fr: "Soyez doux avec vous-même 🌺", en: "Be gentle with yourself 🌺" }, type: 'reassurance' },
  { id: 'ras-9', content: { fr: "Vos émotions sont valides 🎭", en: "Your emotions are valid 🎭" }, type: 'reassurance' },
  { id: 'ras-10', content: { fr: "Il n'y a pas de honte à demander de l'aide 🤝", en: "There's no shame in asking for help 🤝" }, type: 'reassurance' },

  { id: 'ras-11', content: { fr: "Vous avez le droit de prendre soin de vous 🛁", en: "You have the right to take care of yourself 🛁" }, type: 'reassurance' },
  { id: 'ras-12', content: { fr: "Les moments difficiles passent toujours ⛅", en: "Difficult moments always pass ⛅" }, type: 'reassurance' },
  { id: 'ras-13', content: { fr: "Votre bien-être est une priorité 🧘", en: "Your well-being is a priority 🧘" }, type: 'reassurance' },
  { id: 'ras-14', content: { fr: "Il est courageux de reconnaître ses limites 🛡️", en: "It's brave to recognize your limits 🛡️" }, type: 'reassurance' },
  { id: 'ras-15', content: { fr: "Vous méritez la compassion, surtout la vôtre 💝", en: "You deserve compassion, especially your own 💝" }, type: 'reassurance' },
  { id: 'ras-16', content: { fr: "Prenez le temps qu'il vous faut ⌛", en: "Take all the time you need ⌛" }, type: 'reassurance' },
  { id: 'ras-17', content: { fr: "Votre santé mentale compte autant que tout 🧠", en: "Your mental health matters just as much 🧠" }, type: 'reassurance' },
  { id: 'ras-18', content: { fr: "Il n'y a pas de mauvaise émotion 🎨", en: "There's no bad emotion 🎨" }, type: 'reassurance' },
  { id: 'ras-19', content: { fr: "Vous êtes humain(e), c'est déjà beaucoup 🌍", en: "You are human, that's already a lot 🌍" }, type: 'reassurance' },
  { id: 'ras-20', content: { fr: "La guérison n'est pas linéaire 📈", en: "Healing is not linear 📈" }, type: 'reassurance' },

  { id: 'ras-21', content: { fr: "Vos efforts, même invisibles, comptent 👁️", en: "Your efforts, even invisible, count 👁️" }, type: 'reassurance' },
  { id: 'ras-22', content: { fr: "Vous avez survécu à 100% de vos mauvais jours 📊", en: "You've survived 100% of your worst days 📊" }, type: 'reassurance' },
  { id: 'ras-23', content: { fr: "Le repos fait partie du progrès 💤", en: "Rest is part of progress 💤" }, type: 'reassurance' },
  { id: 'ras-24', content: { fr: "Vous n'avez pas à être parfait(e) 🎯", en: "You don't have to be perfect 🎯" }, type: 'reassurance' },
  { id: 'ras-25', content: { fr: "Votre rythme est le bon rythme 🎵", en: "Your pace is the right pace 🎵" }, type: 'reassurance' },
  { id: 'ras-26', content: { fr: "Il est sage de reconnaître sa fatigue 😴", en: "It's wise to acknowledge your tiredness 😴" }, type: 'reassurance' },
  { id: 'ras-27', content: { fr: "Vous faites du mieux que vous pouvez 🌟", en: "You're doing the best you can 🌟" }, type: 'reassurance' },
  { id: 'ras-28', content: { fr: "Votre parcours est unique et valable 🛤️", en: "Your journey is unique and valid 🛤️" }, type: 'reassurance' },
  { id: 'ras-29', content: { fr: "Accepter ses limites, c'est aussi une force 💪", en: "Accepting limits is also a strength 💪" }, type: 'reassurance' },
  { id: 'ras-30', content: { fr: "Vous êtes déjà assez bien comme vous êtes 🌈", en: "You are already good enough as you are 🌈" }, type: 'reassurance' },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POSITIF (30 messages)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'pos-1', content: { fr: "Aujourd'hui est une belle journée ! ☀️", en: "Today is a beautiful day! ☀️" }, type: 'positive' },
  { id: 'pos-2', content: { fr: "Souriez ! La vie est belle 😊", en: "Smile! Life is beautiful 😊" }, type: 'positive' },
  { id: 'pos-3', content: { fr: "Vous méritez toutes les bonnes choses 🎁", en: "You deserve all the good things 🎁" }, type: 'positive' },
  { id: 'pos-4', content: { fr: "Votre présence illumine le monde 🌟", en: "Your presence lights up the world 🌟" }, type: 'positive' },
  { id: 'pos-5', content: { fr: "Célébrez vos petites victoires 🎉", en: "Celebrate your small wins 🎉" }, type: 'positive' },
  { id: 'pos-6', content: { fr: "La joie est contagieuse, partagez-la 😄", en: "Joy is contagious, share it 😄" }, type: 'positive' },
  { id: 'pos-7', content: { fr: "Vous êtes une personne extraordinaire 🦄", en: "You are an extraordinary person 🦄" }, type: 'positive' },
  { id: 'pos-8', content: { fr: "Le bonheur vous va si bien 💫", en: "Happiness looks so good on you 💫" }, type: 'positive' },
  { id: 'pos-9', content: { fr: "Votre énergie positive change des vies ⚡", en: "Your positive energy changes lives ⚡" }, type: 'positive' },
  { id: 'pos-10', content: { fr: "Chaque moment est une bénédiction 🙏", en: "Every moment is a blessing 🙏" }, type: 'positive' },

  { id: 'pos-11', content: { fr: "Vous rayonnez de beauté intérieure 💖", en: "You radiate inner beauty 💖" }, type: 'positive' },
  { id: 'pos-12', content: { fr: "La vie vous réserve de belles surprises 🎈", en: "Life has beautiful surprises for you 🎈" }, type: 'positive' },
  { id: 'pos-13', content: { fr: "Votre sourire est votre super pouvoir 🦸", en: "Your smile is your superpower 🦸" }, type: 'positive' },
  { id: 'pos-14', content: { fr: "Vous êtes une source d'inspiration 💡", en: "You are a source of inspiration 💡" }, type: 'positive' },
  { id: 'pos-15', content: { fr: "Le monde est plus beau avec vous dedans 🌍", en: "The world is more beautiful with you in it 🌍" }, type: 'positive' },
  { id: 'pos-16', content: { fr: "Votre gentillesse fait toute la différence 🤲", en: "Your kindness makes all the difference 🤲" }, type: 'positive' },
  { id: 'pos-17', content: { fr: "Chaque jour avec vous est un cadeau 🎀", en: "Every day with you is a gift 🎀" }, type: 'positive' },
  { id: 'pos-18', content: { fr: "Vous créez de la magie partout où vous allez ✨", en: "You create magic wherever you go ✨" }, type: 'positive' },
  { id: 'pos-19', content: { fr: "La gratitude transforme votre vie 🌺", en: "Gratitude transforms your life 🌺" }, type: 'positive' },
  { id: 'pos-20', content: { fr: "Vous êtes aimé(e) et apprécié(e) ❤️", en: "You are loved and appreciated ❤️" }, type: 'positive' },

  { id: 'pos-21', content: { fr: "Votre authenticité est rafraîchissante 🍃", en: "Your authenticity is refreshing 🍃" }, type: 'positive' },
  { id: 'pos-22', content: { fr: "Les meilleures choses arrivent à ceux qui y croient 🌠", en: "The best things happen to those who believe 🌠" }, type: 'positive' },
  { id: 'pos-23', content: { fr: "Vous avez un impact positif sur les autres 🌊", en: "You have a positive impact on others 🌊" }, type: 'positive' },
  { id: 'pos-24', content: { fr: "Votre présence est un cadeau précieux 💝", en: "Your presence is a precious gift 💝" }, type: 'positive' },
  { id: 'pos-25', content: { fr: "Vous méritez d'être heureux/heureuse 🎭", en: "You deserve to be happy 🎭" }, type: 'positive' },
  { id: 'pos-26', content: { fr: "Chaque jour est rempli de possibilités 🚪", en: "Every day is filled with possibilities 🚪" }, type: 'positive' },
  { id: 'pos-27', content: { fr: "Votre optimisme est inspirant 🌤️", en: "Your optimism is inspiring 🌤️" }, type: 'positive' },
  { id: 'pos-28', content: { fr: "Vous faites une différence dans ce monde 🌏", en: "You make a difference in this world 🌏" }, type: 'positive' },
  { id: 'pos-29', content: { fr: "La chance sourit aux audacieux 🍀", en: "Fortune favors the bold 🍀" }, type: 'positive' },
  { id: 'pos-30', content: { fr: "Vous êtes un rayon de soleil ☀️", en: "You are a ray of sunshine ☀️" }, type: 'positive' },
];

// Fonction utilitaire pour obtenir un message aléatoire
export function getRandomMessage(language: 'fr' | 'en' = 'fr'): { title: string; body: string } {
  const randomMsg = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];

  return {
    title: randomMsg.type === 'motivation' ? (language === 'fr' ? '💪 Motivation' : '💪 Motivation') : 
           randomMsg.type === 'reassurance' ? (language === 'fr' ? '🤗 Rassurant' : '🤗 Reassuring') : 
           (language === 'fr' ? '✨ Pensée positive' : '✨ Positive Thought'),
    body: randomMsg.content[language]
  };
}

// Fonction pour obtenir tous les messages d'un type
export function getMessagesByType(type: 'motivation' | 'reassurance' | 'positive'): PositiveMessage[] {
  return POSITIVE_MESSAGES.filter(msg => msg.type === type);
}

// Statistiques
export const MESSAGES_STATS = {
  total: POSITIVE_MESSAGES.length,
  motivation: POSITIVE_MESSAGES.filter(m => m.type === 'motivation').length,
  reassurance: POSITIVE_MESSAGES.filter(m => m.type === 'reassurance').length,
  positive: POSITIVE_MESSAGES.filter(m => m.type === 'positive').length,
};