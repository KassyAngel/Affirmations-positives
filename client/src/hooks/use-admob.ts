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
const QUOTE_AD_INTERVAL = 4;  // pub toutes les 4 citations
const NAV_AD_START      = 2;  // première pub au 2ème clic nav
const NAV_AD_INTERVAL   = 2;  // puis toutes les 2 clics nav

// ✅ Compteur NAV GLOBAL — survit aux changements de page (Categories, Stats, etc.)
// Si on le met dans un hook, il se reset à chaque montage de composant
let globalNavCount = 0;

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
// Hook compteur navigation — pub à partir du 2ème clic, puis toutes les 2
// ✅ Utilise globalNavCount pour survivre aux changements de page
// ─────────────────────────────────────────────────────────────────────────────
export function useNavAdCounter(showInterstitial: () => Promise<void>) {
  const onNavClick = useCallback(async () => {
    globalNavCount += 1;
    console.log(`[AdMob] Nav clic #${globalNavCount}`);

    if (globalNavCount < NAV_AD_START) return;

    if ((globalNavCount - NAV_AD_START) % NAV_AD_INTERVAL === 0) {
      console.log('[AdMob] Seuil nav atteint → pub');
      await showInterstitial();
    }
  }, [showInterstitial]);

  return { onNavClick };
}