import { lazy, Suspense, useEffect } from "react";
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
import "@/styles/gradients.css";

// Onboarding en lazy — ne charge que si besoin
const Onboarding = lazy(() =>
  import("@/components/Onboarding").then(m => ({ default: m.Onboarding }))
);

function AppSkeleton() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #FFF5F0 0%, #FFE8DC 45%, #FFF8F5 100%)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-orange-200 border-t-orange-400 animate-spin" />
        <p className="text-sm font-light" style={{ color: '#B07060' }}>Affirmations Positives</p>
      </div>
    </div>
  );
}

function WidgetAdHandler() {
  const { showInterstitial } = useAdMob();
  const { isPremium } = usePremium();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromWidget = params.get('from') === 'widget';
    if (fromWidget && !isPremium()) {
      const timer = setTimeout(async () => {
        await showInterstitial();
        const url = new URL(window.location.href);
        url.searchParams.delete('from');
        window.history.replaceState({}, '', url.toString());
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);
  return null;
}

function AppContent() {
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { setTheme } = useTheme();
  const { language } = useLanguage();
  const { syncWithRevenueCat, checkAndExpirePremium } = usePremium();

  useEffect(() => { checkAndExpirePremium(); }, []);

  useEffect(() => {
    // Délai 2s — laisse l'UI s'afficher en premier
    const t = setTimeout(() => { syncWithRevenueCat(); }, 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // AdMob délai 3s — après que tout le reste soit prêt
    const t = setTimeout(() => { initAdMob(); }, 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hasCompletedOnboarding) return;
    const t = setTimeout(() => {
      const settings = notificationService.getSettings();
      if (settings?.enabled) {
        notificationService.start(language).then(() => {
          console.log('Notifications démarrées');
        });
      }
    }, 1500);
    return () => { clearTimeout(t); notificationService.stop(); };
  }, [hasCompletedOnboarding, language]);

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