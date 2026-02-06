import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Favorites from "@/pages/Favorites";
import Stats from "@/pages/Stats";
import NotFound from "@/pages/NotFound";

// Import des styles de dégradés
import "@/styles/gradients.css";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/stats" component={Stats} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Toaster />
        <Router />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;