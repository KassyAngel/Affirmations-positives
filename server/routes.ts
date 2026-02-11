import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Initialize seed data
  await storage.seedQuotes();

  // GET /api/quotes - List quotes with optional filters
  app.get(api.quotes.list.path, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      const quotes = await storage.getQuotes(category, search, limit);
      res.json(quotes);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/quotes/random - Get random quote
  app.get(api.quotes.random.path, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const quote = await storage.getRandomQuote(category);
      if (!quote) {
        // If no quote found for category, try falling back to any quote
        const fallback = await storage.getRandomQuote();
        if (!fallback) return res.status(404).json({ message: "No quotes found" });
        return res.json(fallback);
      }
      res.json(quote);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/quotes/count-by-category - Get quote counts by category
  app.get("/api/quotes/count-by-category", async (req, res) => {
    try {
      const counts = await storage.getQuoteCountsByCategory();
      res.json(counts);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/quotes/:id - Get specific quote
  app.get(api.quotes.get.path, async (req, res) => {
    try {
      const quote = await storage.getQuote(Number(req.params.id));
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/quotes - Create quote (Admin/Seeding)
  app.post(api.quotes.create.path, async (req, res) => {
    try {
      const input = api.quotes.create.input.parse(req.body);
      const quote = await storage.createQuote(input);
      res.status(201).json(quote);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}