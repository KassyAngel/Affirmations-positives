import { useQuery } from "@tanstack/react-query";

export function useQuoteCounts() {
  return useQuery({
    queryKey: ["/api/quotes/count-by-category"],
    queryFn: async () => {
      const res = await fetch("/api/quotes/count-by-category", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Impossible de charger les compteurs");
      return res.json() as Promise<Record<string, number>>;
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}