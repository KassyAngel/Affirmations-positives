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
const QUOTE_AD_INTERVAL    = 4;  // pub toutes les 4 citations
const NAV_AD_START         = 4;  // première pub au 4ème clic nav
const NAV_AD_INTERVAL      = 5;  // puis toutes les 5 clics nav
export const SWIPE_AD_INTERVAL = 5; // pub toutes les 5 swipes

// ─── Compteurs module-level ───────────────────────────────────────────────────
const navCountPerPath: Record<string, number> = {};

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 SINGLETON GLOBAL
// Résout le crash OOM causé par 3-4 prepareInterstitial simultanés
// ─────────────────────────────────────────────────────────────────────────────
const globalAdState = {
  isLoading: false,
  isReady:   false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Types plugin AdMob v7
// ─────────────────────────────────────────────────────────────────────────────
interface AdMobPlugin {
  initialize(options: { appId: string; initializeForTesting?: boolean }): Promise<void>;
  prepareInterstitial(options: { adId: string; isTesting?: boolean }): Promise<void>;
  showInterstitial(): Promise<void>;
  requestConsentInfo(options?: {
    debugGeography?: number;
    testDeviceIdentifiers?: string[];
  }): Promise<{
    status: number | string;   // ✅ v7 retourne string "REQUIRED" pas number 1
    isConsentFormAvailable: boolean;
    canRequestAds: boolean;
  }>;
  showConsentForm(): Promise<{ status: number | string }>;
}

declare global {
  interface Window {
    Capacitor?: { Plugins?: { AdMob?: AdMobPlugin } };
  }
}

// ─── Debug geography ──────────────────────────────────────────────────────────
// 0 = DISABLED, 1 = EEA (force popup en test), 2 = NOT_EEA
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
// ✅ Consentement UMP RGPD — compatible admob v7
//
// BUG CORRIGÉ : @capacitor-community/admob v7 retourne le statut sous forme
// de STRING ("REQUIRED", "NOT_REQUIRED", "OBTAINED") et non un number (1,2,3)
// comme dans les versions précédentes.
// La condition `status === 1` ne matchait donc jamais → popup jamais affichée.
// ─────────────────────────────────────────────────────────────────────────────
async function requestUMPConsent(plugin: AdMobPlugin): Promise<void> {
  try {
    const options = IS_PRODUCTION ? {} : { debugGeography: DEBUG_GEOGRAPHY_EEA };
    const consentInfo = await plugin.requestConsentInfo(options);

    console.log(
      `[UMP] Status: ${consentInfo.status} | Formulaire dispo: ${consentInfo.isConsentFormAvailable} | canRequestAds: ${consentInfo.canRequestAds}`
    );

    // ✅ FIX v7 : accepte "REQUIRED" (string) ET 1 (number) pour compatibilité
    const isRequired =
      consentInfo.status === 'REQUIRED' ||  // v7 string
      consentInfo.status === 1;             // anciennes versions number

    if (consentInfo.isConsentFormAvailable && isRequired) {
      console.log('[UMP] Affichage popup RGPD...');
      const result = await plugin.showConsentForm();
      console.log(`[UMP] Consentement enregistré — status: ${result.status}`);
    } else {
      console.log('[UMP] Consentement non requis ou déjà obtenu');
    }
  } catch (e) {
    // Ne jamais bloquer l'init AdMob si l'UMP échoue
    console.warn('[UMP] Erreur (non bloquant):', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Init AdMob + UMP — appelé UNE SEULE FOIS dans App.tsx avec délai 8s
// ─────────────────────────────────────────────────────────────────────────────
export async function initAdMob(): Promise<void> {
  const plugin = getAdMobPlugin();
  if (!plugin) {
    console.log('[AdMob] Non natif — ignoré');
    return;
  }
  try {
    // ÉTAPE 1 : Consentement UMP (obligatoire avant initialize)
    await requestUMPConsent(plugin);

    // ÉTAPE 2 : Initialisation AdMob
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
// preloadInterstitial — singleton global
// Garantit qu'un seul prepareInterstitial tourne à la fois
// ─────────────────────────────────────────────────────────────────────────────
async function preloadInterstitial(): Promise<void> {
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
// Peut être utilisé dans autant de composants que nécessaire —
// le singleton global empêche tous les appels redondants
// ─────────────────────────────────────────────────────────────────────────────
export function useAdMob() {
  const { isPremium, tier } = usePremium();
  const userIsPremium = isPremium();

  const isPremiumRef = useRef(userIsPremium);
  useEffect(() => {
    isPremiumRef.current = userIsPremium;
  }, [userIsPremium, tier]);

  const preload = useCallback(async () => {
    if (isPremiumRef.current) return;
    await preloadInterstitial();
  }, []);

  // ✅ Délai 5s — laisse l'app et la WebView se stabiliser avant de charger la pub
  useEffect(() => {
    if (!userIsPremium) {
      const t = setTimeout(() => preload(), 5000);
      return () => clearTimeout(t);
    } else {
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

    // Si pas prêt et pas en cours de chargement, on charge
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

    // Si chargement en cours depuis ailleurs, on abandonne plutôt que d'attendre
    if (!globalAdState.isReady) return;

    try {
      globalAdState.isReady = false;
      await plugin.showInterstitial();
      console.log('[AdMob] Interstitiel affiché ✓');
      // Précharge la suivante avec délai pour ne pas surcharger la mémoire
      setTimeout(() => preloadInterstitial(), 4000);
    } catch (e) {
      console.error('[AdMob] Erreur show:', e);
      setTimeout(() => preloadInterstitial(), 4000);
    }
  }, []);

  return { showInterstitial, preload };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook compteur citations — pub toutes les N citations
// ─────────────────────────────────────────────────────────────────────────────
export function useQuoteAdCounter(showInterstitial: () => Promise<void>) {
  const countRef = useRef(0);

  const onNewQuote = useCallback(async () => {
    countRef.current += 1;
    if (countRef.current % QUOTE_AD_INTERVAL === 0) {
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

    if (count < NAV_AD_START) return;
    if ((count - NAV_AD_START) % NAV_AD_INTERVAL === 0) {
      await showInterstitial();
    }
  }, [showInterstitial]);

  return { onNavClick };
}