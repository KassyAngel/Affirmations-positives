import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PremiumTier = 'free' | 'premium';
export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime';

interface PremiumState {
  tier: PremiumTier;
  plan: PremiumPlan | null;
  purchaseDate: string | null;
  expiryDate: string | null;

  // Limits
  dailyQuotesViewed: number;
  lastQuoteResetDate: string;

  // Actions
  setPremium: (plan: PremiumPlan) => void;
  removePremium: () => void;
  incrementQuotesViewed: () => void;
  resetDailyQuotes: () => void;
  canViewQuote: () => boolean;
  getRemainingQuotes: () => number;
  isPremium: () => boolean;
}

const DAILY_QUOTE_LIMIT_FREE = 3;

export const usePremium = create<PremiumState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      plan: null,
      purchaseDate: null,
      expiryDate: null,
      dailyQuotesViewed: 0,
      lastQuoteResetDate: new Date().toDateString(),

      setPremium: (plan: PremiumPlan) => {
        const now = new Date();
        let expiryDate: Date | null = null;

        if (plan === 'monthly') {
          expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        } else if (plan === 'yearly') {
          expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        }
        // lifetime = no expiry

        set({
          tier: 'premium',
          plan,
          purchaseDate: now.toISOString(),
          expiryDate: expiryDate ? expiryDate.toISOString() : null,
        });
      },

      removePremium: () => {
        set({
          tier: 'free',
          plan: null,
          purchaseDate: null,
          expiryDate: null,
        });
      },

      incrementQuotesViewed: () => {
        const state = get();
        const today = new Date().toDateString();

        // Reset if new day
        if (state.lastQuoteResetDate !== today) {
          set({
            dailyQuotesViewed: 1,
            lastQuoteResetDate: today,
          });
        } else {
          set({ dailyQuotesViewed: state.dailyQuotesViewed + 1 });
        }
      },

      resetDailyQuotes: () => {
        set({
          dailyQuotesViewed: 0,
          lastQuoteResetDate: new Date().toDateString(),
        });
      },

      canViewQuote: () => {
        const state = get();

        // Premium = unlimited
        if (state.tier === 'premium') return true;

        // Check if need to reset
        const today = new Date().toDateString();
        if (state.lastQuoteResetDate !== today) {
          // Auto-reset (sera fait au prochain incrementQuotesViewed)
          return true;
        }

        // Check limit
        return state.dailyQuotesViewed < DAILY_QUOTE_LIMIT_FREE;
      },

      getRemainingQuotes: () => {
        const state = get();
        if (state.tier === 'premium') return 999; // Unlimited

        const today = new Date().toDateString();
        if (state.lastQuoteResetDate !== today) {
          return DAILY_QUOTE_LIMIT_FREE;
        }

        return Math.max(0, DAILY_QUOTE_LIMIT_FREE - state.dailyQuotesViewed);
      },

      isPremium: () => {
        const state = get();

        // Check if expired (for monthly/yearly)
        if (state.tier === 'premium' && state.expiryDate) {
          const now = new Date();
          const expiry = new Date(state.expiryDate);
          if (now > expiry) {
            // Auto-remove premium si expiré
            set({
              tier: 'free',
              plan: null,
              purchaseDate: null,
              expiryDate: null,
            });
            return false;
          }
        }

        return state.tier === 'premium';
      },
    }),
    {
      name: 'premium-storage',
    }
  )
);