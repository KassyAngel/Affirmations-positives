import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Capacitor } from '@capacitor/core';

export type PremiumTier = 'free' | 'premium';
export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime';

const isNative = Capacitor.isNativePlatform();
const isWeb    = !isNative;

const RC_GOOGLE_KEY = 'goog_ptfKFejVcGBkPUpbPKAlXhqrPnu';

// ✅ FIX CRITIQUE : chaque plan a sa propre offering dans RevenueCat
// monthly  → offering 'default'   (package $rc_monthly)
// yearly   → offering 'annuel'    (package $rc_annual)
// lifetime → offering 'lifetime'  (package $rc_lifetime)
const OFFERING_IDS: Record<PremiumPlan, string> = {
  monthly:  'default',
  yearly:   'annuel',
  lifetime: 'lifetime',
};

// ─────────────────────────────────────────────────────────────────────────────
// ID unique par installation — permet à RevenueCat de retrouver les achats
// ─────────────────────────────────────────────────────────────────────────────
function getOrCreateInstallationId(): string {
  const KEY = 'app_installation_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = 'usr_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, id);
    console.log('[Premium] Nouvel ID installation généré:', id);
  }
  return id;
}

// ─── Init RevenueCat ──────────────────────────────────────────────────────────
let rcInitialized = false;
async function initRC() {
  if (!isNative) return;
  if (rcInitialized) return;
  try {
    const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    const installationId = getOrCreateInstallationId();
    await Purchases.configure({
      apiKey: RC_GOOGLE_KEY,
      appUserID: installationId,
    });
    rcInitialized = true;
    console.log('[RC] Configuré avec ID:', installationId);
  } catch (e) {
    console.warn('[RC] Init failed:', e);
  }
}

interface PremiumState {
  tier: PremiumTier;
  plan: PremiumPlan | null;
  purchaseDate: string | null;
  expiryDate: string | null;
  dailyQuotesViewed: number;
  lastQuoteResetDate: string;
  setPremium: (plan: PremiumPlan) => void;
  removePremium: () => void;
  incrementQuotesViewed: () => void;
  resetDailyQuotes: () => void;
  canViewQuote: () => boolean;
  getRemainingQuotes: () => number;
  isPremium: () => boolean;
  checkAndExpirePremium: () => void;
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

      checkAndExpirePremium: () => {
        const state = get();
        if (state.tier !== 'premium') return;
        if (!state.expiryDate) return;
        if (new Date() > new Date(state.expiryDate)) {
          console.log('[Premium] Abonnement expiré — passage en free');
          set({ tier: 'free', plan: null, purchaseDate: null, expiryDate: null });
        }
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
        if (state.tier !== 'premium') return false;
        if (!state.expiryDate) return true; // lifetime
        return new Date() <= new Date(state.expiryDate);
      },

