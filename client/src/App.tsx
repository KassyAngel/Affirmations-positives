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
import { initAdMob } from "@/hooks/use-admob";
import "@/styles/gradients.css";

// ✅ Lazy loading — seul Home est chargé au démarrage
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

function AppContent() {
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { setTheme } = useTheme();
  const { language } = useLanguage();
  const { syncWithRevenueCat, checkAndExpirePremium } = usePremium();

  // ✅ NOUVEAU — vérification expiration au démarrage (évite le set() dans isPremium())
  useEffect(() => {
    checkAndExpirePremium();
  }, []);

  // ✅ Sync RevenueCat au démarrage (vérifie si l'utilisateur est déjà premium)
  useEffect(() => {
    const timer = setTimeout(() => {
      syncWithRevenueCat();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ AdMob différé de 2s
  useEffect(() => {
    const timer = setTimeout(() => {
      initAdMob();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Notifications différées
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