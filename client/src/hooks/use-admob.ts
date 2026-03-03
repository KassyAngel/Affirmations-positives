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

const NAV_AD_START    = 4;     // première pub au 4ème clic sur CE bouton nav
const NAV_AD_INTERVAL = 5;     // puis toutes les 5 clics sur ce bouton

export const SWIPE_AD_INTERVAL = 5; // pub toutes les 5 navigations swipe/dot

// ─── Compteurs module-level (survivent aux re-renders) ────────────────────────
const navCountPerPath: Record<string, number> = {};

// ─────────────────────────────────────────────────────────────────────────────
// Types plugin AdMob
// ─────────────────────────────────────────────────────────────────────────────
interface AdMobPlugin {
  initialize(options: { appId: string; initializeForTesting?: boolean }): Promise<void>;
  prepareInterstitial(options: { adId: string; isTesting?: boolean }): Promise<void>;
  showInterstitial(): Promise<void>;
  // ✅ Méthodes UMP (User Messaging Platform) — RGPD
  requestConsentInfo(options?: {
    debugGeography?: number;
    testDeviceIdentifiers?: string[];
  }): Promise<{ status: number; isConsentFormAvailable: boolean }>;
  showConsentForm(): Promise<{ status: number }>;
}

declare global {
  interface Window {
    Capacitor?: { Plugins?: { AdMob?: AdMobPlugin } };
  }
}

// ─── Statuts UMP ──────────────────────────────────────────────────────────────
// 1 = REQUIRED (popup à afficher), 2 = NOT_REQUIRED, 3 = OBTAINED
const CONSENT_REQUIRED = 1;

// ─── Debug geography ──────────────────────────────────────────────────────────
// 0 = DISABLED, 1 = EEA (force la popup en test), 2 = NOT_EEA
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
// Appelée AVANT initialize() — obligatoire pour afficher la popup Europe
// ─────────────────────────────────────────────────────────────────────────────
async function requestUMPConsent(plugin: AdMobPlugin): Promise<void> {
  try {
    // En mode test : debugGeography=1 force la simulation EEA → popup visible
    // En production : on ne passe aucune option → comportement réel par région
    const options = IS_PRODUCTION ? {} : { debugGeography: DEBUG_GEOGRAPHY_EEA };

    const consentInfo = await plugin.requestConsentInfo(options);

    console.log(
      `[UMP] Status: ${consentInfo.status} | Formulaire dispo: ${consentInfo.isConsentFormAvailable}`
    );

    if (consentInfo.isConsentFormAvailable && consentInfo.status === CONSENT_REQUIRED) {
      console.log('[UMP] Affichage popup RGPD...');
      const result = await plugin.showConsentForm();
      console.log(`[UMP] Consentement enregistré — status final: ${result.status}`);
    } else {
      console.log('[UMP] Consentement non requis ou déjà obtenu');
    }
  } catch (e) {
    // Ne jamais bloquer l'init AdMob si l'UMP échoue
    console.warn('[UMP] Erreur (non bloquant):', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Init AdMob + UMP (appelé une fois dans App.tsx)
// ─────────────────────────────────────────────────────────────────────────────
export async function initAdMob(): Promise<void> {
  const plugin = getAdMobPlugin();
  if (!plugin) {
    console.log('[AdMob] Non natif — ignoré');
    return;
  }
  try {
    // ✅ ÉTAPE 1 : Consentement UMP en premier (obligatoire avant initialize)
    await requestUMPConsent(plugin);

    // ✅ ÉTAPE 2 : Initialisation AdMob après le consentement
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
// ✅ Comportement (start=4, interval=5) :
//   Clic 1,2,3 sur /categories → pas de pub
//   Clic 4       → PUB
//   Clic 5,6,7,8 → pas de pub
//   Clic 9       → PUB
//   (compteur indépendant par bouton)
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