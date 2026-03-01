import { useRef, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { usePremium } from '@/hooks/use-premium';

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const IS_PRODUCTION = false; // ← false = test IDs | true = vrais IDs

const TEST_IDS = {
  APP_ID:          'ca-app-pub-3940256099942544~3347511713',
  INTERSTITIAL_ID: 'ca-app-pub-3940256099942544/1033173712',
};
const PROD_IDS = {
  APP_ID:          'ca-app-pub-5733508257471048~5974451487',
  INTERSTITIAL_ID: 'ca-app-pub-5733508257471048/5997233290',
};

export const AD_IDS = IS_PRODUCTION ? PROD_IDS : TEST_IDS;

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️ PARAMÈTRES DE MONÉTISATION
// ─────────────────────────────────────────────────────────────────────────────
const QUOTE_AD_INTERVAL = 4;   // pub toutes les 4 citations (inchangé)

// ✅ Nav bar — beaucoup moins invasif qu'avant (était start=2, interval=2)
const NAV_AD_START    = 4;     // première pub au 4ème clic sur CE bouton nav
const NAV_AD_INTERVAL = 5;     // puis toutes les 5 clics sur ce bouton

// ✅ Swipe — pub toutes les 5 navigations swipe/dot
export const SWIPE_AD_INTERVAL = 5;

// ─── Compteurs module-level (survivent aux re-renders) ────────────────────────
const navCountPerPath: Record<string, number> = {};

// ─────────────────────────────────────────────────────────────────────────────
// Types plugin AdMob
// ─────────────────────────────────────────────────────────────────────────────
interface AdMobPlugin {
  initialize(options: { appId: string; initializeForTesting?: boolean }): Promise<void>;
  prepareInterstitial(options: { adId: string; isTesting?: boolean }): Promise<void>;
  showInterstitial(): Promise<void>;
}

declare global {
  interface Window {
    Capacitor?: { Plugins?: { AdMob?: AdMobPlugin } };
  }
}

function getAdMobPlugin(): AdMobPlugin | null {
  try {
    if (!Capacitor.isNativePlatform()) return null;
    return (window.Capacitor?.Plugins?.AdMob as AdMobPlugin) ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Init AdMob (appelé une fois dans App.tsx)
// ─────────────────────────────────────────────────────────────────────────────
export async function initAdMob(): Promise<void> {
  const plugin = getAdMobPlugin();
  if (!plugin) {
    console.log('[AdMob] Non natif — ignoré');
    return;
  }
  try {
    await plugin.initialize({
      appId: AD_IDS.APP_ID,
      initializeForTesting: !IS_PRODUCTION,
    });
    console.log(`[AdMob] Initialisé — mode ${IS_PRODUCTION ? 'PRODUCTION' : 'TEST'}`);
  } catch (e) {
    console.error('[AdMob] Erreur initialize:', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal useAdMob
// ─────────────────────────────────────────────────────────────────────────────
export function useAdMob() {
  const isLoadingRef = useRef(false);
  const isReadyRef   = useRef(false);

  const { isPremium, tier } = usePremium();
  const userIsPremium = isPremium();

  const isPremiumRef = useRef(userIsPremium);
  useEffect(() => {
    isPremiumRef.current = userIsPremium;
  }, [userIsPremium, tier]);

  const preload = useCallback(async () => {
    if (isPremiumRef.current) return;
    const plugin = getAdMobPlugin();
    if (!plugin || isLoadingRef.current) return;

    isLoadingRef.current = true;
    isReadyRef.current   = false;

    try {
      await plugin.prepareInterstitial({
        adId: AD_IDS.INTERSTITIAL_ID,
        isTesting: !IS_PRODUCTION,
      });
      isReadyRef.current = true;
      console.log('[AdMob] Interstitiel préchargé ✓');
    } catch (e) {
      console.error('[AdMob] Erreur preload:', e);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!userIsPremium) {
      preload();
    } else {
      isReadyRef.current = false;
      console.log('[AdMob] Utilisateur Premium — préchargement annulé');
    }
  }, [preload, userIsPremium, tier]);

  const showInterstitial = useCallback(async (): Promise<void> => {
    if (isPremiumRef.current) {
      console.log('[AdMob] Utilisateur Premium — pub ignorée');
      return;
    }
    const plugin = getAdMobPlugin();
    if (!plugin) {
      console.log('[AdMob] Non natif — ignoré');
      return;
    }
    if (!isReadyRef.current) {
      try {
        await plugin.prepareInterstitial({
          adId: AD_IDS.INTERSTITIAL_ID,
          isTesting: !IS_PRODUCTION,
        });
      } catch {
        return;
      }
    }
    try {
      isReadyRef.current = false;
      await plugin.showInterstitial();
      console.log('[AdMob] Interstitiel affiché ✓');
      preload();
    } catch (e) {
      console.error('[AdMob] Erreur show:', e);
      preload();
    }
  }, [preload]);

  return { showInterstitial, preload };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook compteur citations — pub toutes les 4 citations
// ─────────────────────────────────────────────────────────────────────────────
export function useQuoteAdCounter(showInterstitial: () => Promise<void>) {
  const countRef = useRef(0);

  const onNewQuote = useCallback(async () => {
    countRef.current += 1;
    console.log(`[AdMob] Citation #${countRef.current}`);
    if (countRef.current % QUOTE_AD_INTERVAL === 0) {
      console.log('[AdMob] Seuil citations atteint → pub');
      await showInterstitial();
    }
  }, [showInterstitial]);

  return { onNewQuote };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook compteur navigation barre du bas
//
// ✅ Nouveau comportement (start=4, interval=5) :
//   Clic 1,2,3 sur /categories → pas de pub
//   Clic 4       → PUB
//   Clic 5,6,7,8 → pas de pub
//   Clic 9       → PUB
//   (et ainsi de suite, compteur indépendant par bouton)
// ─────────────────────────────────────────────────────────────────────────────
export function useNavAdCounter(showInterstitial: () => Promise<void>) {
  const onNavClick = useCallback(async (path: string) => {
    if (navCountPerPath[path] === undefined) navCountPerPath[path] = 0;
    navCountPerPath[path] += 1;
    const count = navCountPerPath[path];

    console.log(`[AdMob] Nav "${path}" clic #${count}`);
    if (count < NAV_AD_START) return;
    if ((count - NAV_AD_START) % NAV_AD_INTERVAL === 0) {
      console.log(`[AdMob] Seuil nav atteint pour "${path}" → pub`);
      await showInterstitial();
    }
  }, [showInterstitial]);

  return { onNavClick };
}