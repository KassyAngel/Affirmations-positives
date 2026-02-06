import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type QuoteResponse, type InsertQuote } from "@shared/routes";

// GET /api/quotes - List quotes with optional filters
export function useQuotes(params?: { category?: string; search?: string; limit?: number }) {
  const queryKey = params ? [api.quotes.list.path, params] : [api.quotes.list.path];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build URL with query params manually since buildUrl only handles path params
      const url = new URL(api.quotes.list.path, window.location.origin);
      if (params?.category) url.searchParams.append("category", params.category);
      if (params?.search) url.searchParams.append("search", params.search);
      if (params?.limit) url.searchParams.append("limit", params.limit.toString());
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les citations");
      return api.quotes.list.responses[200].parse(await res.json());
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// GET /api/quotes/:id
export function useQuote(id: number) {
  return useQuery({
    queryKey: [api.quotes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.quotes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Citation introuvable");
      return api.quotes.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// GET /api/quotes/random
export function useRandomQuote(category?: string) {
  return useQuery({
    queryKey: [api.quotes.random.path, category],
    queryFn: async () => {
      const url = new URL(api.quotes.random.path, window.location.origin);
      if (category) url.searchParams.append("category", category);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger une citation aléatoire");
      return api.quotes.random.responses[200].parse(await res.json());
    },
  });
}

// POST /api/quotes - Admin/Seeding
export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertQuote) => {
      const validated = api.quotes.create.input.parse(data);
      const res = await fetch(api.quotes.create.path, {
        method: api.quotes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.quotes.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Erreur lors de la création");
      }
      return api.quotes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quotes.list.path] });
    },
  });
}
