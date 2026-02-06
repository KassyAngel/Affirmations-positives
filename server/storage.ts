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
    
    // Simple random ordering for list if no search
    if (!search) {
       // In a real large DB we wouldn't order by random() for full lists, but for 100 items it's fine
       // Actually let's just order by ID desc for list
       // query = query.orderBy(desc(quotes.id));
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
      { content: "Le seul endroit où le succès vient avant le travail, c'est dans le dictionnaire.", author: "Vidal Sassoon", category: "work" },
      { content: "Votre temps est limité, ne le gâchez pas en menant une existence qui n'est pas la vôtre.", author: "Steve Jobs", category: "work" },
      { content: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.", author: "Winston Churchill", category: "work" },
      { content: "Choisissez un travail que vous aimez et vous n'aurez pas à travailler un seul jour de votre vie.", author: "Confucius", category: "work" },
      { content: "L'action est la clé fondamentale de tout succès.", author: "Pablo Picasso", category: "work" },

      // Sport / Exercice
      { content: "La douleur est temporaire. L'abandon est définitif.", author: "Lance Armstrong", category: "sport" },
      { content: "Ne limite pas tes défis, défie tes limites.", author: "Inconnu", category: "sport" },
      { content: "Le corps accomplit ce que l'esprit croit.", author: "Inconnu", category: "sport" },
      { content: "Il n'y a pas de raccourci vers un endroit qui en vaut la peine.", author: "Beverly Sills", category: "sport" },
      { content: "Prenez soin de votre corps. C'est le seul endroit où vous devez vivre.", author: "Jim Rohn", category: "sport" },

      // Amour
      { content: "Aimer, ce n'est pas se regarder l'un l'autre, c'est regarder ensemble dans la même direction.", author: "Antoine de Saint-Exupéry", category: "love" },
      { content: "La vie est un sommeil, l'amour en est le rêve.", author: "Alfred de Musset", category: "love" },
      { content: "Le plus grand bonheur après celui d'aimer, c'est de confesser son amour.", author: "André Gide", category: "love" },
      { content: "Il n'y a qu'un bonheur dans la vie, c'est d'aimer et d'être aimé.", author: "George Sand", category: "love" },

      // Confiance en soi
      { content: "Croyez en vous-même et en tout ce que vous êtes. Sachez qu'il y a quelque chose à l'intérieur de vous qui est plus grand que n'importe quel obstacle.", author: "Christian D. Larson", category: "confidence" },
      { content: "Personne ne peut vous faire sentir inférieur sans votre consentement.", author: "Eleanor Roosevelt", category: "confidence" },
      { content: "La confiance en soi est le premier secret du succès.", author: "Ralph Waldo Emerson", category: "confidence" },

      // Philosophie
      { content: "La vie, ce n'est pas d'attendre que l'orage passe, c'est d'apprendre à danser sous la pluie.", author: "Sénèque", category: "philosophy" },
      { content: "Connais-toi toi-même.", author: "Socrate", category: "philosophy" },
      { content: "Le bonheur n'est pas chose aisée. Il est très difficile de le trouver en nous, il est impossible de le trouver ailleurs.", author: "Bouddha", category: "philosophy" },

      // Dépression / Soutien
      { content: "Même la nuit la plus sombre prendra fin et le soleil se lèvera.", author: "Victor Hugo", category: "support" },
      { content: "Ce qui ne me tue pas me rend plus fort.", author: "Friedrich Nietzsche", category: "support" },
      { content: "Il y a des fleurs partout pour qui veut bien les voir.", author: "Henri Matisse", category: "support" },
      { content: "N'oublie jamais que tu es plus courageux que tu ne le crois, plus fort que tu ne le parais et plus intelligent que tu ne le penses.", author: "A.A. Milne", category: "support" },

      // Rupture
      { content: "Parfois, il faut accepter que certaines personnes ne peuvent être que dans votre cœur, pas dans votre vie.", author: "Inconnu", category: "breakup" },
      { content: "Lâcher prise, c'est dire 'je t'aime' à soi-même.", author: "Inconnu", category: "breakup" },
      { content: "Chaque fin est le début d'un nouveau départ.", author: "Inconnu", category: "breakup" },

      // Succès
      { content: "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès. Si vous aimez ce que vous faites, vous réussirez.", author: "Albert Schweitzer", category: "success" },
      { content: "Les gagnants trouvent des moyens, les perdants des excuses.", author: "F. D. Roosevelt", category: "success" },
    ];

    for (const q of seedData) {
      await this.createQuote(q);
    }
  }
}

export const storage = new DatabaseStorage();
