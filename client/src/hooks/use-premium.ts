import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Capacitor } from '@capacitor/core';

export type PremiumTier = 'free' | 'premium';
export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime';

// ─── Détection plateforme ─────────────────────────────────────────────────────
const isNative = Capacitor.isNativePlatform();
const isWeb    = !isNative;

// ─── Clés RevenueCat ──────────────────────────────────────────────────────────
const RC_GOOGLE_KEY = 'goog_ptfKFejVcGBkPUpbPKAlXhqrPnu';

const OFFERING_IDS: Record<PremiumPlan, string> = {
  monthly:  'default',
  yearly:   'annuel',
  lifetime: 'lifetime',
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 ID unique par installation
// ─────────────────────────────────────────────────────────────────────────────
// Cet ID est persisté dans localStorage. Il identifie l'installation auprès
// de RevenueCat, ce qui permet de retrouver les achats au redémarrage ou
// après réinstallation (via syncWithRevenueCat au démarrage).
//
// ⚠️  LIMITE : si l'utilisateur change de téléphone, cet ID change.
//     Dans ce cas, "Restaurer mes achats" est la solution — RevenueCat
//     retrouve l'achat via le compte Google Play.
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

    // ✅ Passe l'ID d'installation → RevenueCat peut retrouver les achats
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

// ─── Types ────────────────────────────────────────────────────────────────────
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

      // ── Actions locales ─────────────────────────────────────────────────────
      setPremium: (plan: PremiumPlan) => {
        const now = new Date();
        let expiryDate: Date | null = null;
        if (plan === 'monthly') {
          expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        } else if (plan === 'yearly') {
          expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        }
        // lifetime → expiryDate null = pas d'expiration
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

      // ✅ Vérification expiration — appelée au démarrage dans App.tsx
      // Séparée de isPremium() pour éviter set() dans un getter
      checkAndExpirePremium: () => {
        const state = get();
        if (state.tier !== 'premium') return;
        if (!state.expiryDate) return; // lifetime
        const now    = new Date();
        const expiry = new Date(state.expiryDate);
        if (now > expiry) {
          console.log('[Premium] Abonnement expiré localement — passage en free');
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

      // ✅ Pure lecture — aucun set() ici
      isPremium: () => {
        const state = get();
        if (state.tier !== 'premium') return false;
        if (!state.expiryDate) return true; // lifetime → jamais d'expiration
        const now    = new Date();
        const expiry = new Date(state.expiryDate);
        return now <= expiry;
      },

      // ── Achat ───────────────────────────────────────────────────────────────
      purchase: async (plan: PremiumPlan): Promise<boolean> => {
        if (isWeb) {
          console.log('[Premium] Web mode — achat simulé:', plan);
          get().setPremium(plan);
          return true;
        }

        try {
          await initRC();
          const { Purchases } = await import('@revenuecat/purchases-capacitor');
          const offeringId = OFFERING_IDS[plan];
          const offeringsResult = await Purchases.getOfferings();
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
          if (hasPremium) get().setPremium(plan);
          return hasPremium;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('userCancelled') || msg.includes('cancelled')) return false;
          console.error('[RC] Purchase error:', err);
          return false;
        }
      },

      // ── Restaurer les achats ─────────────────────────────────────────────────
      // Utilisé quand l'user change de téléphone ou réinstalle.
      // RevenueCat interroge Google Play via le compte Google connecté
      // → retrouve tous les achats liés à ce compte.
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
            let plan: PremiumPlan = 'monthly';
            if (productId.includes('lifetime')) plan = 'lifetime';
            else if (productId.includes('annuel') || productId.includes('yearly')) plan = 'yearly';
            get().setPremium(plan);
            console.log('[RC] Achat restauré — plan:', plan);
          } else {
            get().removePremium();
          }
          return hasPremium;
        } catch (err) {
          console.error('[RC] Restore error:', err);
          return false;
        }
      },

      // ── Sync au démarrage ────────────────────────────────────────────────────
      // ✅ Vérifie côté RevenueCat si l'utilisateur est premium à chaque démarrage.
      // Cas couverts :
      //   - Utilisateur réinstalle l'app → premium restauré automatiquement
      //   - Abonnement annuel/mensuel expiré côté Google Play → repassé en free
      //   - Utilisateur vient d'acheter depuis un autre appareil (même compte) → sync
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
            else if (productId.includes('annuel') || productId.includes('yearly')) plan = 'yearly';
            get().setPremium(plan);
            console.log('[RC] Premium restauré automatiquement — plan:', plan);
          } else if (!hasPremium && get().tier === 'premium') {
            get().removePremium();
            console.log('[RC] Abonnement expiré côté Google Play — free');
          }
        } catch {
          // Silencieux — pas de réseau, on garde l'état local en cache
        }
      },
    }),
    {
      name: 'premium-storage',
    }
  )
);