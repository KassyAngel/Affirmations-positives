import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme, type ThemeId } from '@/contexts/ThemeContext';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { PersonalizeStep } from '@/components/onboarding/PersonalizeStep';
import { AgeStep } from '@/components/onboarding/AgeStep';
import { NameStep } from '@/components/onboarding/NameStep';
import { GenderStep } from '@/components/onboarding/GenderStep';
import { NotificationStep } from '@/components/onboarding/NotificationStep';
import { ThemeStep } from '@/components/onboarding/ThemeStep';
import { WidgetStep } from '@/components/onboarding/WidgetStep';
import { CompleteStep } from '@/components/onboarding/CompleteStep';

export interface OnboardingData {
  age?: string;
  name?: string;
  gender?: string;
  theme?: string;
  notifications?: {
    enabled: boolean;
    frequency: number;
    startTime: string;
    endTime: string;
  };
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useLanguage();
  // On utilise setTheme uniquement pour l'aperçu live dans ThemeStep
  // mais le FOND de l'onboarding reste rose fixe
  const { setTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});

  const steps = [
    'welcome', 'personalize', 'age', 'name', 'gender',
    'notifications', 'theme', 'widget', 'complete'
  ];
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    if (currentStep === totalSteps - 1) onComplete(data);
    else handleNext();
  };

  const handleThemeSelect = (selectedTheme: ThemeId) => {
    // Aperçu live seulement dans le ThemeStep — pas de changement de fond ici
    setData({ ...data, theme: selectedTheme });
  };

  const handleComplete = () => {
    // ✅ On applique le thème UNIQUEMENT quand l'onboarding est terminé
    if (data.theme) setTheme(data.theme as ThemeId);
    onComplete(data);
  };

  return (
    // ✅ FOND ROSE FIXE — jamais affecté par le thème choisi
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #fce7f3 40%, #f3e8ff 100%)',
      }}
    >
      {/* Bulles décoratives fixes rose/mauve */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-16 left-8 w-56 h-56 bg-rose-200/40 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-16 right-8 w-72 h-72 bg-pink-200/35 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Barre de progression */}
      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-rose-200/40">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Bouton Ignorer */}
      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <button
          onClick={handleSkip}
          className="fixed top-4 right-4 z-50 px-4 py-2 text-sm text-rose-400 hover:text-rose-600 transition-colors font-medium"
        >
          {t.onboarding.skip}
        </button>
      )}

      {/* Contenu des étapes */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <WelcomeStep onContinue={handleNext} />
              )}
              {currentStep === 1 && (
                <PersonalizeStep onContinue={handleNext} onBack={handleBack} />
              )}
              {currentStep === 2 && (
                <AgeStep
                  value={data.age}
                  onSelect={(age) => { setData({ ...data, age }); handleNext(); }}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <NameStep
                  value={data.name || ''}
                  onChange={(name) => setData({ ...data, name })}
                  onContinue={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 4 && (
                <GenderStep
                  value={data.gender}
                  onSelect={(gender) => { setData({ ...data, gender }); handleNext(); }}
                  onBack={handleBack}
                />
              )}
              {currentStep === 5 && (
                <NotificationStep
                  onContinue={(notifData) => { setData({ ...data, notifications: notifData }); handleNext(); }}
                  onBack={handleBack}
                />
              )}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <ThemeStep
                    selectedTheme={(data.theme as ThemeId) || 'zen'}
                    onThemeSelect={handleThemeSelect}
                    onBack={handleBack}
                  />
                  {/* Bouton Continuer fixe, style rose indépendant du thème */}
                  <button
                    onClick={handleNext}
                    className="w-full py-4 rounded-full font-semibold text-lg text-white shadow-lg transition-all duration-300 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #fb7185, #ec4899)' }}
                  >
                    {t.onboarding.personalize.continue}
                  </button>
                </div>
              )}
              {currentStep === 7 && (
                <WidgetStep onContinue={handleNext} onBack={handleBack} />
              )}
              {currentStep === 8 && (
                <CompleteStep onComplete={handleComplete} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}