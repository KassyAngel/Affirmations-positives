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
  const { theme, setTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});

  const steps = [
    'welcome',
    'personalize',
    'age',
    'name',
    'gender',
    'notifications',
    'theme',
    'widget',
    'complete'
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep === totalSteps - 1) {
      onComplete(data);
    } else {
      handleNext();
    }
  };

  const handleAgeSelect = (age: string) => {
    setData({ ...data, age });
    handleNext();
  };

  const handleNameChange = (name: string) => {
    setData({ ...data, name });
  };

  const handleNameContinue = () => {
    handleNext();
  };

  const handleGenderSelect = (gender: string) => {
    setData({ ...data, gender });
    handleNext();
  };

  const handleNotificationSetup = (notificationData: OnboardingData['notifications']) => {
    setData({ ...data, notifications: notificationData });
    handleNext();
  };

  const handleThemeSelect = (selectedTheme: ThemeId) => {
    // Appliquer immédiatement le thème
    setTheme(selectedTheme);
    setData({ ...data, theme: selectedTheme });
  };

  const handleThemeNext = () => {
    handleNext();
  };

  const handleComplete = () => {
    onComplete(data);
  };

  return (
    <div className={`min-h-screen ${theme.bgClass} transition-all duration-700`}>
      {/* Barre de progression */}
      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-white/10">
            <motion.div
              className={`h-full bg-gradient-to-r ${theme.progressClass}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Bouton Ignorer */}
      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <button
          onClick={handleSkip}
          className={`fixed top-4 right-4 z-50 px-4 py-2 text-sm ${theme.subtleTextClass} transition-colors`}
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
                  onSelect={handleAgeSelect}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <NameStep 
                  value={data.name || ''}
                  onChange={handleNameChange}
                  onContinue={handleNameContinue}
                  onBack={handleBack}
                />
              )}
              {currentStep === 4 && (
                <GenderStep 
                  value={data.gender}
                  onSelect={handleGenderSelect}
                  onBack={handleBack}
                />
              )}
              {currentStep === 5 && (
                <NotificationStep 
                  onContinue={handleNotificationSetup}
                  onBack={handleBack}
                />
              )}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <ThemeStep
                    selectedTheme={data.theme as ThemeId || 'classic'}
                    onThemeSelect={handleThemeSelect}
                    onBack={handleBack}
                  />
                  <button
                    onClick={handleThemeNext}
                    className={`w-full py-4 rounded-2xl font-medium transition-all ${theme.buttonClass}`}
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