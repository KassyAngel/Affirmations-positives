import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export type PremiumTier = 'free' | 'premium';
export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime';

// ─── Clés RevenueCat ──────────────────────────────────────────────────────────
const RC_GOOGLE_KEY = 'goog_ptfKFejVcGBkPUpbPKAlXhqrPnu';
const RC_TEST_KEY   = 'test_MPAaPMzvTpDLuPqbYFxsVXccbwc';
const isNative      = Capacitor.isNativePlatform();
const RC_API_KEY    = isNative ? RC_GOOGLE_KEY : RC_TEST_KEY;

// Identifiants des offerings dans RevenueCat
const OFFERING_IDS: Record<PremiumPlan, string> = {
  monthly:  'default',
  yearly:   'annuel',
  lifetime: 'lifetime',
};

let rcInitialized = false;
async function initRC() {
  if (rcInitialized) return;
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: RC_API_KEY });
    rcInitialized = true;
  } catch (e) {
    console.warn('[RC] Init failed (normal on web):', e);
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PremiumState {
  tier: PremiumTier;
  plan: PremiumPlan | null;
  purchaseDate: string | null;
  expiryDate: string | null;
  dailyQuotesViewed: number;
  lastQuoteResetDate: string;
  // Actions locales
  setPremium: (plan: PremiumPlan) => void;
  removePremium: () => void;
  incrementQuotesViewed: () => void;
  resetDailyQuotes: () => void;
  canViewQuote: () => boolean;
  getRemainingQuotes: () => number;
  isPremium: () => boolean;
  // Actions RevenueCat
  purchase: (plan: PremiumPlan) => Promise<boolean>;
  restore: () => Promise<boolean>;
  syncWithRevenueCat: () => Promise<void>;
}

const DAILY_QUOTE_LIMIT_FREE = 6;

export const usePremium = create<PremiumState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      plan: null,
      purchaseDate: null,
      expiryDate: null,
      dailyQuotesViewed: 0,
      lastQuoteResetDate: new Date().toDateString(),

      // ── Actions locales INCHANGÉES ──────────────────────────────────────────
      setPremium: (plan: PremiumPlan) => {
        const now = new Date();
        let expiryDate: Date | null = null;
        if (plan === 'monthly') {
          expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        } else if (plan === 'yearly') {
          expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        }
        set({
          tier: 'premium',
          plan,
          purchaseDate: now.toISOString(),
          expiryDate: expiryDate ? expiryDate.toISOString() : null,
        });
      },

      removePremium: () => {
        set({ tier: 'free', plan: null, purchaseDate: null, expiryDate: null });
      },

      incrementQuotesViewed: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.lastQuoteResetDate !== today) {
          set({ dailyQuotesViewed: 1, lastQuoteResetDate: today });
        } else {
          set({ dailyQuotesViewed: state.dailyQuotesViewed + 1 });
        }
      },

      resetDailyQuotes: () => {
        set({ dailyQuotesViewed: 0, lastQuoteResetDate: new Date().toDateString() });
      },

      canViewQuote: () => {
        const state = get();
        if (state.tier === 'premium') return true;
        const today = new Date().toDateString();
        if (state.lastQuoteResetDate !== today) return true;
        return state.dailyQuotesViewed < DAILY_QUOTE_LIMIT_FREE;
      },

      getRemainingQuotes: () => {
        const state = get();
        if (state.tier === 'premium') return 999;
        const today = new Date().toDateString();
        if (state.lastQuoteResetDate !== today) return DAILY_QUOTE_LIMIT_FREE;
        return Math.max(0, DAILY_QUOTE_LIMIT_FREE - state.dailyQuotesViewed);
      },

      isPremium: () => {
        const state = get();
        if (state.tier === 'premium' && state.expiryDate) {
          const now = new Date();
          const expiry = new Date(state.expiryDate);
          if (now > expiry) {
            set({ tier: 'free', plan: null, purchaseDate: null, expiryDate: null });
            return false;
          }
        }
        return state.tier === 'premium';
      },

      // ── Achat via Google Play + RevenueCat ──────────────────────────────────
      purchase: async (plan: PremiumPlan): Promise<boolean> => {
        try {
          await initRC();
          const offeringId = OFFERING_IDS[plan];

          // ✅ FIX: utilise getOfferings() directement et accède à .all via l'objet retourné
          const offeringsResult = await Purchases.getOfferings();
          // L'API Capacitor retourne { offerings: { all: {}, current: ... } }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allOfferings = (offeringsResult as any).offerings?.all ?? (offeringsResult as any).all ?? {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const currentOffering = (offeringsResult as any).offerings?.current ?? (offeringsResult as any).current;

          const offering = allOfferings[offeringId] ?? currentOffering;
          if (!offering) throw new Error(`Offering "${offeringId}" not found`);

          const pkg = offering.availablePackages?.[0];
          if (!pkg) throw new Error('No package in offering');

          const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
          const hasPremium = !!customerInfo.entitlements.active['premium'];

          if (hasPremium) {
            get().setPremium(plan);
          }
          return hasPremium;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('userCancelled') || msg.includes('cancelled')) return false;
          console.error('[RC] Purchase error:', err);
          return false;
        }
      },

      // ── Restaurer les achats ────────────────────────────────────────────────
      restore: async (): Promise<boolean> => {
        try {
          await initRC();
          const { customerInfo } = await Purchases.restorePurchases();
          const hasPremium = !!customerInfo.entitlements.active['premium'];
          if (hasPremium) {
            const productId = customerInfo.entitlements.active['premium']?.productIdentifier ?? '';
            let plan: PremiumPlan = 'monthly';
            if (productId.includes('lifetime')) plan = 'lifetime';
            else if (productId.includes('annuel') || productId.includes('yearly')) plan = 'yearly';
            get().setPremium(plan);
          } else {
            get().removePremium();
          }
          return hasPremium;
        } catch (err) {
          console.error('[RC] Restore error:', err);
          return false;
        }
      },

      // ── Sync au démarrage ───────────────────────────────────────────────────
      syncWithRevenueCat: async (): Promise<void> => {
        try {
          await initRC();
          const { customerInfo } = await Purchases.getCustomerInfo();
          const hasPremium = !!customerInfo.entitlements.active['premium'];

          if (hasPremium && get().tier !== 'premium') {
            const productId = customerInfo.entitlements.active['premium']?.productIdentifier ?? '';
            let plan: PremiumPlan = 'monthly';
            if (productId.includes('lifetime')) plan = 'lifetime';
            else if (productId.includes('annuel') || productId.includes('yearly')) plan = 'yearly';
            get().setPremium(plan);
          } else if (!hasPremium && get().tier === 'premium') {
            get().removePremium();
          }
        } catch {
          // Silencieux sur web preview
        }
      },
    }),
    {
      name: 'premium-storage',
    }
  )
);