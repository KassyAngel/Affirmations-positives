import { useQuery } from "@tanstack/react-query";
import type { Quote } from "@shared/schema";
import {
  getQuotesByCategory,
  getQuoteById,
  getRandomQuote,
  searchQuotes,
} from "@/data/quotes-data";
import { usePremium } from "@/hooks/use-premium";

// ✅ Catégories accessibles gratuitement
const FREE_CATEGORIES = new Set([
  'work', 'love', 'confidence', 'support', 'gratitude', 'wellness'
]);

// ✅ Catégories Premium uniquement
const PREMIUM_CATEGORIES = new Set([
  'sport', 'breakup', 'philosophy', 'success', 'family', 'femininity', 'letting-go'
]);

// GET quotes — filtrage local par catégorie et/ou recherche
export function useQuotes(params?: { category?: string; search?: string; limit?: number }) {
  // ✅ On extrait "tier" pour re-render quand le statut change
  const { isPremium, tier } = usePremium();
  const userIsPremium = isPremium();

  return useQuery<Quote[]>({
    queryKey: ["quotes-local", params?.category, params?.search, params?.limit, tier],
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

      // ✅ Si pas Premium → filtrer les citations Premium
      if (!userIsPremium) {
        results = results.filter(q => FREE_CATEGORIES.has(q.category));
      }

      if (params?.limit) {
        results = results.slice(0, params.limit);
      }

      return results;
    },
    staleTime: Infinity,
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
  const { isPremium, tier } = usePremium();
  const userIsPremium = isPremium();

  return useQuery<Quote | undefined>({
    queryKey: ["quote-random-local", category, tier],
    queryFn: () => {
      // ✅ Si gratuit et catégorie Premium → retourne undefined
      if (!userIsPremium && category && PREMIUM_CATEGORIES.has(category)) {
        return undefined;
      }
      return getRandomQuote(category);
    },
    staleTime: 0,
  });
}

// useCreateQuote — stub no-op pour compatibilité
export function useCreateQuote() {
  return {
    mutate: () => console.warn("useCreateQuote: non disponible en mode offline"),
    mutateAsync: async () => { throw new Error("useCreateQuote: non disponible en mode offline"); },
    isPending: false,
    isError: false,
    isSuccess: false,
  };
}

// Export des sets pour réutilisation ailleurs
export { FREE_CATEGORIES, PREMIUM_CATEGORIES };