// 📚 Base de 200 affirmations positives (FR/EN)
// Catégories : Motivation (80), Rassurant (60), Positif (60)
// Style : à la première personne "je", sans emojis

export interface PositiveMessage {
  id: string;
  content: { fr: string; en: string };
  type: 'motivation' | 'reassurance' | 'positive';
}

export const POSITIVE_MESSAGES: PositiveMessage[] = [

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MOTIVATION (80 messages)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'mot-1',  content: { fr: "Je suis plus fort que tout ce qui se dresse devant moi.", en: "I am stronger than anything standing in my way." }, type: 'motivation' },
  { id: 'mot-2',  content: { fr: "Je progresse chaque jour, même quand cela ne se voit pas.", en: "I make progress every day, even when it's not visible." }, type: 'motivation' },
  { id: 'mot-3',  content: { fr: "Je crois en mes rêves et je me donne les moyens de les atteindre.", en: "I believe in my dreams and I give myself the means to reach them." }, type: 'motivation' },
  { id: 'mot-4',  content: { fr: "Je choisis d'agir plutôt que d'attendre.", en: "I choose to act rather than wait." }, type: 'motivation' },
  { id: 'mot-5',  content: { fr: "Je porte en moi tout ce dont j'ai besoin pour réussir.", en: "I carry within me everything I need to succeed." }, type: 'motivation' },
  { id: 'mot-6',  content: { fr: "Je transforme les obstacles en tremplins.", en: "I turn obstacles into stepping stones." }, type: 'motivation' },
  { id: 'mot-7',  content: { fr: "Je suis sur la bonne voie, je continue d'avancer.", en: "I am on the right path, I keep moving forward." }, type: 'motivation' },
  { id: 'mot-8',  content: { fr: "Ma détermination est ma plus grande force.", en: "My determination is my greatest strength." }, type: 'motivation' },
  { id: 'mot-9',  content: { fr: "Chacun de mes efforts me rapproche de mon objectif.", en: "Every effort I make brings me closer to my goal." }, type: 'motivation' },
  { id: 'mot-10', content: { fr: "Je suis capable de grandes choses.", en: "I am capable of great things." }, type: 'motivation' },

  { id: 'mot-11', content: { fr: "Ma persévérance transforme l'impossible en possible.", en: "My perseverance turns the impossible into possible." }, type: 'motivation' },
  { id: 'mot-12', content: { fr: "Aujourd'hui est le jour parfait pour commencer.", en: "Today is the perfect day to begin." }, type: 'motivation' },
  { id: 'mot-13', content: { fr: "Mon potentiel est illimité.", en: "My potential is unlimited." }, type: 'motivation' },
  { id: 'mot-14', content: { fr: "Je transforme mes doutes en énergie pour agir.", en: "I turn my doubts into energy to act." }, type: 'motivation' },
  { id: 'mot-15', content: { fr: "Je suis l'architecte de mon propre succès.", en: "I am the architect of my own success." }, type: 'motivation' },
  { id: 'mot-16', content: { fr: "Je vois dans chaque obstacle une opportunité de grandir.", en: "I see in every obstacle an opportunity to grow." }, type: 'motivation' },
  { id: 'mot-17', content: { fr: "Mon courage inspire ceux qui m'entourent.", en: "My courage inspires those around me." }, type: 'motivation' },
  { id: 'mot-18', content: { fr: "Je fais ce que j'aime et j'aime ce que je fais.", en: "I do what I love and I love what I do." }, type: 'motivation' },
  { id: 'mot-19', content: { fr: "Je suis prêt à briller.", en: "I am ready to shine." }, type: 'motivation' },
  { id: 'mot-20', content: { fr: "Mes efforts ne sont jamais vains.", en: "My efforts are never in vain." }, type: 'motivation' },

  { id: 'mot-21', content: { fr: "J'ose sortir de ma zone de confort.", en: "I dare to step out of my comfort zone." }, type: 'motivation' },
  { id: 'mot-22', content: { fr: "Je construis chaque jour une meilleure version de moi-même.", en: "Every day I build a better version of myself." }, type: 'motivation' },
  { id: 'mot-23', content: { fr: "La constance est ma clé pour réussir.", en: "Consistency is my key to success." }, type: 'motivation' },
  { id: 'mot-24', content: { fr: "Je transforme ma peur en carburant pour avancer.", en: "I turn my fear into fuel to move forward." }, type: 'motivation' },
  { id: 'mot-25', content: { fr: "Mon histoire inspire déjà quelqu'un quelque part.", en: "My story already inspires someone somewhere." }, type: 'motivation' },
  { id: 'mot-26', content: { fr: "Je vois chaque fin comme un nouveau commencement.", en: "I see every ending as a new beginning." }, type: 'motivation' },
  { id: 'mot-27', content: { fr: "J'ai le pouvoir de transformer ma vie.", en: "I have the power to transform my life." }, type: 'motivation' },
  { id: 'mot-28', content: { fr: "Je m'engage sur le chemin de l'excellence.", en: "I commit to the path of excellence." }, type: 'motivation' },
  { id: 'mot-29', content: { fr: "Mes actions d'aujourd'hui créent mon avenir.", en: "My actions today create my future." }, type: 'motivation' },
  { id: 'mot-30', content: { fr: "Je choisis d'être la meilleure version de moi-même.", en: "I choose to be the best version of myself." }, type: 'motivation' },

  { id: 'mot-31', content: { fr: "Je suis courageux même quand j'ai peur.", en: "I am courageous even when I am afraid." }, type: 'motivation' },
  { id: 'mot-32', content: { fr: "Mon attitude façonne ma réalité.", en: "My attitude shapes my reality." }, type: 'motivation' },
  { id: 'mot-33', content: { fr: "J'investis en moi chaque jour.", en: "I invest in myself every day." }, type: 'motivation' },
  { id: 'mot-34', content: { fr: "Chaque matin je réécris mon histoire.", en: "Every morning I rewrite my story." }, type: 'motivation' },
  { id: 'mot-35', content: { fr: "Je suis exactement là où je dois être.", en: "I am exactly where I need to be." }, type: 'motivation' },
  { id: 'mot-36', content: { fr: "Ma discipline d'aujourd'hui est ma liberté de demain.", en: "My discipline today is my freedom tomorrow." }, type: 'motivation' },
  { id: 'mot-37', content: { fr: "Je fais les choses avec passion ou je ne les fais pas.", en: "I do things with passion or I don't do them at all." }, type: 'motivation' },
  { id: 'mot-38', content: { fr: "Mes rêves méritent mon engagement total.", en: "My dreams deserve my full commitment." }, type: 'motivation' },
  { id: 'mot-39', content: { fr: "Je suis patient, car les grandes choses prennent du temps.", en: "I am patient, because great things take time." }, type: 'motivation' },
  { id: 'mot-40', content: { fr: "Je suis né pour réussir, pas seulement pour survivre.", en: "I was born to thrive, not just to survive." }, type: 'motivation' },

  { id: 'mot-41', content: { fr: "Je relève chaque défi avec calme et détermination.", en: "I face every challenge with calm and determination." }, type: 'motivation' },
  { id: 'mot-42', content: { fr: "Je me lève chaque matin avec une intention claire.", en: "I wake up every morning with a clear intention." }, type: 'motivation' },
  { id: 'mot-43', content: { fr: "Je suis concentré sur ce qui compte vraiment.", en: "I am focused on what truly matters." }, type: 'motivation' },
  { id: 'mot-44', content: { fr: "Je construis mes succès un effort à la fois.", en: "I build my success one effort at a time." }, type: 'motivation' },
  { id: 'mot-45', content: { fr: "Je n'abandonne pas, même quand c'est difficile.", en: "I don't give up, even when it's hard." }, type: 'motivation' },
  { id: 'mot-46', content: { fr: "Je suis l'auteur de mon destin.", en: "I am the author of my destiny." }, type: 'motivation' },
  { id: 'mot-47', content: { fr: "Je suis discipliné et cohérent dans mes actions.", en: "I am disciplined and consistent in my actions." }, type: 'motivation' },
  { id: 'mot-48', content: { fr: "J'avance avec confiance vers mes objectifs.", en: "I move forward with confidence toward my goals." }, type: 'motivation' },
  { id: 'mot-49', content: { fr: "Je m'améliore chaque jour, même imperceptiblement.", en: "I improve every day, even imperceptibly." }, type: 'motivation' },
  { id: 'mot-50', content: { fr: "Je choisis la croissance plutôt que le confort.", en: "I choose growth over comfort." }, type: 'motivation' },

  { id: 'mot-51', content: { fr: "Je suis prêt à faire les efforts que les autres ne font pas.", en: "I am willing to make the efforts others don't." }, type: 'motivation' },
  { id: 'mot-52', content: { fr: "Je tire des leçons de chaque expérience.", en: "I learn lessons from every experience." }, type: 'motivation' },
  { id: 'mot-53', content: { fr: "Je suis motivé par ma vision de l'avenir.", en: "I am motivated by my vision of the future." }, type: 'motivation' },
  { id: 'mot-54', content: { fr: "Je mérite le succès que je construis.", en: "I deserve the success I am building." }, type: 'motivation' },
  { id: 'mot-55', content: { fr: "Je transforme chaque épreuve en expérience précieuse.", en: "I transform every trial into a valuable experience." }, type: 'motivation' },
  { id: 'mot-56', content: { fr: "Je suis pleinement engagé dans ma croissance personnelle.", en: "I am fully committed to my personal growth." }, type: 'motivation' },
  { id: 'mot-57', content: { fr: "Je sais que chaque effort porte ses fruits.", en: "I know that every effort bears fruit." }, type: 'motivation' },
  { id: 'mot-58', content: { fr: "Je prends ma vie en main avec courage.", en: "I take my life into my own hands with courage." }, type: 'motivation' },
  { id: 'mot-59', content: { fr: "Je suis reconnaissant pour chaque progrès accompli.", en: "I am grateful for every step of progress made." }, type: 'motivation' },
  { id: 'mot-60', content: { fr: "Je me fixe des objectifs ambitieux et je les atteins.", en: "I set ambitious goals and I achieve them." }, type: 'motivation' },

  { id: 'mot-61', content: { fr: "Je suis capable d'apprendre de mes erreurs.", en: "I am able to learn from my mistakes." }, type: 'motivation' },
  { id: 'mot-62', content: { fr: "Je maintiens le cap même face aux difficultés.", en: "I stay the course even in the face of difficulties." }, type: 'motivation' },
  { id: 'mot-63', content: { fr: "Je suis en train de devenir la personne que je veux être.", en: "I am becoming the person I want to be." }, type: 'motivation' },
  { id: 'mot-64', content: { fr: "Je crois en ma capacité à surmonter les épreuves.", en: "I believe in my ability to overcome hardships." }, type: 'motivation' },
  { id: 'mot-65', content: { fr: "Je suis fier de chaque pas que je fais vers mon objectif.", en: "I am proud of every step I take toward my goal." }, type: 'motivation' },
  { id: 'mot-66', content: { fr: "Je sais que le succès est au bout de l'effort.", en: "I know that success lies at the end of effort." }, type: 'motivation' },
  { id: 'mot-67', content: { fr: "Je cultive chaque jour l'habitude de la résilience.", en: "Every day I cultivate the habit of resilience." }, type: 'motivation' },
  { id: 'mot-68', content: { fr: "Je suis déterminé à créer la vie que je désire.", en: "I am determined to create the life I desire." }, type: 'motivation' },
  { id: 'mot-69', content: { fr: "Je transforme mes intentions en actions concrètes.", en: "I transform my intentions into concrete actions." }, type: 'motivation' },
  { id: 'mot-70', content: { fr: "Je suis capable de recommencer après chaque chute.", en: "I am capable of starting again after every fall." }, type: 'motivation' },

  { id: 'mot-71', content: { fr: "Je choisis de voir le potentiel dans chaque situation.", en: "I choose to see the potential in every situation." }, type: 'motivation' },
  { id: 'mot-72', content: { fr: "Je m'engage à aller au-delà de mes limites habituelles.", en: "I commit to going beyond my usual limits." }, type: 'motivation' },
  { id: 'mot-73', content: { fr: "Je crée de nouvelles habitudes qui me soutiennent.", en: "I create new habits that support me." }, type: 'motivation' },
  { id: 'mot-74', content: { fr: "Je suis aligné avec mes valeurs et mes aspirations.", en: "I am aligned with my values and my aspirations." }, type: 'motivation' },
  { id: 'mot-75', content: { fr: "Je trouve de la force là où je pensais n'en avoir aucune.", en: "I find strength where I thought I had none." }, type: 'motivation' },
  { id: 'mot-76', content: { fr: "Je suis le changement que je veux voir dans ma vie.", en: "I am the change I want to see in my life." }, type: 'motivation' },
  { id: 'mot-77', content: { fr: "Je suis porté par une vision qui me dépasse.", en: "I am carried by a vision greater than myself." }, type: 'motivation' },
  { id: 'mot-78', content: { fr: "Je grandis à travers chaque difficulté que j'affronte.", en: "I grow through every difficulty I face." }, type: 'motivation' },
  { id: 'mot-79', content: { fr: "Je m'engage chaque jour à donner le meilleur de moi-même.", en: "I commit every day to giving the best of myself." }, type: 'motivation' },
  { id: 'mot-80', content: { fr: "Je suis la preuve vivante que la persévérance paie.", en: "I am living proof that perseverance pays off." }, type: 'motivation' },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RASSURANT (60 messages)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'ras-1',  content: { fr: "Je respire profondément et je laisse partir l'inquiétude.", en: "I breathe deeply and let go of worry." }, type: 'reassurance' },
  { id: 'ras-2',  content: { fr: "Je ne suis pas seul, je suis entouré de personnes qui m'aiment.", en: "I am not alone, I am surrounded by people who love me." }, type: 'reassurance' },
  { id: 'ras-3',  content: { fr: "Je m'autorise à ressentir ce que je ressens sans jugement.", en: "I allow myself to feel what I feel without judgment." }, type: 'reassurance' },
  { id: 'ras-4',  content: { fr: "Je mérite de me reposer et de prendre soin de moi.", en: "I deserve to rest and take care of myself." }, type: 'reassurance' },
  { id: 'ras-5',  content: { fr: "Je sais que demain sera différent d'aujourd'hui.", en: "I know that tomorrow will be different from today." }, type: 'reassurance' },
  { id: 'ras-6',  content: { fr: "Je fais de mon mieux et c'est suffisant.", en: "I do my best and that is enough." }, type: 'reassurance' },
  { id: 'ras-7',  content: { fr: "Je m'accorde la permission de ralentir.", en: "I give myself permission to slow down." }, type: 'reassurance' },
  { id: 'ras-8',  content: { fr: "Je suis doux avec moi-même dans les moments difficiles.", en: "I am gentle with myself in difficult moments." }, type: 'reassurance' },
  { id: 'ras-9',  content: { fr: "Mes émotions sont valides et je les accueille avec bienveillance.", en: "My emotions are valid and I welcome them with kindness." }, type: 'reassurance' },
  { id: 'ras-10', content: { fr: "Je reconnais quand j'ai besoin d'aide et je l'accepte.", en: "I recognize when I need help and I accept it." }, type: 'reassurance' },

  { id: 'ras-11', content: { fr: "Je prends soin de moi sans culpabilité.", en: "I take care of myself without guilt." }, type: 'reassurance' },
  { id: 'ras-12', content: { fr: "Je sais que les périodes difficiles finissent toujours.", en: "I know that difficult periods always come to an end." }, type: 'reassurance' },
  { id: 'ras-13', content: { fr: "Mon bien-être est une priorité que je respecte.", en: "My well-being is a priority I honor." }, type: 'reassurance' },
  { id: 'ras-14', content: { fr: "Je reconnais mes limites et j'en prends soin.", en: "I recognize my limits and I honor them." }, type: 'reassurance' },
  { id: 'ras-15', content: { fr: "Je mérite la compassion, à commencer par la mienne.", en: "I deserve compassion, starting with my own." }, type: 'reassurance' },
  { id: 'ras-16', content: { fr: "Je prends le temps qu'il me faut sans me presser.", en: "I take all the time I need without rushing." }, type: 'reassurance' },
  { id: 'ras-17', content: { fr: "Je prends soin de ma santé mentale autant que de ma santé physique.", en: "I take care of my mental health as much as my physical health." }, type: 'reassurance' },
  { id: 'ras-18', content: { fr: "Je n'ai pas à tout contrôler pour que les choses aillent bien.", en: "I don't have to control everything for things to go well." }, type: 'reassurance' },
  { id: 'ras-19', content: { fr: "Je m'accepte tel que je suis, humain et imparfait.", en: "I accept myself as I am, human and imperfect." }, type: 'reassurance' },
  { id: 'ras-20', content: { fr: "Ma guérison avance à son propre rythme et c'est bien ainsi.", en: "My healing moves at its own pace and that is okay." }, type: 'reassurance' },

  { id: 'ras-21', content: { fr: "Mes efforts comptent, même quand ils sont invisibles.", en: "My efforts count, even when they are invisible." }, type: 'reassurance' },
  { id: 'ras-22', content: { fr: "J'ai traversé tous mes mauvais jours jusqu'à présent.", en: "I have gotten through every bad day until now." }, type: 'reassurance' },
  { id: 'ras-23', content: { fr: "Le repos fait partie de mon progrès.", en: "Rest is part of my progress." }, type: 'reassurance' },
  { id: 'ras-24', content: { fr: "Je n'ai pas à être parfait pour avoir de la valeur.", en: "I don't have to be perfect to have worth." }, type: 'reassurance' },
  { id: 'ras-25', content: { fr: "J'avance à mon rythme, et ce rythme me convient.", en: "I move at my own pace, and that pace suits me." }, type: 'reassurance' },
  { id: 'ras-26', content: { fr: "Je reconnais ma fatigue et je me donne la permission de me reposer.", en: "I acknowledge my tiredness and give myself permission to rest." }, type: 'reassurance' },
  { id: 'ras-27', content: { fr: "Je suis fier de faire de mon mieux dans les circonstances actuelles.", en: "I am proud of doing my best in current circumstances." }, type: 'reassurance' },
  { id: 'ras-28', content: { fr: "Mon parcours est unique et je n'ai pas à le comparer à celui des autres.", en: "My journey is unique and I don't have to compare it to others." }, type: 'reassurance' },
  { id: 'ras-29', content: { fr: "Accepter mes limites est aussi une forme de sagesse.", en: "Accepting my limits is also a form of wisdom." }, type: 'reassurance' },
  { id: 'ras-30', content: { fr: "Je suis assez bien tel que je suis en ce moment.", en: "I am good enough exactly as I am right now." }, type: 'reassurance' },

  { id: 'ras-31', content: { fr: "Je lâche prise sur ce que je ne peux pas contrôler.", en: "I let go of what I cannot control." }, type: 'reassurance' },
  { id: 'ras-32', content: { fr: "Je me pardonne pour mes erreurs passées.", en: "I forgive myself for my past mistakes." }, type: 'reassurance' },
  { id: 'ras-33', content: { fr: "Je suis en sécurité dans ce moment présent.", en: "I am safe in this present moment." }, type: 'reassurance' },
  { id: 'ras-34', content: { fr: "Je choisis la paix intérieure plutôt que l'agitation.", en: "I choose inner peace over agitation." }, type: 'reassurance' },
  { id: 'ras-35', content: { fr: "Je suis capable de traverser cette période difficile.", en: "I am capable of getting through this difficult time." }, type: 'reassurance' },
  { id: 'ras-36', content: { fr: "Je me traite avec la même gentillesse que j'aurais pour un ami.", en: "I treat myself with the same kindness I would have for a friend." }, type: 'reassurance' },
  { id: 'ras-37', content: { fr: "Je sais que mes doutes ne définissent pas ma valeur.", en: "I know my doubts do not define my worth." }, type: 'reassurance' },
  { id: 'ras-38', content: { fr: "Je m'autorise à être vulnérable sans honte.", en: "I allow myself to be vulnerable without shame." }, type: 'reassurance' },
  { id: 'ras-39', content: { fr: "Je suis résilient et je retrouve toujours mon équilibre.", en: "I am resilient and I always find my balance again." }, type: 'reassurance' },
  { id: 'ras-40', content: { fr: "Je sais que demander de l'aide est un acte de bravoure.", en: "I know that asking for help is an act of bravery." }, type: 'reassurance' },

  { id: 'ras-41', content: { fr: "Je m'accorde de la bienveillance dans les jours difficiles.", en: "I give myself kindness on difficult days." }, type: 'reassurance' },
  { id: 'ras-42', content: { fr: "Je suis digne d'être aimé exactement tel que je suis.", en: "I am worthy of being loved exactly as I am." }, type: 'reassurance' },
  { id: 'ras-43', content: { fr: "Je n'ai pas besoin d'avoir tout compris pour avancer.", en: "I don't need to have it all figured out to move forward." }, type: 'reassurance' },
  { id: 'ras-44', content: { fr: "Je me rappelle que les nuages finissent toujours par passer.", en: "I remind myself that clouds always end up passing." }, type: 'reassurance' },
  { id: 'ras-45', content: { fr: "Je suis en train de guérir, même si je ne m'en rends pas compte.", en: "I am healing, even if I am not aware of it." }, type: 'reassurance' },
  { id: 'ras-46', content: { fr: "Je laisse partir les pensées qui ne me servent pas.", en: "I let go of thoughts that don't serve me." }, type: 'reassurance' },
  { id: 'ras-47', content: { fr: "Je suis capable de trouver la paix même dans le chaos.", en: "I am capable of finding peace even in chaos." }, type: 'reassurance' },
  { id: 'ras-48', content: { fr: "Je reconnais que chaque jour n'a pas à être parfait.", en: "I recognize that not every day has to be perfect." }, type: 'reassurance' },
  { id: 'ras-49', content: { fr: "Je me rappelle que l'imperfection fait partie de l'humanité.", en: "I remind myself that imperfection is part of humanity." }, type: 'reassurance' },
  { id: 'ras-50', content: { fr: "Je fais confiance au processus de ma vie.", en: "I trust the process of my life." }, type: 'reassurance' },

  { id: 'ras-51', content: { fr: "Je suis ancré dans le moment présent.", en: "I am grounded in the present moment." }, type: 'reassurance' },
  { id: 'ras-52', content: { fr: "Je sais que cette épreuve ne durera pas éternellement.", en: "I know this hardship will not last forever." }, type: 'reassurance' },
  { id: 'ras-53', content: { fr: "Je mérite de vivre sans me juger constamment.", en: "I deserve to live without constantly judging myself." }, type: 'reassurance' },
  { id: 'ras-54', content: { fr: "Je suis suffisamment fort pour traverser ce que je vis.", en: "I am strong enough to get through what I am experiencing." }, type: 'reassurance' },
  { id: 'ras-55', content: { fr: "Je m'accorde le droit de ne pas aller bien parfois.", en: "I give myself the right not to be okay sometimes." }, type: 'reassurance' },
  { id: 'ras-56', content: { fr: "Je suis entouré d'amour même quand je ne le ressens pas.", en: "I am surrounded by love even when I don't feel it." }, type: 'reassurance' },
  { id: 'ras-57', content: { fr: "Je reviens toujours à moi-même, quoi qu'il arrive.", en: "I always come back to myself, whatever happens." }, type: 'reassurance' },
  { id: 'ras-58', content: { fr: "Je suis plus solide que je ne le crois.", en: "I am more solid than I believe." }, type: 'reassurance' },
  { id: 'ras-59', content: { fr: "Je m'autorise à avancer à mon propre rythme.", en: "I allow myself to move at my own pace." }, type: 'reassurance' },
  { id: 'ras-60', content: { fr: "Je suis en paix avec là où j'en suis aujourd'hui.", en: "I am at peace with where I am today." }, type: 'reassurance' },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POSITIF (60 messages)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id: 'pos-1',  content: { fr: "Je suis reconnaissant pour cette nouvelle journée.", en: "I am grateful for this new day." }, type: 'positive' },
  { id: 'pos-2',  content: { fr: "Je rayonne de joie et de bienveillance.", en: "I radiate joy and kindness." }, type: 'positive' },
  { id: 'pos-3',  content: { fr: "Je mérite toutes les belles choses que la vie m'offre.", en: "I deserve all the beautiful things life offers me." }, type: 'positive' },
  { id: 'pos-4',  content: { fr: "Ma présence a de la valeur et illumine ceux qui m'entourent.", en: "My presence has value and lights up those around me." }, type: 'positive' },
  { id: 'pos-5',  content: { fr: "Je célèbre mes petites victoires avec fierté.", en: "I celebrate my small wins with pride." }, type: 'positive' },
  { id: 'pos-6',  content: { fr: "Je partage ma joie et elle se multiplie.", en: "I share my joy and it multiplies." }, type: 'positive' },
  { id: 'pos-7',  content: { fr: "Je suis une personne précieuse et unique.", en: "I am a precious and unique person." }, type: 'positive' },
  { id: 'pos-8',  content: { fr: "Le bonheur est un état que je cultive au quotidien.", en: "Happiness is a state I cultivate every day." }, type: 'positive' },
  { id: 'pos-9',  content: { fr: "Mon énergie positive influe sur ceux qui m'entourent.", en: "My positive energy influences those around me." }, type: 'positive' },
  { id: 'pos-10', content: { fr: "Je vis chaque instant avec gratitude et émerveillement.", en: "I live every moment with gratitude and wonder." }, type: 'positive' },

  { id: 'pos-11', content: { fr: "Je rayonne d'une beauté intérieure authentique.", en: "I radiate authentic inner beauty." }, type: 'positive' },
  { id: 'pos-12', content: { fr: "Je suis ouvert aux belles surprises que la vie me réserve.", en: "I am open to the beautiful surprises life has for me." }, type: 'positive' },
  { id: 'pos-13', content: { fr: "Mon sourire a le pouvoir de changer une journée.", en: "My smile has the power to change a day." }, type: 'positive' },
  { id: 'pos-14', content: { fr: "J'inspire les autres par ma façon d'être.", en: "I inspire others by the way I am." }, type: 'positive' },
  { id: 'pos-15', content: { fr: "Je contribue à rendre ce monde meilleur.", en: "I contribute to making this world better." }, type: 'positive' },
  { id: 'pos-16', content: { fr: "Ma gentillesse fait une vraie différence dans la vie des autres.", en: "My kindness makes a real difference in the lives of others." }, type: 'positive' },
  { id: 'pos-17', content: { fr: "Je savoure les moments simples et précieux de la vie.", en: "I savor the simple and precious moments of life." }, type: 'positive' },
  { id: 'pos-18', content: { fr: "Je crée de la magie à travers mes actions et mes mots.", en: "I create magic through my actions and my words." }, type: 'positive' },
  { id: 'pos-19', content: { fr: "La gratitude transforme ma façon de voir le monde.", en: "Gratitude transforms the way I see the world." }, type: 'positive' },
  { id: 'pos-20', content: { fr: "Je suis aimé et j'aime en retour.", en: "I am loved and I love in return." }, type: 'positive' },

  { id: 'pos-21', content: { fr: "Mon authenticité est ma plus grande force.", en: "My authenticity is my greatest strength." }, type: 'positive' },
  { id: 'pos-22', content: { fr: "Je crois que les meilleures choses sont encore à venir.", en: "I believe the best things are yet to come." }, type: 'positive' },
  { id: 'pos-23', content: { fr: "J'ai un impact positif sur tout ce que je touche.", en: "I have a positive impact on everything I touch." }, type: 'positive' },
  { id: 'pos-24', content: { fr: "Ma présence dans ce monde a un sens profond.", en: "My presence in this world has deep meaning." }, type: 'positive' },
  { id: 'pos-25', content: { fr: "Je mérite une vie épanouissante et joyeuse.", en: "I deserve a fulfilling and joyful life." }, type: 'positive' },
  { id: 'pos-26', content: { fr: "Chaque journée est remplie de possibilités infinies.", en: "Every day is filled with infinite possibilities." }, type: 'positive' },
  { id: 'pos-27', content: { fr: "Mon optimisme est une force que je cultive chaque jour.", en: "My optimism is a strength I cultivate every day." }, type: 'positive' },
  { id: 'pos-28', content: { fr: "Je laisse une empreinte positive dans la vie des autres.", en: "I leave a positive mark on the lives of others." }, type: 'positive' },
  { id: 'pos-29', content: { fr: "Je suis audacieux et je saisis les opportunités qui se présentent.", en: "I am bold and I seize the opportunities that arise." }, type: 'positive' },
  { id: 'pos-30', content: { fr: "Je suis une lumière dans la vie de ceux qui m'entourent.", en: "I am a light in the lives of those around me." }, type: 'positive' },

  { id: 'pos-31', content: { fr: "Je choisis chaque jour d'être heureux.", en: "I choose every day to be happy." }, type: 'positive' },
  { id: 'pos-32', content: { fr: "Je vis en harmonie avec mes valeurs les plus profondes.", en: "I live in harmony with my deepest values." }, type: 'positive' },
  { id: 'pos-33', content: { fr: "Je suis fier de la personne que je suis devenu.", en: "I am proud of the person I have become." }, type: 'positive' },
  { id: 'pos-34', content: { fr: "J'attire la positivité par mon attitude bienveillante.", en: "I attract positivity through my kind attitude." }, type: 'positive' },
  { id: 'pos-35', content: { fr: "Je suis en paix avec mon passé et enthousiaste pour mon avenir.", en: "I am at peace with my past and enthusiastic about my future." }, type: 'positive' },
  { id: 'pos-36', content: { fr: "Je mérite l'amour que je donne aux autres.", en: "I deserve the love I give to others." }, type: 'positive' },
  { id: 'pos-37', content: { fr: "Je vois la beauté dans les petites choses du quotidien.", en: "I see beauty in the small things of daily life." }, type: 'positive' },
  { id: 'pos-38', content: { fr: "Je suis en bonne santé, en paix et pleinement vivant.", en: "I am healthy, at peace and fully alive." }, type: 'positive' },
  { id: 'pos-39', content: { fr: "J'accueille chaque nouvelle opportunité avec enthousiasme.", en: "I welcome every new opportunity with enthusiasm." }, type: 'positive' },
  { id: 'pos-40', content: { fr: "Je suis reconnaissant pour tout ce que j'ai accompli.", en: "I am grateful for everything I have accomplished." }, type: 'positive' },

  { id: 'pos-41', content: { fr: "Je m'épanouis dans ma vie personnelle et professionnelle.", en: "I thrive in my personal and professional life." }, type: 'positive' },
  { id: 'pos-42', content: { fr: "Je trouve de la joie dans les moments les plus simples.", en: "I find joy in the simplest moments." }, type: 'positive' },
  { id: 'pos-43', content: { fr: "Je suis entouré de personnes qui me soutiennent et m'inspirent.", en: "I am surrounded by people who support and inspire me." }, type: 'positive' },
  { id: 'pos-44', content: { fr: "Je suis en harmonie avec qui je suis profondément.", en: "I am in harmony with who I am at my core." }, type: 'positive' },
  { id: 'pos-45', content: { fr: "Je rayonne de confiance et d'assurance naturelle.", en: "I radiate confidence and natural assurance." }, type: 'positive' },
  { id: 'pos-46', content: { fr: "Je suis reconnaissant pour chaque personne présente dans ma vie.", en: "I am grateful for every person present in my life." }, type: 'positive' },
  { id: 'pos-47', content: { fr: "Je crée chaque jour la vie dont je rêve.", en: "Every day I create the life I dream of." }, type: 'positive' },
  { id: 'pos-48', content: { fr: "Je suis en paix avec toutes les dimensions de ma vie.", en: "I am at peace with all the dimensions of my life." }, type: 'positive' },
  { id: 'pos-49', content: { fr: "Je suis ouvert à recevoir tout ce que la vie a de meilleur.", en: "I am open to receiving all the best that life has." }, type: 'positive' },
  { id: 'pos-50', content: { fr: "Je suis aligné avec mes rêves les plus profonds.", en: "I am aligned with my deepest dreams." }, type: 'positive' },

  { id: 'pos-51', content: { fr: "Je vis pleinement chaque instant qui m'est offert.", en: "I fully live every moment offered to me." }, type: 'positive' },
  { id: 'pos-52', content: { fr: "Je suis enthousiaste à l'idée de ce que demain m'apportera.", en: "I am enthusiastic about what tomorrow will bring me." }, type: 'positive' },
  { id: 'pos-53', content: { fr: "Ma vie est remplie de sens et de beauté.", en: "My life is filled with meaning and beauty." }, type: 'positive' },
  { id: 'pos-54', content: { fr: "Je suis fier de l'amour que je donne au monde.", en: "I am proud of the love I give to the world." }, type: 'positive' },
  { id: 'pos-55', content: { fr: "Je suis en train de vivre la plus belle version de ma vie.", en: "I am living the most beautiful version of my life." }, type: 'positive' },
  { id: 'pos-56', content: { fr: "Je choisis la gratitude comme mode de vie.", en: "I choose gratitude as a way of life." }, type: 'positive' },
  { id: 'pos-57', content: { fr: "Je mérite tout le bien qui vient à moi.", en: "I deserve all the good that comes to me." }, type: 'positive' },
  { id: 'pos-58', content: { fr: "Je suis une personne généreuse et bienveillante.", en: "I am a generous and kind person." }, type: 'positive' },
  { id: 'pos-59', content: { fr: "Je vis avec légèreté et ouverture d'esprit.", en: "I live with lightness and open-mindedness." }, type: 'positive' },
  { id: 'pos-60', content: { fr: "Je suis en paix, heureux et reconnaissant pour ma vie.", en: "I am at peace, happy and grateful for my life." }, type: 'positive' },
];

// Fonction utilitaire pour obtenir un message aléatoire
export function getRandomMessage(language: 'fr' | 'en' = 'fr'): { title: string; body: string } {
  const randomMsg = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
  return {
    title:
      randomMsg.type === 'motivation'  ? (language === 'fr' ? 'Motivation'      : 'Motivation'   ) :
      randomMsg.type === 'reassurance' ? (language === 'fr' ? 'Bienveillance'   : 'Reassurance'  ) :
                                         (language === 'fr' ? 'Pensée positive' : 'Positive Mind'),
    body: randomMsg.content[language],
  };
}

// Fonction pour obtenir tous les messages d'un type
export function getMessagesByType(type: 'motivation' | 'reassurance' | 'positive'): PositiveMessage[] {
  return POSITIVE_MESSAGES.filter(msg => msg.type === type);
}

// Statistiques
export const MESSAGES_STATS = {
  total:       POSITIVE_MESSAGES.length,
  motivation:  POSITIVE_MESSAGES.filter(m => m.type === 'motivation').length,
  reassurance: POSITIVE_MESSAGES.filter(m => m.type === 'reassurance').length,
  positive:    POSITIVE_MESSAGES.filter(m => m.type === 'positive').length,
};