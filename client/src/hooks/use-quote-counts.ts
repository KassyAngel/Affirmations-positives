import { getQuoteCountsByCategory } from "@/data/quotes-data";

/**
 * Retourne le nombre de citations par catégorie.
 * Calculé directement depuis ALL_QUOTES (fichier local) —
 * toujours en sync, pas d'appel réseau, pas de désync BDD.
 */
export function useQuoteCounts() {
  const counts = getQuoteCountsByCategory();

  return {
    data: counts,
    isLoading: false,
    error: null,
  };
}