import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { ThemeProvider, useTheme, type ThemeId } from "@/contexts/ThemeContext";
import { Onboarding, type OnboardingData } from "@/components/Onboarding";
import { useOnboarding } from "@/hooks/use-onboarding";
import { notificationService } from "@/services/notification-service";
import { initAdMob } from "@/hooks/use-admob";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Favorites from "@/pages/Favorites";
import Stats from "@/pages/Stats";
import NotFound from "@/pages/NotFound";
import "@/styles/gradients.css";

function Router() {
  return (
    <Switch>
      <Route path="/"           component={Home}       />
      <Route path="/categories" component={Categories} />
      <Route path="/favorites"  component={Favorites}  />
      <Route path="/stats"      component={Stats}      />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { setTheme } = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    initAdMob();
  }, []);

  useEffect(() => {
    if (hasCompletedOnboarding) {
      const settings = notificationService.getSettings();
      if (settings?.enabled) {
        notificationService.start(language).then(() => {
          console.log('✅ Service de notifications démarré automatiquement');
        });
      }
    }
    return () => { notificationService.stop(); };
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