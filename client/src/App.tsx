import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { ThemeProvider, useTheme, type ThemeId } from "@/contexts/ThemeContext";
import { Onboarding, type OnboardingData } from "@/components/Onboarding";
import { useOnboarding } from "@/hooks/use-onboarding";
import { usePremium } from "@/hooks/use-premium";
import { notificationService } from "@/services/notification-service";
import { initAdMob, useAdMob } from "@/hooks/use-admob";
import { SwipeRouter } from "@/components/SwipeRouter";
import "@/styles/gradients.css";

// ─── Pub au lancement depuis le widget ───────────────────────────────────────
function WidgetAdHandler() {
  const { showInterstitial } = useAdMob();
  const { isPremium } = usePremium();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromWidget = params.get('from') === 'widget';

    if (fromWidget && !isPremium()) {
      const timer = setTimeout(async () => {
        console.log('[AdMob] Lancement depuis widget → pub');
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

// ─── Contenu principal ────────────────────────────────────────────────────────
function AppContent() {
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { setTheme } = useTheme();
  const { language } = useLanguage();
  const { syncWithRevenueCat, checkAndExpirePremium } = usePremium();

  useEffect(() => { checkAndExpirePremium(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => { syncWithRevenueCat(); }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { initAdMob(); }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasCompletedOnboarding) return;
    const timer = setTimeout(() => {
      const settings = notificationService.getSettings();
      if (settings?.enabled) {
        notificationService.start(language).then(() => {
          console.log('✅ Notifications démarrées');
        });
      }
    }, 1000);
    return () => { clearTimeout(timer); notificationService.stop(); };
  }, [hasCompletedOnboarding, language]);

  const handleOnboardingComplete = (data: OnboardingData) => {
    if (data.theme) setTheme(data.theme as ThemeId);
    completeOnboarding(data);
  };

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <Toaster />
      <WidgetAdHandler />
      {/* ✅ SwipeRouter remplace Switch/Route — toutes les pages swipables */}
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