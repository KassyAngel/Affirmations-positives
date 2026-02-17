import { useRef, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 CONFIGURATION — changer IS_PRODUCTION à true avant de publier sur Play Store
// ─────────────────────────────────────────────────────────────────────────────
const IS_PRODUCTION = false; // ← false = test IDs | true = tes vrais IDs

// ── IDs de test Google (fonctionnent sur tout appareil en debug) ──────────────
const TEST_IDS = {
  APP_ID:          'ca-app-pub-3940256099942544~3347511713',
  INTERSTITIAL_ID: 'ca-app-pub-3940256099942544/1033173712',
};

// ── Tes vrais IDs production ──────────────────────────────────────────────────
const PROD_IDS = {
  APP_ID:          'ca-app-pub-5733508257471048~5974451487',
  INTERSTITIAL_ID: 'ca-app-pub-5733508257471048/5997233290',
};

export const AD_IDS = IS_PRODUCTION ? PROD_IDS : TEST_IDS;

// ─────────────────────────────────────────────────────────────────────────────
// Types Capacitor AdMob (plugin community)
// ─────────────────────────────────────────────────────────────────────────────
interface AdMobPlugin {
  initialize(options: { appId: string; initializeForTesting?: boolean }): Promise<void>;
  prepareInterstitial(options: { adId: string; isTesting?: boolean }): Promise<void>;
  showInterstitial(): Promise<void>;
}

declare global {
  interface Window {
    Capacitor?: {
      Plugins?: {
        AdMob?: AdMobPlugin;
      };
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaire : accès sécurisé au plugin
// ─────────────────────────────────────────────────────────────────────────────
function getAdMobPlugin(): AdMobPlugin | null {
  try {
    if (!Capacitor.isNativePlatform()) return null;
    return (window.Capacitor?.Plugins?.AdMob as AdMobPlugin) ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Initialise AdMob au démarrage de l'app (à appeler une seule fois dans App.tsx)
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
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────
export function useAdMob() {
  const isLoadingRef = useRef(false);
  const isReadyRef   = useRef(false);

  // ── Précharge une pub dès le montage du composant ────────────────────────
  const preload = useCallback(async () => {
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
    preload();
  }, [preload]);

  // ── Affiche la pub, puis précharge la suivante ────────────────────────────
  const showInterstitial = useCallback(async (): Promise<void> => {
    const plugin = getAdMobPlugin();
    if (!plugin) {
      console.log('[AdMob] showInterstitial — non natif, ignoré');
      return;
    }
    if (!isReadyRef.current) {
      console.log('[AdMob] Pas encore prête, tentative directe...');
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
      // Précharge la prochaine pub immédiatement après
      preload();
    } catch (e) {
      console.error('[AdMob] Erreur show:', e);
      preload();
    }
  }, [preload]);

  return { showInterstitial, preload };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook compteur de citations (pub toutes les N nouvelles citations)
// ─────────────────────────────────────────────────────────────────────────────
const QUOTE_AD_INTERVAL = 3; // pub toutes les 3 citations

export function useQuoteAdCounter(showInterstitial: () => Promise<void>) {
  const countRef = useRef(0);

  const onNewQuote = useCallback(async () => {
    countRef.current += 1;
    console.log(`[AdMob] Citation #${countRef.current}`);
    if (countRef.current % QUOTE_AD_INTERVAL === 0) {
      console.log('[AdMob] Seuil atteint → pub');
      await showInterstitial();
    }
  }, [showInterstitial]);

  return { onNewQuote };
}