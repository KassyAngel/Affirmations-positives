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
const QUOTE_AD_INTERVAL = 4;   // pub toutes les 4 citations
const NAV_AD_START      = 4;   // première pub au 4ème clic sur CE bouton nav
const NAV_AD_INTERVAL   = 5;   // puis toutes les 5 clics sur ce bouton
export const SWIPE_AD_INTERVAL = 5; // pub toutes les 5 navigations swipe/dot

// ─── Compteurs module-level (survivent aux re-renders) ────────────────────────
const navCountPerPath: Record<string, number> = {};

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 SINGLETON GLOBAL — une seule instance partagée entre tous les composants
//    Résout le crash OOM causé par 3-4 prepareInterstitial simultanés
// ─────────────────────────────────────────────────────────────────────────────
const globalAdState = {
  isLoading: false,
  isReady:   false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Types plugin AdMob
// ─────────────────────────────────────────────────────────────────────────────
interface AdMobPlugin {
  initialize(options: { appId: string; initializeForTesting?: boolean }): Promise<void>;
  prepareInterstitial(options: { adId: string; isTesting?: boolean }): Promise<void>;
  showInterstitial(): Promise<void>;
  requestConsentInfo(options?: {
    debugGeography?: number;
    testDeviceIdentifiers?: string[];
  }): Promise<{ status: number; isConsentFormAvailable: boolean; canRequestAds: boolean; privacyOptionsRequirementStatus?: string }>;
  showConsentForm(): Promise<{ status: number }>;
}

declare global {
  interface Window {
    Capacitor?: { Plugins?: { AdMob?: AdMobPlugin } };
  }
}

// ─── Statuts UMP ──────────────────────────────────────────────────────────────
const CONSENT_REQUIRED = 1;
const DEBUG_GEOGRAPHY_EEA = 1;

function getAdMobPlugin(): AdMobPlugin | null {
  try {
    if (!Capacitor.isNativePlatform()) return null;
    return (window.Capacitor?.Plugins?.AdMob as AdMobPlugin) ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Consentement UMP RGPD
//    IMPORTANT : showConsentForm() ouvre une WebView native séparée —
//    elle ne crashe PAS le renderer principal. Le crash venait uniquement
//    des prepareInterstitial multiples, pas de l'UMP.
// ─────────────────────────────────────────────────────────────────────────────
async function requestUMPConsent(plugin: AdMobPlugin): Promise<void> {
  try {
    const options = IS_PRODUCTION ? {} : { debugGeography: DEBUG_GEOGRAPHY_EEA };
    const consentInfo = await plugin.requestConsentInfo(options);

    console.log(
      `[UMP] Status: ${consentInfo.status} | Formulaire dispo: ${consentInfo.isConsentFormAvailable}`
    );

    // ✅ Affiche la popup si REQUIRED et formulaire disponible
    if (consentInfo.isConsentFormAvailable && consentInfo.status === CONSENT_REQUIRED) {
      console.log('[UMP] Affichage popup RGPD...');
      const result = await plugin.showConsentForm();
      console.log(`[UMP] Consentement enregistré — status final: ${result.status}`);
    } else {
      console.log('[UMP] Consentement non requis ou déjà obtenu');
    }
  } catch (e) {
    console.warn('[UMP] Erreur (non bloquant):', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Init AdMob + UMP — appelé UNE SEULE FOIS dans App.tsx avec délai 3s
// ─────────────────────────────────────────────────────────────────────────────
export async function initAdMob(): Promise<void> {
  const plugin = getAdMobPlugin();
  if (!plugin) {
    console.log('[AdMob] Non natif — ignoré');
    return;
  }
  try {
    // ÉTAPE 1 : Consentement UMP en premier
    await requestUMPConsent(plugin);

    // ÉTAPE 2 : Initialisation AdMob après le consentement
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
// preloadInterstitial — fonction globale singleton
// Garantit qu'un seul prepareInterstitial tourne à la fois,
// peu importe combien de composants appellent preload()
// ─────────────────────────────────────────────────────────────────────────────
async function preloadInterstitial(): Promise<void> {
  // ✅ Verrou global — si déjà en cours ou déjà prêt, on ne relance pas
  if (globalAdState.isLoading || globalAdState.isReady) return;

  const plugin = getAdMobPlugin();
  if (!plugin) return;

  globalAdState.isLoading = true;
  globalAdState.isReady   = false;

  try {
    await plugin.prepareInterstitial({
      adId: AD_IDS.INTERSTITIAL_ID,
      isTesting: !IS_PRODUCTION,
    });
    globalAdState.isReady = true;
    console.log('[AdMob] Interstitiel préchargé ✓');
  } catch (e) {
    console.error('[AdMob] Erreur preload:', e);
  } finally {
    globalAdState.isLoading = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal useAdMob
// Peut être appelé dans autant de composants que nécessaire —
// le singleton global empêche les appels redondants
// ─────────────────────────────────────────────────────────────────────────────
export function useAdMob() {
  const { isPremium, tier } = usePremium();
  const userIsPremium = isPremium();

  const isPremiumRef = useRef(userIsPremium);
  useEffect(() => {
    isPremiumRef.current = userIsPremium;
  }, [userIsPremium, tier]);

  // ✅ preload utilise maintenant la fonction singleton globale
  const preload = useCallback(async () => {
    if (isPremiumRef.current) return;
    await preloadInterstitial();
  }, []);

  // ✅ Un seul useEffect par composant qui appelle useAdMob —
  //    mais grâce au singleton, seul le PREMIER appel fait vraiment quelque chose
  useEffect(() => {
    if (!userIsPremium) {
      preload();
    } else {
      // Reset l'état global si l'utilisateur devient Premium
      globalAdState.isReady   = false;
      globalAdState.isLoading = false;
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

    // Si pas prêt et pas en cours, on charge d'abord
    if (!globalAdState.isReady && !globalAdState.isLoading) {
      try {
        await plugin.prepareInterstitial({
          adId: AD_IDS.INTERSTITIAL_ID,
          isTesting: !IS_PRODUCTION,
        });
        globalAdState.isReady = true;
      } catch {
        return;
      }
    }

    // Si toujours pas prêt (chargement en cours depuis ailleurs), on abandonne
    if (!globalAdState.isReady) return;

    try {
      globalAdState.isReady = false;
      await plugin.showInterstitial();
      console.log('[AdMob] Interstitiel affiché ✓');
      // Précharge la prochaine pub après un délai pour ne pas surcharger
      setTimeout(() => preloadInterstitial(), 1500);
    } catch (e) {
      console.error('[AdMob] Erreur show:', e);
      setTimeout(() => preloadInterstitial(), 1500);
    }
  }, []);

  return { showInterstitial, preload };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook compteur citations
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