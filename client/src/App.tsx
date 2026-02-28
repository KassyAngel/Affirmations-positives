import { Switch, Route } from "wouter";
import { lazy, Suspense, useEffect } from "react";
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
import "@/styles/gradients.css";

const Home       = lazy(() => import("@/pages/Home"));
const Categories = lazy(() => import("@/pages/Categories"));
const Favorites  = lazy(() => import("@/pages/Favorites"));
const Stats      = lazy(() => import("@/pages/Stats"));
const NotFound   = lazy(() => import("@/pages/NotFound"));

const PageLoader = () => <div className="min-h-screen bg-black" />;

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/"           component={Home}       />
        <Route path="/categories" component={Categories} />
        <Route path="/favorites"  component={Favorites}  />
        <Route path="/stats"      component={Stats}      />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Composant dédié pub widget — séparé pour pouvoir utiliser useAdMob
// ─────────────────────────────────────────────────────────────────────────────
function WidgetAdHandler() {
  const { showInterstitial } = useAdMob();
  const { isPremium } = usePremium();

  useEffect(() => {
    // Détecte si l'app a été ouverte depuis le widget
    // Le widget lance l'Intent avec ?from=widget dans l'URL
    const params = new URLSearchParams(window.location.search);
    const fromWidget = params.get('from') === 'widget';

    if (fromWidget && !isPremium()) {
      // Délai de 2.5s pour laisser l'app s'initialiser et AdMob se charger
      const timer = setTimeout(async () => {
        console.log('[AdMob] Lancement depuis widget → pub');
        await showInterstitial();
        // Nettoyer le paramètre URL sans recharger la page
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

  useEffect(() => {
    checkAndExpirePremium();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      syncWithRevenueCat();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      initAdMob();
    }, 2000);
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
    return () => {
      clearTimeout(timer);
      notificationService.stop();
    };
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
      {/* ✅ Handler pub widget — actif seulement après onboarding */}
      <WidgetAdHandler />
      <Router />
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