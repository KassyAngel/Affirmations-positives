import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'work', 'love', 'sport', 'confidence', 'support', 'breakup', 'philosophy', 'success'
  backgroundImage: text("background_image"), // Optional URL or CSS gradient string
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true });

// === TYPES ===
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

// Types for client-side storage (LocalStorage)
export type Mood = "happy" | "tired" | "determined" | "zen" | "frustrated";

export interface MoodLog {
  date: string; // ISO date string YYYY-MM-DD
  mood: Mood;
  note?: string;
}

export interface UserState {
  favorites: number[]; // Array of quote IDs
  streak: number;
  lastVisit: string | null;
  moodHistory: MoodLog[];
  dailyQuote: {
    date: string;
    quoteId: number;
  } | null;
}

// === API REQUEST/RESPONSE TYPES ===
export type QuoteResponse = Quote;
export type QuotesListResponse = Quote[];

export interface QuotesQueryParams {
  category?: string;
  search?: string;
}
