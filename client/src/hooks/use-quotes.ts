import { useQuery } from "@tanstack/react-query";
import type { Quote } from "@shared/schema";
import {
  getQuotesByCategory,
  getQuoteById,
  getRandomQuote,
  searchQuotes,
} from "@/data/quotes-data";

// GET quotes — filtrage local par catégorie et/ou recherche
export function useQuotes(params?: { category?: string; search?: string; limit?: number }) {
  return useQuery<Quote[]>({
    queryKey: ["quotes-local", params?.category, params?.search, params?.limit],
    queryFn: () => {
      let results: Quote[];

      if (params?.search) {
        results = searchQuotes(params.search);
        if (params.category) {
          results = results.filter(q => q.category === params.category);
        }
      } else {
        results = getQuotesByCategory(params?.category);
      }

      if (params?.limit) {
        results = results.slice(0, params.limit);
      }

      return results;
    },
    staleTime: Infinity, // données statiques, jamais périmées
  });
}

// GET quote par ID
export function useQuote(id: number) {
  return useQuery<Quote | undefined>({
    queryKey: ["quote-local", id],
    queryFn: () => getQuoteById(id),
    enabled: !!id,
    staleTime: Infinity,
  });
}

// GET citation aléatoire
export function useRandomQuote(category?: string) {
  return useQuery<Quote | undefined>({
    queryKey: ["quote-random-local", category],
    queryFn: () => getRandomQuote(category),
    staleTime: 0, // on veut une nouvelle citation à chaque appel
  });
}

// useCreateQuote — non pertinent en offline, stub no-op pour compatibilité
export function useCreateQuote() {
  return {
    mutate: () => console.warn("useCreateQuote: non disponible en mode offline"),
    mutateAsync: async () => { throw new Error("useCreateQuote: non disponible en mode offline"); },
    isPending: false,
    isError: false,
    isSuccess: false,
  };
}