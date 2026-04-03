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

// Citations : pub toutes les N citations
const QUOTE_AD_INTERVAL = 5;

// Navigation unifiée (swipe + barre) : pub toutes les N navigations
// Premier déclenchement au Nème, puis tous les N suivants
const NAV_AD_INTERVAL = 5;

// Export pour SwipeRouter (utilisé pour passer SWIPE_AD_INTERVAL — on garde
// le même nom pour ne pas casser l'import existant, mais la valeur est ignorée
// au profit du compteur unifié)
export const SWIPE_AD_INTERVAL = NAV_AD_INTERVAL;

// Cooldown minimum GLOBAL entre deux pubs — 2 minutes
const MIN_DELAY_BETWEEN_ADS_MS = 2 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 SINGLETON GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
const globalAdState = {
  isLoading:   false,
  isReady:     false,
  lastShownAt: 0,
};

// ✅ Compteur de navigation UNIQUE partagé entre swipe et barre du bas
// Un seul module-level → une seule source de vérité
let globalNavCount = 0;

function canShowAd(): boolean {
  return Date.now() - globalAdState.lastShownAt >= MIN_DELAY_BETWEEN_ADS_MS;
}

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
    status: number | string;
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
// Consentement UMP RGPD
// ─────────────────────────────────────────────────────────────────────────────
async function requestUMPConsent(plugin: AdMobPlugin): Promise<void> {
  try {
    const options = IS_PRODUCTION ? {} : { debugGeography: DEBUG_GEOGRAPHY_EEA };
    const consentInfo = await plugin.requestConsentInfo(options);

    console.log(
      `[UMP] Status: ${consentInfo.status} | Formulaire dispo: ${consentInfo.isConsentFormAvailable} | canRequestAds: ${consentInfo.canRequestAds}`
    );

    const isRequired =
      consentInfo.status === 'REQUIRED' ||
      consentInfo.status === 1;

    if (consentInfo.isConsentFormAvailable && isRequired) {
      console.log('[UMP] Affichage popup RGPD...');
      const result = await plugin.showConsentForm();
      console.log(`[UMP] Consentement enregistré — status: ${result.status}`);
    } else {
      console.log('[UMP] Consentement non requis ou déjà obtenu');
    }
  } catch (e) {
    console.warn('[UMP] Erreur (non bloquant):', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Init AdMob + UMP
// ─────────────────────────────────────────────────────────────────────────────
export async function initAdMob(): Promise<void> {
  const plugin = getAdMobPlugin();
  if (!plugin) {
    console.log('[AdMob] Non natif — ignoré');
    return;
  }
  try {
    await requestUMPConsent(plugin);
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

    if (!canShowAd()) {
      const remaining = Math.ceil(
        (MIN_DELAY_BETWEEN_ADS_MS - (Date.now() - globalAdState.lastShownAt)) / 1000
      );
      console.log(`[AdMob] Cooldown actif — prochaine pub dans ${remaining}s`);
      return;
    }

    const plugin = getAdMobPlugin();
    if (!plugin) {
      console.log('[AdMob] Non natif — ignoré');
      return;
    }

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

    if (!globalAdState.isReady) return;

    try {
      globalAdState.isReady     = false;
      globalAdState.lastShownAt = Date.now();
      await plugin.showInterstitial();
      console.log('[AdMob] Interstitiel affiché ✓');
      setTimeout(() => preloadInterstitial(), 4000);
    } catch (e) {
      console.error('[AdMob] Erreur show:', e);
      setTimeout(() => preloadInterstitial(), 4000);
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
    if (countRef.current % QUOTE_AD_INTERVAL === 0) {
      console.log(`[AdMob] Citation #${countRef.current} → pub citations`);
      await showInterstitial();
    }
  }, [showInterstitial]);

  return { onNewQuote };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook compteur navigation UNIFIÉ — swipe + barre du bas = même compteur
//
// Usage :
//   • SwipeRouter  → const { onNavClick } = useNavAdCounter(showInterstitial)
//                    await onNavClick()  (sans argument)
//   • Navigation   → const { onNavClick } = useNavAdCounter(showInterstitial)
//                    await onNavClick()  (sans argument)
//
// Les deux hooks partagent globalNavCount (module-level) →
// 4 swipes + 4 clics barre = 8 navigations = 1 pub. Pas de doublons.
// ─────────────────────────────────────────────────────────────────────────────
export function useNavAdCounter(showInterstitial: () => Promise<void>) {
  const onNavClick = useCallback(async (_path?: string) => {
    globalNavCount += 1;
    console.log(`[AdMob] Navigation #${globalNavCount} (seuil: ${NAV_AD_INTERVAL})`);

    if (globalNavCount % NAV_AD_INTERVAL === 0) {
      console.log(`[AdMob] Navigation #${globalNavCount} → pub navigation`);
      await showInterstitial();
    }
  }, [showInterstitial]);

  return { onNavClick };
}