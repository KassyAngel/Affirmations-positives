import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
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
  notifications?: {
    enabled: boolean;
    frequency: number;
    startTime: string;
    endTime: string;
  };
  theme?: string;
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const STEPS = [
  'welcome', 'personalize', 'age', 'name', 'gender',
  'notifications', 'theme', 'widget', 'complete'
] as const;

type Step = typeof STEPS[number];

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [data, setData] = useState<OnboardingData>({});

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) setCurrentStep(STEPS[nextIndex]);
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setCurrentStep(STEPS[prevIndex]);
  };

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const slideVariants = {
    enter: { x: 1000, opacity: 0 },
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: { zIndex: 0, x: -1000, opacity: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100 overflow-hidden relative">
      {/* Bulles décoratives animées */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Barre de progression rose */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-rose-200/40">
        <motion.div
          className="h-full bg-gradient-to-r from-rose-400 to-pink-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Bouton Ignorer */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <button
          onClick={() => onComplete(data)}
          className="absolute top-6 right-6 z-50 text-rose-400 hover:text-rose-600 transition-colors text-sm font-medium"
        >
          {t.onboarding.skip}
        </button>
      )}

      {/* Contenu des étapes */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div key="welcome" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: 'easeInOut' }}>
              <WelcomeStep onContinue={handleNext} />
            </motion.div>
          )}
          {currentStep === 'personalize' && (
            <motion.div key="personalize" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: 'easeInOut' }}>
              <PersonalizeStep onContinue={handleNext} onBack={handleBack} />
            </motion.div>
          )}
          {currentStep === 'age' && (
            <motion.div key="age" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: 'easeInOut' }}>
              <AgeStep value={data.age} onSelect={(age) => { updateData('age', age); handleNext(); }} onBack={handleBack} />
            </motion.div>
          )}
          {currentStep === 'name' && (
            <motion.div key="name" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: 'easeInOut' }}>
              <NameStep value={data.name || ''} onChange={(name) => updateData('name', name)} onContinue={handleNext} onBack={handleBack} />
            </motion.div>
          )}
          {currentStep === 'gender' && (
            <motion.div key="gender" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: 'easeInOut' }}>
              <GenderStep value={data.gender} onSelect={(gender) => { updateData('gender', gender); handleNext(); }} onBack={handleBack} />
            </motion.div>
          )}
          {currentStep === 'notifications' && (
            <motion.div key="notifications" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: 'easeInOut' }}>
              <NotificationStep onContinue={(notifData) => { updateData('notifications', notifData); handleNext(); }} onBack={handleBack} />
            </motion.div>
          )}
          {currentStep === 'theme' && (
            <motion.div key="theme" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: 'easeInOut' }}>
              <ThemeStep onSelect={(theme) => { updateData('theme', theme); handleNext(); }} onBack={handleBack} />
            </motion.div>
          )}
          {currentStep === 'widget' && (
            <motion.div key="widget" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: 'easeInOut' }}>
              <WidgetStep onContinue={handleNext} onBack={handleBack} />
            </motion.div>
          )}
          {currentStep === 'complete' && (
            <motion.div key="complete" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: 'easeInOut' }}>
              <CompleteStep onComplete={() => onComplete(data)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}