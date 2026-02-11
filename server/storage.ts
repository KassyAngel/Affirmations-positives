import { db } from "./db";
import { quotes, type InsertQuote, type Quote } from "@shared/schema";
import { eq, sql, like, or } from "drizzle-orm";

export interface IStorage {
  getQuotes(category?: string, search?: string, limit?: number): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  getRandomQuote(category?: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuoteCountsByCategory(): Promise<Record<string, number>>;
  seedQuotes(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getQuotes(category?: string, search?: string, limit?: number): Promise<Quote[]> {
    let query = db.select().from(quotes);

    if (category) {
      query = query.where(eq(quotes.category, category)) as any;
    }

    if (search) {
      query = query.where(
        or(
          like(quotes.content, `%${search}%`),
          like(quotes.contentEn, `%${search}%`),
          like(quotes.author, `%${search}%`)
        )
      ) as any;
    }

    if (limit) {
      query = query.limit(limit) as any;
    }

    return await query;
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async getRandomQuote(category?: string): Promise<Quote | undefined> {
    let query = db.select().from(quotes);

    if (category) {
      query = query.where(eq(quotes.category, category)) as any;
    }

    const [quote] = await query.orderBy(sql`RANDOM()`).limit(1);
    return quote;
  }

  async getQuoteCountsByCategory(): Promise<Record<string, number>> {
    const results = await db.select({
      category: quotes.category,
      count: sql<number>`count(*)`
    }).from(quotes).groupBy(quotes.category);
    
    const counts: Record<string, number> = {};
    results.forEach(row => {
      counts[row.category] = Number(row.count);
    });
    return counts;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db.insert(quotes).values(insertQuote).returning();
    return quote;
  }

  async getQuoteCountsByCategory(): Promise<Record<string, number>> {
    const counts = await db
      .select({
        category: quotes.category,
        count: sql<number>`count(*)::int`,
      })
      .from(quotes)
      .groupBy(quotes.category);

    return counts.reduce((acc, { category, count }) => {
      acc[category] = count;
      return acc;
    }, {} as Record<string, number>);
  }

  async seedQuotes(): Promise<void> {
    const count = await db.select({ count: sql<number>`count(*)` }).from(quotes);
    if (Number(count[0].count) > 0) return;

    const seedData: InsertQuote[] = [
      // ============ TRAVAIL / WORK (25 citations) ============
      { 
        content: "Le seul endroit où le succès vient avant le travail, c'est dans le dictionnaire.", 
        contentEn: "The only place where success comes before work is in the dictionary.",
        author: "Vidal Sassoon", 
        category: "work" 
      },
      { 
        content: "Votre temps est limité, ne le gâchez pas en menant une existence qui n'est pas la vôtre.", 
        contentEn: "Your time is limited, don't waste it living someone else's life.",
        author: "Steve Jobs", 
        category: "work" 
      },
      { 
        content: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.", 
        contentEn: "Success is going from failure to failure without losing your enthusiasm.",
        author: "Winston Churchill", 
        category: "work" 
      },
      { 
        content: "Choisissez un travail que vous aimez et vous n'aurez pas à travailler un seul jour de votre vie.", 
        contentEn: "Choose a job you love and you will never have to work a day in your life.",
        author: "Confucius", 
        category: "work" 
      },
      { 
        content: "L'action est la clé fondamentale de tout succès.", 
        contentEn: "Action is the foundational key to all success.",
        author: "Pablo Picasso", 
        category: "work" 
      },
      { 
        content: "Le travail éloigne de nous trois grands maux : l'ennui, le vice et le besoin.", 
        contentEn: "Work keeps us from three great evils: boredom, vice, and need.",
        author: "Voltaire", 
        category: "work" 
      },
      { 
        content: "La façon de commencer est d'arrêter de parler et de commencer à faire.", 
        contentEn: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney", 
        category: "work" 
      },
      { 
        content: "N'attendez pas le moment parfait, prenez le moment et rendez-le parfait.", 
        contentEn: "Don't wait for the perfect moment, take the moment and make it perfect.",
        author: "Inconnu", 
        category: "work" 
      },
      { 
        content: "Le génie, c'est 1% d'inspiration et 99% de transpiration.", 
        contentEn: "Genius is 1% inspiration and 99% perspiration.",
        author: "Thomas Edison", 
        category: "work" 
      },
      { 
        content: "Si vous pensez que vous pouvez ou si vous pensez que vous ne pouvez pas, vous avez raison.", 
        contentEn: "Whether you think you can or you think you can't, you're right.",
        author: "Henry Ford", 
        category: "work" 
      },
      { 
        content: "La seule limite à notre épanouissement de demain sera nos doutes d'aujourd'hui.", 
        contentEn: "The only limit to our realization of tomorrow will be our doubts of today.",
        author: "Franklin D. Roosevelt", 
        category: "work" 
      },
      { 
        content: "Tout ce que vous avez toujours voulu est de l'autre côté de la peur.", 
        contentEn: "Everything you've ever wanted is on the other side of fear.",
        author: "George Addair", 
        category: "work" 
      },
      { 
        content: "Ne rêvez pas votre vie, vivez vos rêves.", 
        contentEn: "Don't dream your life, live your dreams.",
        author: "Mark Twain", 
        category: "work" 
      },
      { 
        content: "L'excellence n'est pas une destination, c'est un voyage continu.", 
        contentEn: "Excellence is not a destination, it is a continuous journey.",
        author: "Brian Tracy", 
        category: "work" 
      },
      { 
        content: "Le secret pour avancer est de commencer.", 
        contentEn: "The secret of getting ahead is getting started.",
        author: "Mark Twain", 
        category: "work" 
      },
      { 
        content: "Les opportunités ne se présentent pas. C'est vous qui les créez.", 
        contentEn: "Opportunities don't happen. You create them.",
        author: "Chris Grosser", 
        category: "work" 
      },
      { 
        content: "Le plus grand risque est de ne prendre aucun risque.", 
        contentEn: "The biggest risk is not taking any risk.",
        author: "Mark Zuckerberg", 
        category: "work" 
      },
      { 
        content: "Travaillez dur en silence, laissez le succès faire du bruit.", 
        contentEn: "Work hard in silence, let success make the noise.",
        author: "Frank Ocean", 
        category: "work" 
      },
      { 
        content: "Les choses qui en valent le plus la peine dans la vie ne sont jamais faciles.", 
        contentEn: "The best things in life are never easy.",
        author: "Inconnu", 
        category: "work" 
      },
      { 
        content: "Votre carrière est un marathon, pas un sprint.", 
        contentEn: "Your career is a marathon, not a sprint.",
        author: "Inconnu", 
        category: "work" 
      },
      { 
        content: "Faites aujourd'hui quelque chose que votre futur vous remerciera d'avoir fait.", 
        contentEn: "Do something today that your future self will thank you for.",
        author: "Sean Patrick Flanery", 
        category: "work" 
      },
      { 
        content: "La discipline est le pont entre les objectifs et l'accomplissement.", 
        contentEn: "Discipline is the bridge between goals and accomplishment.",
        author: "Jim Rohn", 
        category: "work" 
      },
      { 
        content: "Soyez si bon qu'ils ne peuvent pas vous ignorer.", 
        contentEn: "Be so good they can't ignore you.",
        author: "Steve Martin", 
        category: "work" 
      },
      { 
        content: "Le succès est la somme de petits efforts répétés jour après jour.", 
        contentEn: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier", 
        category: "work" 
      },
      { 
        content: "Ne comptez pas les jours, faites que les jours comptent.", 
        contentEn: "Don't count the days, make the days count.",
        author: "Muhammad Ali", 
        category: "work" 
      },

      // ============ AMOUR / LOVE (20 citations) ============
      { 
        content: "Aimer, ce n'est pas se regarder l'un l'autre, c'est regarder ensemble dans la même direction.", 
        contentEn: "To love is not to look at one another, but to look together in the same direction.",
        author: "Antoine de Saint-Exupéry", 
        category: "love" 
      },
      { 
        content: "La vie est un sommeil, l'amour en est le rêve.", 
        contentEn: "Life is a sleep, love is its dream.",
        author: "Alfred de Musset", 
        category: "love" 
      },
      { 
        content: "Le plus grand bonheur après celui d'aimer, c'est de confesser son amour.", 
        contentEn: "The greatest happiness after loving is to confess one's love.",
        author: "André Gide", 
        category: "love" 
      },
      { 
        content: "Il n'y a qu'un bonheur dans la vie, c'est d'aimer et d'être aimé.", 
        contentEn: "There is only one happiness in life: to love and be loved.",
        author: "George Sand", 
        category: "love" 
      },
      { 
        content: "L'amour ne se voit pas avec les yeux mais avec l'âme.", 
        contentEn: "Love is not seen with the eyes but with the soul.",
        author: "William Shakespeare", 
        category: "love" 
      },
      { 
        content: "Aimer, c'est trouver sa richesse hors de soi.", 
        contentEn: "To love is to find your richness outside yourself.",
        author: "Alain", 
        category: "love" 
      },
      { 
        content: "On n'aime que ce qu'on ne possède pas tout entier.", 
        contentEn: "We only love what we do not wholly possess.",
        author: "Marcel Proust", 
        category: "love" 
      },
      { 
        content: "L'amour est l'emblème de l'éternité, il confond toute la notion de temps.", 
        contentEn: "Love is the emblem of eternity; it confounds all notion of time.",
        author: "Madame de Staël", 
        category: "love" 
      },
      { 
        content: "Le véritable amour commence là où tu n'attends rien en retour.", 
        contentEn: "True love begins when nothing is expected in return.",
        author: "Antoine de Saint-Exupéry", 
        category: "love" 
      },
      { 
        content: "Être aimé profondément par quelqu'un vous donne de la force, aimer quelqu'un profondément vous donne du courage.", 
        contentEn: "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",
        author: "Lao Tseu", 
        category: "love" 
      },
      { 
        content: "L'amour est la seule chose qui grandit quand on le partage.", 
        contentEn: "Love is the only thing that grows when shared.",
        author: "Inconnu", 
        category: "love" 
      },
      { 
        content: "Aimer quelqu'un, c'est le voir tel que Dieu l'a voulu.", 
        contentEn: "To love someone is to see them as God intended.",
        author: "Dostoïevski", 
        category: "love" 
      },
      { 
        content: "Là où il y a de l'amour, il y a de la vie.", 
        contentEn: "Where there is love, there is life.",
        author: "Gandhi", 
        category: "love" 
      },
      { 
        content: "L'amour est composé d'une seule âme habitant deux corps.", 
        contentEn: "Love is composed of a single soul inhabiting two bodies.",
        author: "Aristote", 
        category: "love" 
      },
      { 
        content: "Le meilleur et le plus beau dans la vie ne peut être vu ou touché, il doit être ressenti avec le cœur.", 
        contentEn: "The best and most beautiful things in life cannot be seen or touched, they must be felt with the heart.",
        author: "Helen Keller", 
        category: "love" 
      },
      { 
        content: "Aimer, c'est tout donner et tout sacrifier sans espoir de retour.", 
        contentEn: "To love is to give everything and sacrifice all without hope of return.",
        author: "Sainte Thérèse de Lisieux", 
        category: "love" 
      },
      { 
        content: "L'amour n'a pas besoin d'être parfait, il a besoin d'être vrai.", 
        contentEn: "Love doesn't need to be perfect, it needs to be true.",
        author: "Inconnu", 
        category: "love" 
      },
      { 
        content: "Un seul être vous manque et tout est dépeuplé.", 
        contentEn: "One being is missing and the whole world feels empty.",
        author: "Alphonse de Lamartine", 
        category: "love" 
      },
      { 
        content: "L'amour est la poésie des sens.", 
        contentEn: "Love is the poetry of the senses.",
        author: "Honoré de Balzac", 
        category: "love" 
      },
      { 
        content: "Qui aime une seule personne de toute son âme aime ainsi tous les hommes, toutes les choses, tout Dieu.", 
        contentEn: "Whoever loves one person with all their soul thus loves all people, all things, all of God.",
        author: "François Mauriac", 
        category: "love" 
      },

      // ============ SPORT / EXERCICE (18 citations) ============
      { 
        content: "La douleur est temporaire. L'abandon est définitif.", 
        contentEn: "Pain is temporary. Quitting lasts forever.",
        author: "Lance Armstrong", 
        category: "sport" 
      },
      { 
        content: "Ne limite pas tes défis, défie tes limites.", 
        contentEn: "Don't limit your challenges, challenge your limits.",
        author: "Inconnu", 
        category: "sport" 
      },
      { 
        content: "Le corps accomplit ce que l'esprit croit.", 
        contentEn: "The body achieves what the mind believes.",
        author: "Inconnu", 
        category: "sport" 
      },
      { 
        content: "Il n'y a pas de raccourci vers un endroit qui en vaut la peine.", 
        contentEn: "There are no shortcuts to any place worth going.",
        author: "Beverly Sills", 
        category: "sport" 
      },
      { 
        content: "Prenez soin de votre corps. C'est le seul endroit où vous devez vivre.", 
        contentEn: "Take care of your body. It's the only place you have to live.",
        author: "Jim Rohn", 
        category: "sport" 
      },
      { 
        content: "Plus vous transpirez à l'entraînement, moins vous saignerez au combat.", 
        contentEn: "The more you sweat in training, the less you bleed in battle.",
        author: "Proverbe militaire", 
        category: "sport" 
      },
      { 
        content: "Un champion est quelqu'un qui se relève quand il ne le peut pas.", 
        contentEn: "A champion is someone who gets up when they can't.",
        author: "Jack Dempsey", 
        category: "sport" 
      },
      { 
        content: "La différence entre l'impossible et le possible réside dans la détermination d'une personne.", 
        contentEn: "The difference between the impossible and the possible lies in a person's determination.",
        author: "Tommy Lasorda", 
        category: "sport" 
      },
      { 
        content: "Votre seule limite, c'est vous.", 
        contentEn: "Your only limit is you.",
        author: "Inconnu", 
        category: "sport" 
      },
      { 
        content: "Un an à partir de maintenant, vous souhaiterez avoir commencé aujourd'hui.", 
        contentEn: "A year from now you will wish you had started today.",
        author: "Karen Lamb", 
        category: "sport" 
      },
      { 
        content: "Les champions continuent à jouer jusqu'à ce qu'ils fassent les choses correctement.", 
        contentEn: "Champions keep playing until they get it right.",
        author: "Billie Jean King", 
        category: "sport" 
      },
      { 
        content: "Le sport va chercher la peur pour la dominer.", 
        contentEn: "Sport seeks out fear to dominate it.",
        author: "Georges Hébert", 
        category: "sport" 
      },
      { 
        content: "Ton corps peut supporter presque tout. C'est ton esprit qu'il faut convaincre.", 
        contentEn: "Your body can stand almost anything. It's your mind you have to convince.",
        author: "Inconnu", 
        category: "sport" 
      },
      { 
        content: "Transpire maintenant, brille plus tard.", 
        contentEn: "Sweat now, shine later.",
        author: "Inconnu", 
        category: "sport" 
      },
      { 
        content: "Le talent gagne des matchs, mais le travail d'équipe et l'intelligence gagnent des championnats.", 
        contentEn: "Talent wins games, but teamwork and intelligence wins championships.",
        author: "Michael Jordan", 
        category: "sport" 
      },
      { 
        content: "Vous ne perdez jamais. Soit vous gagnez, soit vous apprenez.", 
        contentEn: "You never lose. Either you win or you learn.",
        author: "Nelson Mandela", 
        category: "sport" 
      },
      { 
        content: "La force ne vient pas d'une capacité physique. Elle vient d'une volonté indomptable.", 
        contentEn: "Strength does not come from physical capacity. It comes from an indomitable will.",
        author: "Gandhi", 
        category: "sport" 
      },
      { 
        content: "Le vrai test n'est pas de savoir si vous évitez cet échec, parce que vous ne le ferez pas. C'est de savoir si vous laissez cela vous durcir ou vous faire honte pour vous soumettre.", 
        contentEn: "The real test is not whether you avoid this failure, because you won't. It's whether you let it harden or shame you into inaction.",
        author: "Barack Obama", 
        category: "sport" 
      },

      // ============ CONFIANCE EN SOI / CONFIDENCE (35 citations) ============
      { 
        content: "Croyez en vous-même et en tout ce que vous êtes. Sachez qu'il y a quelque chose à l'intérieur de vous qui est plus grand que n'importe quel obstacle.", 
        contentEn: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
        author: "Christian D. Larson", 
        category: "confidence" 
      },
      { 
        content: "Personne ne peut vous faire sentir inférieur sans votre consentement.", 
        contentEn: "No one can make you feel inferior without your consent.",
        author: "Eleanor Roosevelt", 
        category: "confidence" 
      },
      { 
        content: "La confiance en soi est le premier secret du succès.", 
        contentEn: "Self-confidence is the first secret of success.",
        author: "Ralph Waldo Emerson", 
        category: "confidence" 
      },
      { 
        content: "Vous avez été critiqué, rejeté et ridiculisé. Mais vous êtes toujours debout. Vous êtes plus fort que vous ne le pensez.", 
        contentEn: "You've been criticized, rejected, and ridiculed. But you're still standing. You're stronger than you think.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Soyez vous-même, tous les autres sont déjà pris.", 
        contentEn: "Be yourself, everyone else is already taken.",
        author: "Oscar Wilde", 
        category: "confidence" 
      },
      { 
        content: "Vous êtes bien plus brave et fort que vous ne le croyez.", 
        contentEn: "You are braver and stronger than you believe.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "La meilleure façon de prédire l'avenir, c'est de le créer.", 
        contentEn: "The best way to predict the future is to create it.",
        author: "Peter Drucker", 
        category: "confidence" 
      },
      { 
        content: "Ne laissez personne vous dire que vous ne pouvez pas faire quelque chose.", 
        contentEn: "Don't let anyone tell you that you can't do something.",
        author: "Will Smith", 
        category: "confidence" 
      },
      { 
        content: "La confiance, c'est accepter que vous puissiez échouer, mais persévérer quand même.", 
        contentEn: "Confidence is accepting that you might fail, but persevering anyway.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Crois en tes rêves et ils se réaliseront peut-être. Crois en toi et ils se réaliseront sûrement.", 
        contentEn: "Believe in your dreams and they may come true. Believe in yourself and they will come true.",
        author: "Martin Luther King Jr.", 
        category: "confidence" 
      },
      { 
        content: "Vous êtes capable de choses incroyables.", 
        contentEn: "You are capable of amazing things.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Le doute tue plus de rêves que l'échec ne le fera jamais.", 
        contentEn: "Doubt kills more dreams than failure ever will.",
        author: "Suzy Kassem", 
        category: "confidence" 
      },
      { 
        content: "Vous êtes le seul qui puisse limiter votre grandeur.", 
        contentEn: "You are the only one who can limit your greatness.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Ayez confiance en vos capacités ! Sans une humble mais raisonnable confiance en vos propres pouvoirs, vous ne pouvez être heureux ni réussir.", 
        contentEn: "Trust in your abilities! Without humble but reasonable confidence in your own powers, you cannot be happy or successful.",
        author: "Norman Vincent Peale", 
        category: "confidence" 
      },
      { 
        content: "N'ayez pas peur d'être incroyable.", 
        contentEn: "Don't be afraid to be amazing.",
        author: "Andy Offutt Irwin", 
        category: "confidence" 
      },
      { 
        content: "Vous méritez d'être fier de vous.", 
        contentEn: "You deserve to be proud of yourself.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "La seule personne que vous êtes destiné à devenir est la personne que vous décidez d'être.", 
        contentEn: "The only person you are destined to become is the person you decide to be.",
        author: "Ralph Waldo Emerson", 
        category: "confidence" 
      },
      { 
        content: "Soyez la meilleure version de vous-même, pas une copie de quelqu'un d'autre.", 
        contentEn: "Be the best version of yourself, not a copy of someone else.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Votre valeur n'est pas déterminée par l'opinion des autres.", 
        contentEn: "Your worth is not determined by the opinion of others.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Vous êtes assez. Vous avez toujours été assez. Vous serez toujours assez.", 
        contentEn: "You are enough. You have always been enough. You will always be enough.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Croyez que vous pouvez et vous êtes déjà à mi-chemin.", 
        contentEn: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt", 
        category: "confidence" 
      },
      { 
        content: "Il faut croire en ses rêves pour leur donner une chance de se réaliser.", 
        contentEn: "You have to believe in your dreams to give them a chance to come true.",
        author: "Paulo Coelho", 
        category: "confidence" 
      },
      { 
        content: "La vraie force, c'est de s'accepter tel que l'on est.", 
        contentEn: "True strength is accepting yourself as you are.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Votre opinion de vous est la seule qui compte vraiment.", 
        contentEn: "Your opinion of yourself is the only one that truly matters.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "La confiance attire la confiance.", 
        contentEn: "Confidence attracts confidence.",
        author: "Baltasar Gracián", 
        category: "confidence" 
      },
      { 
        content: "Osez être vous-même.", 
        contentEn: "Dare to be yourself.",
        author: "André Gide", 
        category: "confidence" 
      },
      { 
        content: "Chaque expert était autrefois un débutant.", 
        contentEn: "Every expert was once a beginner.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Vous êtes unique. Il n'y a personne comme vous et il n'y en aura jamais.", 
        contentEn: "You are unique. There is no one like you and there never will be.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "L'estime de soi n'est pas de l'arrogance, c'est du respect.", 
        contentEn: "Self-esteem is not arrogance, it's respect.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Acceptez-vous, aimez-vous et continuez d'avancer.", 
        contentEn: "Accept yourself, love yourself, and keep moving forward.",
        author: "Roy T. Bennett", 
        category: "confidence" 
      },
      { 
        content: "Vous n'avez pas besoin de la permission de qui que ce soit pour être génial.", 
        contentEn: "You don't need anyone's permission to be great.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Soyez fier de qui vous êtes et de chaque petit progrès que vous faites.", 
        contentEn: "Be proud of who you are and every small step of progress you make.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "La confiance en soi est un super-pouvoir. Une fois que vous commencez à y croire, la magie commence.", 
        contentEn: "Self-confidence is a superpower. Once you start to believe in yourself, magic starts happening.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Vous êtes le créateur de votre propre destin.", 
        contentEn: "You are the creator of your own destiny.",
        author: "Inconnu", 
        category: "confidence" 
      },
      { 
        content: "Ne diminuez jamais votre lumière pour que les autres se sentent à l'aise.", 
        contentEn: "Never dim your light so others feel comfortable.",
        author: "Inconnu", 
        category: "confidence" 
      },

      // ============ SOUTIEN / SUPPORT (15 citations) ============
      { 
        content: "Même la nuit la plus sombre prendra fin et le soleil se lèvera.", 
        contentEn: "Even the darkest night will end and the sun will rise.",
        author: "Victor Hugo", 
        category: "support" 
      },
      { 
        content: "Ce qui ne me tue pas me rend plus fort.", 
        contentEn: "What doesn't kill me makes me stronger.",
        author: "Friedrich Nietzsche", 
        category: "support" 
      },
      { 
        content: "Il y a des fleurs partout pour qui veut bien les voir.", 
        contentEn: "There are flowers everywhere for those who want to see them.",
        author: "Henri Matisse", 
        category: "support" 
      },
      { 
        content: "N'oublie jamais que tu es plus courageux que tu ne le crois, plus fort que tu ne le parais et plus intelligent que tu ne le penses.", 
        contentEn: "Never forget that you are braver than you believe, stronger than you seem, and smarter than you think.",
        author: "A.A. Milne", 
        category: "support" 
      },
      { 
        content: "Les temps difficiles ne durent pas, mais les gens forts oui.", 
        contentEn: "Tough times don't last, but tough people do.",
        author: "Robert H. Schuller", 
        category: "support" 
      },
      { 
        content: "Chaque jour est un nouveau départ. Respirez profondément et recommencez.", 
        contentEn: "Every day is a new beginning. Take a deep breath and start again.",
        author: "Inconnu", 
        category: "support" 
      },
      { 
        content: "Vous avez survécu à 100% de vos pires jours. Vous allez bien.", 
        contentEn: "You've survived 100% of your worst days. You're doing great.",
        author: "Inconnu", 
        category: "support" 
      },
      { 
        content: "Il est normal de ne pas être bien tout le temps.", 
        contentEn: "It's okay not to be okay all the time.",
        author: "Inconnu", 
        category: "support" 
      },
      { 
        content: "Les étoiles ne peuvent briller sans obscurité.", 
        contentEn: "Stars can't shine without darkness.",
        author: "D.H. Sidebottom", 
        category: "support" 
      },
      { 
        content: "Vous êtes plus fort que vous ne le savez, plus capable que vous ne l'imaginez.", 
        contentEn: "You are stronger than you know, more capable than you ever dreamed.",
        author: "Inconnu", 
        category: "support" 
      },
      { 
        content: "Cette aussi, ça passera.", 
        contentEn: "This too shall pass.",
        author: "Proverbe persan", 
        category: "support" 
      },
      { 
        content: "Il y a toujours de l'espoir. Même quand votre cerveau vous dit qu'il n'y en a pas.", 
        contentEn: "There is always hope. Even when your brain tells you there isn't.",
        author: "John Green", 
        category: "support" 
      },
      { 
        content: "Les moments difficiles forgent des personnes fortes.", 
        contentEn: "Difficult times forge strong people.",
        author: "Inconnu", 
        category: "support" 
      },
      { 
        content: "Sois patient avec toi-même. Rien dans la nature ne fleurit toute l'année.", 
        contentEn: "Be patient with yourself. Nothing in nature blooms all year.",
        author: "Inconnu", 
        category: "support" 
      },
      { 
        content: "Vous n'avez pas besoin d'être positif tout le temps. Il est parfaitement normal de se sentir triste, en colère, ennuyé, frustré, effrayé et anxieux. Avoir des sentiments ne fait pas de vous une personne négative. Cela fait de vous un être humain.", 
        contentEn: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, and anxious. Having feelings doesn't make you a negative person. It makes you human.",
        author: "Lori Deschene", 
        category: "support" 
      },

      // ============ RUPTURE / BREAKUP (12 citations) ============
      { 
        content: "Parfois, il faut accepter que certaines personnes ne peuvent être que dans votre cœur, pas dans votre vie.", 
        contentEn: "Sometimes you have to accept that some people can only be in your heart, not in your life.",
        author: "Inconnu", 
        category: "breakup" 
      },
      { 
        content: "Lâcher prise, c'est dire 'je t'aime' à soi-même.", 
        contentEn: "Letting go is saying 'I love you' to yourself.",
        author: "Inconnu", 
        category: "breakup" 
      },
      { 
        content: "Chaque fin est le début d'un nouveau départ.", 
        contentEn: "Every ending is the beginning of a new start.",
        author: "Inconnu", 
        category: "breakup" 
      },
      { 
        content: "La douleur aujourd'hui sera votre force demain.", 
        contentEn: "The pain today will be your strength tomorrow.",
        author: "Inconnu", 
        category: "breakup" 
      },
      { 
        content: "Parfois, perdre quelqu'un, c'est se retrouver soi-même.", 
        contentEn: "Sometimes losing someone is finding yourself.",
        author: "Inconnu", 
        category: "breakup" 
      },
      { 
        content: "Ne pleurez pas parce que c'est fini, souriez parce que ça a existé.", 
        contentEn: "Don't cry because it's over, smile because it happened.",
        author: "Dr. Seuss", 
        category: "breakup" 
      },
      { 
        content: "Vous méritez quelqu'un qui vous choisit tous les jours, pas seulement quand c'est pratique.", 
        contentEn: "You deserve someone who chooses you every day, not just when it's convenient.",
        author: "Inconnu", 
        category: "breakup" 
      },
      { 
        content: "On ne perd jamais les gens, on apprend qui sont les vrais.", 
        contentEn: "You never lose people, you learn who the real ones are.",
        author: "Inconnu", 
        category: "breakup" 
      },
      { 
        content: "Le temps guérit presque tout. Donnez du temps au temps.", 
        contentEn: "Time heals almost everything. Give time time.",
        author: "Regina Brett", 
        category: "breakup" 
      },
      { 
        content: "Vous méritez d'être une priorité, pas une option.", 
        contentEn: "You deserve to be a priority, not an option.",
        author: "Inconnu", 
        category: "breakup" 
      },
      { 
        content: "Ce qui était n'est plus. Ce qui sera sera mieux.", 
        contentEn: "What was is no more. What will be will be better.",
        author: "Inconnu", 
        category: "breakup" 
      },
      { 
        content: "Ne regrette jamais quelqu'un qui ne te mérite pas.", 
        contentEn: "Never regret someone who doesn't deserve you.",
        author: "Inconnu", 
        category: "breakup" 
      },

      // ============ PHILOSOPHIE / PHILOSOPHY (50 citations) ============
      { 
        content: "La vie, ce n'est pas d'attendre que l'orage passe, c'est d'apprendre à danser sous la pluie.", 
        contentEn: "Life isn't about waiting for the storm to pass, it's about learning to dance in the rain.",
        author: "Sénèque", 
        category: "philosophy" 
      },
      { 
        content: "Connais-toi toi-même.", 
        contentEn: "Know thyself.",
        author: "Socrate", 
        category: "philosophy" 
      },
      { 
        content: "Le bonheur n'est pas chose aisée. Il est très difficile de le trouver en nous, il est impossible de le trouver ailleurs.", 
        contentEn: "Happiness is not easy. It is very difficult to find within ourselves, impossible to find elsewhere.",
        author: "Bouddha", 
        category: "philosophy" 
      },
      { 
        content: "La vie est ce qui arrive pendant que vous êtes occupé à faire d'autres plans.", 
        contentEn: "Life is what happens when you're busy making other plans.",
        author: "John Lennon", 
        category: "philosophy" 
      },
      { 
        content: "Le but de la vie, c'est de vivre, et vivre signifie être conscient, joyeusement, sereinement, divinement conscient.", 
        contentEn: "The purpose of life is to live it, to taste experience to the utmost, to reach out eagerly and without fear for newer and richer experience.",
        author: "Eleanor Roosevelt", 
        category: "philosophy" 
      },
      { 
        content: "Être soi-même dans un monde qui essaie constamment de faire de vous quelqu'un d'autre est le plus grand accomplissement.", 
        contentEn: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
        author: "Ralph Waldo Emerson", 
        category: "philosophy" 
      },
      { 
        content: "La seule chose que nous avons à craindre est la crainte elle-même.", 
        contentEn: "The only thing we have to fear is fear itself.",
        author: "Franklin D. Roosevelt", 
        category: "philosophy" 
      },
      { 
        content: "Vis comme si tu devais mourir demain. Apprends comme si tu devais vivre toujours.", 
        contentEn: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
        author: "Gandhi", 
        category: "philosophy" 
      },
      { 
        content: "L'homme est condamné à être libre.", 
        contentEn: "Man is condemned to be free.",
        author: "Jean-Paul Sartre", 
        category: "philosophy" 
      },
      { 
        content: "Je pense, donc je suis.", 
        contentEn: "I think, therefore I am.",
        author: "René Descartes", 
        category: "philosophy" 
      },
      { 
        content: "Le bonheur n'est pas un état à atteindre, mais une manière de voyager.", 
        contentEn: "Happiness is not a state to reach, but a way to travel.",
        author: "Margaret Lee Runbeck", 
        category: "philosophy" 
      },
      { 
        content: "La liberté, c'est la liberté de dire que deux et deux font quatre.", 
        contentEn: "Freedom is the freedom to say that two plus two equals four.",
        author: "George Orwell", 
        category: "philosophy" 
      },
      { 
        content: "Le temps est trop lent pour ceux qui attendent, trop rapide pour ceux qui ont peur, trop long pour ceux qui souffrent, trop court pour ceux qui se réjouissent ; mais pour ceux qui aiment, le temps est l'éternité.", 
        contentEn: "Time is too slow for those who wait, too swift for those who fear, too long for those who grieve, too short for those who rejoice, but for those who love, time is eternity.",
        author: "Henry Van Dyke", 
        category: "philosophy" 
      },
      { 
        content: "Tout ce qui doit arriver arrivera, que nous nous inquiétions ou non.", 
        contentEn: "Whatever is going to happen will happen, whether we worry or not.",
        author: "Ana Monnar", 
        category: "philosophy" 
      },
      { 
        content: "La sagesse commence dans l'émerveillement.", 
        contentEn: "Wisdom begins in wonder.",
        author: "Socrate", 
        category: "philosophy" 
      },
      { 
        content: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.", 
        contentEn: "One sees clearly only with the heart. What is essential is invisible to the eye.",
        author: "Antoine de Saint-Exupéry", 
        category: "philosophy" 
      },
      { 
        content: "La vie est un mystère qu'il faut vivre, et non un problème à résoudre.", 
        contentEn: "Life is a mystery to be lived, not a problem to be solved.",
        author: "Osho", 
        category: "philosophy" 
      },
      { 
        content: "L'enfer, c'est les autres.", 
        contentEn: "Hell is other people.",
        author: "Jean-Paul Sartre", 
        category: "philosophy" 
      },
      { 
        content: "Le silence éternel de ces espaces infinis m'effraie.", 
        contentEn: "The eternal silence of these infinite spaces frightens me.",
        author: "Blaise Pascal", 
        category: "philosophy" 
      },
      { 
        content: "Exister, c'est oser se jeter dans le monde.", 
        contentEn: "To exist is to dare to throw oneself into the world.",
        author: "Simone de Beauvoir", 
        category: "philosophy" 
      },
      { 
        content: "La vie sans examen ne vaut pas la peine d'être vécue.", 
        contentEn: "The unexamined life is not worth living.",
        author: "Socrate", 
        category: "philosophy" 
      },
      { 
        content: "Il faut imaginer Sisyphe heureux.", 
        contentEn: "One must imagine Sisyphus happy.",
        author: "Albert Camus", 
        category: "philosophy" 
      },
      { 
        content: "Tout ce qui ne te tue pas te rend plus fort.", 
        contentEn: "That which does not kill us makes us stronger.",
        author: "Friedrich Nietzsche", 
        category: "philosophy" 
      },
      { 
        content: "Le changement est la seule constante de la vie.", 
        contentEn: "Change is the only constant in life.",
        author: "Héraclite", 
        category: "philosophy" 
      },
      { 
        content: "Nul n'est plus esclave que celui qui se croit libre sans l'être.", 
        contentEn: "None are more hopelessly enslaved than those who falsely believe they are free.",
        author: "Johann Wolfgang von Goethe", 
        category: "philosophy" 
      },
      { 
        content: "La seule chose dont nous soyons certains, c'est que nous devons mourir.", 
        contentEn: "The only thing we can be certain of is that we must die.",
        author: "Montaigne", 
        category: "philosophy" 
      },
      { 
        content: "Le désir fait agir, mais c'est la raison qui guide.", 
        contentEn: "Desire makes us act, but reason guides us.",
        author: "Aristote", 
        category: "philosophy" 
      },
      { 
        content: "L'homme n'est qu'un roseau, le plus faible de la nature, mais c'est un roseau pensant.", 
        contentEn: "Man is only a reed, the weakest in nature, but he is a thinking reed.",
        author: "Blaise Pascal", 
        category: "philosophy" 
      },
      { 
        content: "Deviens ce que tu es.", 
        contentEn: "Become who you are.",
        author: "Friedrich Nietzsche", 
        category: "philosophy" 
      },
      { 
        content: "La vérité est rarement pure et jamais simple.", 
        contentEn: "The truth is rarely pure and never simple.",
        author: "Oscar Wilde", 
        category: "philosophy" 
      },
      { 
        content: "Tout comprendre, c'est tout pardonner.", 
        contentEn: "To understand all is to forgive all.",
        author: "Bouddha", 
        category: "philosophy" 
      },
      { 
        content: "La vraie générosité envers l'avenir consiste à tout donner au présent.", 
        contentEn: "Real generosity towards the future lies in giving all to the present.",
        author: "Albert Camus", 
        category: "philosophy" 
      },
      { 
        content: "L'absurde naît de cette confrontation entre l'appel humain et le silence déraisonnable du monde.", 
        contentEn: "The absurd is born from this confrontation between the human call and the unreasonable silence of the world.",
        author: "Albert Camus", 
        category: "philosophy" 
      },
      { 
        content: "La mort est un sommeil sans rêves.", 
        contentEn: "Death is a sleep without dreams.",
        author: "Homère", 
        category: "philosophy" 
      },
      { 
        content: "Ce qui m'inquiète, ce n'est pas la réalité mais les fantômes qu'elle éveille en moi.", 
        contentEn: "What worries me is not reality but the ghosts it awakens in me.",
        author: "Emil Cioran", 
        category: "philosophy" 
      },
      { 
        content: "Nous sommes nos choix.", 
        contentEn: "We are our choices.",
        author: "Jean-Paul Sartre", 
        category: "philosophy" 
      },
      { 
        content: "Le temps passe, mais les souvenirs restent.", 
        contentEn: "Time passes, but memories remain.",
        author: "Proverbe", 
        category: "philosophy" 
      },
      { 
        content: "L'habitude est une seconde nature qui détruit la première.", 
        contentEn: "Habit is a second nature that destroys the first.",
        author: "Blaise Pascal", 
        category: "philosophy" 
      },
      { 
        content: "Le doute est le commencement de la sagesse.", 
        contentEn: "Doubt is the beginning of wisdom.",
        author: "Aristote", 
        category: "philosophy" 
      },
      { 
        content: "La meilleure façon d'être heureux, c'est de contribuer au bonheur des autres.", 
        contentEn: "The best way to be happy is to contribute to the happiness of others.",
        author: "Marc Aurèle", 
        category: "philosophy" 
      },
      { 
        content: "Le courage n'est pas l'absence de peur, mais la capacité de la vaincre.", 
        contentEn: "Courage is not the absence of fear, but the ability to overcome it.",
        author: "Nelson Mandela", 
        category: "philosophy" 
      },
      { 
        content: "Chaque homme porte la forme entière de l'humaine condition.", 
        contentEn: "Every man bears the whole stamp of the human condition.",
        author: "Montaigne", 
        category: "philosophy" 
      },
      { 
        content: "La patience est la clé de la paix intérieure.", 
        contentEn: "Patience is the key to inner peace.",
        author: "Proverbe arabe", 
        category: "philosophy" 
      },
      { 
        content: "Il n'y a pas de chemin vers le bonheur. Le bonheur est le chemin.", 
        contentEn: "There is no path to happiness. Happiness is the path.",
        author: "Bouddha", 
        category: "philosophy" 
      },
      { 
        content: "Celui qui déplace une montagne commence par déplacer de petites pierres.", 
        contentEn: "The man who moves a mountain begins by carrying away small stones.",
        author: "Confucius", 
        category: "philosophy" 
      },
      { 
        content: "Le sage ne dit pas ce qu'il sait, le fou ne sait pas ce qu'il dit.", 
        contentEn: "The wise man doesn't say what he knows, the fool doesn't know what he says.",
        author: "Confucius", 
        category: "philosophy" 
      },
      { 
        content: "La vraie victoire est celle de la paix intérieure.", 
        contentEn: "True victory is that of inner peace.",
        author: "Dalaï Lama", 
        category: "philosophy" 
      },
      { 
        content: "Celui qui pose une question est bête pendant cinq minutes, celui qui n'en pose pas l'est toute sa vie.", 
        contentEn: "He who asks a question is a fool for five minutes; he who does not ask remains a fool forever.",
        author: "Proverbe chinois", 
        category: "philosophy" 
      },
      { 
        content: "L'important n'est pas de vivre, mais de bien vivre.", 
        contentEn: "The important thing is not to live, but to live well.",
        author: "Platon", 
        category: "philosophy" 
      },
      { 
        content: "Tout peut être pris à un homme sauf une chose : la dernière des libertés humaines, choisir son attitude dans n'importe quel ensemble de circonstances.", 
        contentEn: "Everything can be taken from a man but one thing: the last of the human freedoms—to choose one's attitude in any given set of circumstances.",
        author: "Viktor Frankl", 
        category: "philosophy" 
      },

      // ============ SUCCÈS / SUCCESS (30 citations) ============
      { 
        content: "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès. Si vous aimez ce que vous faites, vous réussirez.", 
        contentEn: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
        author: "Albert Schweitzer", 
        category: "success" 
      },
      { 
        content: "Les gagnants trouvent des moyens, les perdants des excuses.", 
        contentEn: "Winners find ways, losers find excuses.",
        author: "F. D. Roosevelt", 
        category: "success" 
      },
      { 
        content: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", 
        contentEn: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill", 
        category: "success" 
      },
      { 
        content: "Le succès consiste à aller d'échec en échec sans perdre son enthousiasme.", 
        contentEn: "Success consists of going from failure to failure without loss of enthusiasm.",
        author: "Winston Churchill", 
        category: "success" 
      },
      { 
        content: "Ne craignez pas d'échouer, craignez de ne pas essayer.", 
        contentEn: "Don't be afraid to fail, be afraid not to try.",
        author: "Michael Jordan", 
        category: "success" 
      },
      { 
        content: "Le succès est la somme de petits efforts répétés jour après jour.", 
        contentEn: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier", 
        category: "success" 
      },
      { 
        content: "Il y a deux types de personnes qui vous diront que vous ne pouvez pas faire de différence dans ce monde : ceux qui ont peur d'essayer et ceux qui ont peur que vous réussissiez.", 
        contentEn: "There are two types of people who will tell you that you cannot make a difference in this world: those who are afraid to try and those who are afraid you will succeed.",
        author: "Ray Goforth", 
        category: "success" 
      },
      { 
        content: "La réussite appartient à tout le monde. C'est au travail d'équipe qu'en revient le mérite.", 
        contentEn: "Success belongs to everyone. It's the teamwork that gets the credit.",
        author: "Frank Piccard", 
        category: "success" 
      },
      { 
        content: "Le succès, c'est tomber sept fois et se relever huit.", 
        contentEn: "Success is falling seven times and getting up eight.",
        author: "Proverbe japonais", 
        category: "success" 
      },
      { 
        content: "Les grandes choses ne sont jamais accomplies par une seule personne. Elles le sont par une équipe.", 
        contentEn: "Great things are never accomplished by one person. They are accomplished by a team.",
        author: "Steve Jobs", 
        category: "success" 
      },
      { 
        content: "Le succès n'est pas accidentel. C'est du travail acharné, de la persévérance, de l'apprentissage, de l'étude, du sacrifice et surtout, de l'amour de ce que vous faites.", 
        contentEn: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.",
        author: "Pelé", 
        category: "success" 
      },
      { 
        content: "Je n'ai pas échoué. J'ai simplement trouvé 10 000 solutions qui ne fonctionnent pas.", 
        contentEn: "I have not failed. I've just found 10,000 ways that won't work.",
        author: "Thomas Edison", 
        category: "success" 
      },
      { 
        content: "Le succès, c'est obtenir ce que vous voulez. Le bonheur, c'est vouloir ce que vous obtenez.", 
        contentEn: "Success is getting what you want. Happiness is wanting what you get.",
        author: "Dale Carnegie", 
        category: "success" 
      },
      { 
        content: "Visez la lune. Même si vous la manquez, vous atterrirez parmi les étoiles.", 
        contentEn: "Shoot for the moon. Even if you miss, you'll land among the stars.",
        author: "Les Brown", 
        category: "success" 
      },
      { 
        content: "Le seul endroit où 'succès' vient avant 'travail' est dans le dictionnaire.", 
        contentEn: "The only place where 'success' comes before 'work' is in the dictionary.",
        author: "Vince Lombardi", 
        category: "success" 
      },
      { 
        content: "N'abandonnez pas. Souffrez maintenant et vivez le reste de votre vie en tant que champion.", 
        contentEn: "Don't quit. Suffer now and live the rest of your life as a champion.",
        author: "Muhammad Ali", 
        category: "success" 
      },
      { 
        content: "Le succès est la capacité d'aller d'un échec à l'autre sans perdre son enthousiasme.", 
        contentEn: "Success is the ability to go from one failure to another with no loss of enthusiasm.",
        author: "Winston Churchill", 
        category: "success" 
      },
      { 
        content: "Si vous voulez quelque chose que vous n'avez jamais eu, vous devez faire quelque chose que vous n'avez jamais fait.", 
        contentEn: "If you want something you've never had, you must be willing to do something you've never done.",
        author: "Thomas Jefferson", 
        category: "success" 
      },
      { 
        content: "Le succès semble toujours être le fruit du hasard pour ceux qui n'ont pas réussi.", 
        contentEn: "Success always seems to be the result of chance for those who have not succeeded.",
        author: "Jean Cocteau", 
        category: "success" 
      },
      { 
        content: "Tout vient à qui sait attendre... mais seulement les choses laissées par ceux qui se sont dépêchés.", 
        contentEn: "Everything comes to those who wait... but only the things left by those who hustle.",
        author: "Abraham Lincoln", 
        category: "success" 
      },
      { 
        content: "Votre revenu est déterminé par combien de personnes vous servez et à quel point vous les servez bien.", 
        contentEn: "Your income is determined by how many people you serve and how well you serve them.",
        author: "Bob Burg", 
        category: "success" 
      },
      { 
        content: "Le succès est un mauvais professeur. Il pousse les gens intelligents à penser qu'ils ne peuvent pas perdre.", 
        contentEn: "Success is a lousy teacher. It seduces smart people into thinking they can't lose.",
        author: "Bill Gates", 
        category: "success" 
      },
      { 
        content: "Pour réussir, votre désir de succès doit être plus grand que votre peur de l'échec.", 
        contentEn: "In order to succeed, your desire for success should be greater than your fear of failure.",
        author: "Bill Cosby", 
        category: "success" 
      },
      { 
        content: "Les personnes qui réussissent font ce que les personnes qui échouent ne veulent pas faire.", 
        contentEn: "Successful people do what unsuccessful people are not willing to do.",
        author: "Jim Rohn", 
        category: "success" 
      },
      { 
        content: "Le secret du succès est de faire des choses ordinaires extraordinairement bien.", 
        contentEn: "The secret of success is to do the common things uncommonly well.",
        author: "John D. Rockefeller Jr.", 
        category: "success" 
      },
      { 
        content: "La route du succès est toujours en construction.", 
        contentEn: "The road to success is always under construction.",
        author: "Lily Tomlin", 
        category: "success" 
      },
      { 
        content: "Le succès ne consiste pas à ne jamais tomber, mais à se relever à chaque fois que l'on tombe.", 
        contentEn: "Success is not about never falling, but about getting up every time you fall.",
        author: "Confucius", 
        category: "success" 
      },
      { 
        content: "Si vous voulez atteindre l'excellence, vous pouvez y arriver aujourd'hui. À partir de cette seconde, arrêtez de faire un travail médiocre.", 
        contentEn: "If you want to achieve excellence, you can get there today. As of this second, quit doing less-than-excellent work.",
        author: "Thomas J. Watson", 
        category: "success" 
      },
      { 
        content: "Le succès c'est d'aller de l'avant avec ce qui vous passionne.", 
        contentEn: "Success is moving forward with what you're passionate about.",
        author: "Inconnu", 
        category: "success" 
      },
      { 
        content: "Les personnes qui réussissent sont celles qui cherchent les circonstances qu'elles veulent, et si elles ne les trouvent pas, elles les créent.", 
        contentEn: "People who succeed are those who seek the circumstances they want, and if they don't find them, they create them.",
        author: "George Bernard Shaw", 
        category: "success" 
      },
    ];

    for (const q of seedData) {
      await this.createQuote(q);
    }
  }
}

export const storage = new DatabaseStorage();