import { db } from "./db";
import { quotes, type InsertQuote, type Quote } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getQuotes(category?: string, search?: string, limit?: number): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  getRandomQuote(category?: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  seedQuotes(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getQuotes(category?: string, search?: string, limit?: number): Promise<Quote[]> {
    let query = db.select().from(quotes);

    if (category) {
      query = query.where(eq(quotes.category, category)) as any;
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

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db.insert(quotes).values(insertQuote).returning();
    return quote;
  }

  async seedQuotes(): Promise<void> {
    const count = await db.select({ count: sql<number>`count(*)` }).from(quotes);
    if (Number(count[0].count) > 0) return;

    const seedData: InsertQuote[] = [
      // Motivation / Travail
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

      // Sport / Exercice
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

      // Amour
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

      // Confiance en soi
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

      // Philosophie
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

      // Dépression / Soutien
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

      // Rupture
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

      // Succès
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
    ];

    for (const q of seedData) {
      await this.createQuote(q);
    }
  }
}

export const storage = new DatabaseStorage();