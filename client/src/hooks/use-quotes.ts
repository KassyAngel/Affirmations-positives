import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Quote, InsertQuote } from "@shared/schema";

// GET /api/quotes - List quotes with optional filters
export function useQuotes(params?: { category?: string; search?: string; limit?: number }) {
  const queryKey = params ? ["/api/quotes", params] : ["/api/quotes"];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL("/api/quotes", window.location.origin);
      if (params?.category) url.searchParams.append("category", params.category);
      if (params?.search) url.searchParams.append("search", params.search);
      if (params?.limit) url.searchParams.append("limit", params.limit.toString());

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les citations");
      return res.json() as Promise<Quote[]>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// GET /api/quotes/:id
export function useQuote(id: number) {
  return useQuery({
    queryKey: ["/api/quotes", id],
    queryFn: async () => {
      const res = await fetch(`/api/quotes/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Citation introuvable");
      return res.json() as Promise<Quote>;
    },
    enabled: !!id,
  });
}

// GET /api/quotes/random
export function useRandomQuote(category?: string) {
  return useQuery({
    queryKey: ["/api/quotes/random", category],
    queryFn: async () => {
      const url = new URL("/api/quotes/random", window.location.origin);
      if (category) url.searchParams.append("category", category);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger une citation aléatoire");
      return res.json() as Promise<Quote>;
    },
  });
}

// POST /api/quotes - Admin/Seeding
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertQuote) => {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de la création");
      }

      return res.json() as Promise<Quote>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
    },
  });
}