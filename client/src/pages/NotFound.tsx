import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="p-6 rounded-full bg-card border border-white/5 mb-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      
      <h1 className="text-4xl font-display font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8 text-lg max-w-md">
        Oups ! Cette page semble avoir disparu dans le néant philosophique.
      </p>

      <Link href="/" className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
        Retour à l'accueil
      </Link>
    </div>
  );
}
