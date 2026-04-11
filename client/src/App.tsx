import { lazy, Suspense, useEffect, useCallback } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { ThemeProvider, useTheme, type ThemeId } from "@/contexts/ThemeContext";
import { useOnboarding } from "@/hooks/use-onboarding";
import { usePremium } from "@/hooks/use-premium";
import { notificationService } from "@/services/notification-service";
import { initAdMob, useAdMob } from "@/hooks/use-admob";
import { SwipeRouter } from "@/components/SwipeRouter";
import { App as CapApp } from "@capacitor/app";
import { checkOpenedFromWidget } from "@/hooks/use-widget-open";
import "@/styles/gradients.css";

// Onboarding en lazy — ne charge que si besoin
const Onboarding = lazy(() =>
  import("@/components/Onboarding").then(m => ({ default: m.Onboarding }))
);

// ─────────────────────────────────────────────────────────────────────────────

function AppSkeleton() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #FFF5F0 0%, #FFE8DC 45%, #FFF8F5 100%)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-orange-200 border-t-orange-400 animate-spin" />
        <p className="text-sm font-light" style={{ color: '#B07060' }}>
          Affirmations Positives
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function WidgetAdHandler() {
  const { showInterstitial } = useAdMob();
  const { isPremium } = usePremium();

  const triggerWidgetAd = useCallback(async () => {
    if (isPremium()) return;
    // Délai 2.5s — laisse l'app s'afficher avant la pub
    await new Promise(r => setTimeout(r, 2500));
    await showInterstitial();
  }, [showInterstitial, isPremium]);

  useEffect(() => {
    // ✅ Au montage : interroge le plugin natif (flag Java déjà stocké)
    checkOpenedFromWidget().then((fromWidget) => {
      if (fromWidget) triggerWidgetAd();
    });

    // ✅ Quand l'app revient au premier plan (widget cliqué, app déjà ouverte)
    const listenerPromise = CapApp.addListener(
      "appStateChange",
      ({ isActive }: { isActive: boolean }) => {
        if (isActive) {
          checkOpenedFromWidget().then((fromWidget) => {
            if (fromWidget) triggerWidgetAd();
          });
        }
      },
    );

    return () => {
      listenerPromise.then((l: { remove: () => void }) => l.remove());
    };
  }, [triggerWidgetAd]);

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

function AppContent() {
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { setTheme } = useTheme();
  const { language } = useLanguage();
  const { syncWithRevenueCat, checkAndExpirePremium } = usePremium();

  // ── Premium ────────────────────────────────────────────────────────────────
  useEffect(() => {
    checkAndExpirePremium();
  }, []);

  useEffect(() => {
    // Délai 2s — laisse l'UI s'afficher en premier
    const t = setTimeout(() => { syncWithRevenueCat(); }, 2000);
    return () => clearTimeout(t);
  }, []);

  // ── AdMob ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Délai 3s — après que tout le reste soit prêt
    const t = setTimeout(() => { initAdMob(); }, 3000);
    return () => clearTimeout(t);
  }, []);

  // ── Notifications ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasCompletedOnboarding) return;

    // Délai 1.5s — laisse l'UI s'afficher avant de planifier
    const t = setTimeout(() => {
      const settings = notificationService.getSettings();
      if (settings?.enabled) {
        notificationService.start(language as 'fr' | 'en');
      }
    }, 1500);

    return () => clearTimeout(t);
  }, [hasCompletedOnboarding, language]);

  // ✅ Re-planifie quand l'app revient au premier plan
  // Cela garantit que les 7 jours se renouvellent automatiquement
  // sans action de l'utilisateur (le guard dans notification-service
  // évite une re-planification inutile si les notifs sont encore fraîches)
  useEffect(() => {
    if (!hasCompletedOnboarding) return;

    let subscription: { remove: () => void } | null = null;

    CapApp.addListener("appStateChange", ({ isActive }: { isActive: boolean }) => {
      if (isActive) {
        const settings = notificationService.getSettings();
        if (settings?.enabled) {
          notificationService.start(language as 'fr' | 'en');
        }
      }
    }).then(s => { subscription = s; });

    return () => {
      subscription?.remove();
    };
  }, [hasCompletedOnboarding, language]);

  // ── Onboarding ─────────────────────────────────────────────────────────────
  const handleOnboardingComplete = (data: any) => {
    if (data.theme) setTheme(data.theme as ThemeId);
    completeOnboarding(data);
  };

  if (!hasCompletedOnboarding) {
    return (
      <Suspense fallback={<AppSkeleton />}>
        <Onboarding onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  return (
    <>
      <Toaster />
      <WidgetAdHandler />
      <SwipeRouter />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;