      // ✅ FIX CRITIQUE : purchase récupère l'offering correcte selon le plan
      // puis prend le PREMIER package disponible dans cette offering
      // (chaque offering n'a qu'un seul package dans cette config)
      purchase: async (plan: PremiumPlan): Promise<boolean> => {
        if (isWeb) {
          console.log('[Premium] Web mode — achat simulé:', plan);
          get().setPremium(plan);
          return true;
        }

        try {
          await initRC();
          const { Purchases } = await import('@revenuecat/purchases-capacitor');

          console.log(`[RC] Achat plan "${plan}" — offering "${OFFERING_IDS[plan]}"`);

          // ✅ Récupère TOUTES les offerings
          const offeringsResult = await Purchases.getOfferings();
          console.log('[RC] Offerings reçues:', JSON.stringify(offeringsResult));

          // ✅ Accès robuste aux offerings (compatibilité SDK v12)
          const allOfferings =
            (offeringsResult as any).offerings?.all ??
            (offeringsResult as any).all ??
            {};

          const currentOffering =
            (offeringsResult as any).offerings?.current ??
            (offeringsResult as any).current ??
            null;

          // ✅ Cherche l'offering du plan, fallback sur current
          const targetOfferingId = OFFERING_IDS[plan];
          const offering =
            allOfferings[targetOfferingId] ??
            (targetOfferingId === 'default' ? currentOffering : null);

          if (!offering) {
            console.error(`[RC] Offering "${targetOfferingId}" introuvable. Offerings disponibles:`, Object.keys(allOfferings));
            throw new Error(`Offering "${targetOfferingId}" non trouvée — vérifie RevenueCat dashboard`);
          }

          const packages = offering.availablePackages ?? [];
          console.log(`[RC] Packages dans "${targetOfferingId}":`, packages.map((p: any) => p.identifier));

          if (packages.length === 0) {
            throw new Error(`Aucun package dans l'offering "${targetOfferingId}" — attache un produit Google Play dans RevenueCat`);
          }

          // ✅ Prend le premier (et unique) package de l'offering
          const pkg = packages[0];
          console.log(`[RC] Achat du package:`, pkg.identifier, pkg.product?.title);

          const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
          const hasPremium = !!customerInfo.entitlements.active['premium'];

          if (hasPremium) {
            get().setPremium(plan);
            console.log(`[RC] ✅ Achat réussi — plan: ${plan}`);
          } else {
            console.warn('[RC] Achat effectué mais entitlement "premium" non actif');
          }

          return hasPremium;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          // Annulation volontaire — pas d'erreur à afficher
          if (msg.includes('userCancelled') || msg.includes('cancelled') || msg.includes('1')) {
            console.log('[RC] Achat annulé par l\'utilisateur');
            return false;
          }
          console.error('[RC] Erreur achat:', err);
          throw err; // ✅ On remonte l'erreur pour l'afficher dans PremiumPaywall
        }
      },

      // ── Restaurer les achats ──────────────────────────────────────────────────
      restore: async (): Promise<boolean> => {
        if (isWeb) {
          console.log('[Premium] Web mode — restore depuis état local');
          return get().isPremium();
        }

        try {
          await initRC();
          const { Purchases } = await import('@revenuecat/purchases-capacitor');
          const { customerInfo } = await Purchases.restorePurchases();
          const hasPremium = !!customerInfo.entitlements.active['premium'];

          if (hasPremium) {
            const productId = customerInfo.entitlements.active['premium']?.productIdentifier ?? '';
            // ✅ Détection du plan depuis le productIdentifier Google Play
            let plan: PremiumPlan = 'monthly';
            if (productId.includes('lifetime')) plan = 'lifetime';
            else if (productId.includes('yearly') || productId.includes('annuel') || productId.includes('annual')) plan = 'yearly';
            get().setPremium(plan);
            console.log('[RC] ✅ Achat restauré — plan:', plan, '| produit:', productId);
          } else {
            get().removePremium();
            console.log('[RC] Aucun achat actif trouvé');
          }
          return hasPremium;
        } catch (err) {
          console.error('[RC] Erreur restore:', err);
          return false;
        }
      },

      // ── Sync au démarrage ─────────────────────────────────────────────────────
      syncWithRevenueCat: async (): Promise<void> => {
        if (isWeb) return;

        try {
          await initRC();
          const { Purchases } = await import('@revenuecat/purchases-capacitor');
          const { customerInfo } = await Purchases.getCustomerInfo();
          const hasPremium = !!customerInfo.entitlements.active['premium'];

          if (hasPremium && get().tier !== 'premium') {
            const productId = customerInfo.entitlements.active['premium']?.productIdentifier ?? '';
            let plan: PremiumPlan = 'monthly';
            if (productId.includes('lifetime')) plan = 'lifetime';
            else if (productId.includes('yearly') || productId.includes('annuel') || productId.includes('annual')) plan = 'yearly';
            get().setPremium(plan);
            console.log('[RC] Premium restauré automatiquement — plan:', plan);
          } else if (!hasPremium && get().tier === 'premium') {
            get().removePremium();
            console.log('[RC] Abonnement expiré côté Google Play — free');
          }
        } catch {
          // Silencieux — pas de réseau, on garde l'état local
        }
      },
    }),
    {
      name: 'premium-storage',
    }
  )
);