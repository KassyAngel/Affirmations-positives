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
  'welcome', 
  'personalize', 
  'age', 
  'name', 
  'gender', 
  'notifications', 
  'theme', 
  'widget', 
  'complete'
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
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleSkip = () => {
    onComplete(data);
  };

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleComplete = () => {
    onComplete(data);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative text-white">
      {/* Zen decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Skip button */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors text-sm font-medium"
        >
          {t.onboarding.skip}
        </button>
      )}

      {/* Step content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <AnimatePresence mode="wait" custom={1}>
          {currentStep === 'welcome' && (
            <motion.div key="welcome" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <WelcomeStep onContinue={handleNext} />
            </motion.div>
          )}

          {currentStep === 'personalize' && (
            <motion.div key="personalize" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <PersonalizeStep onContinue={handleNext} onBack={handleBack} />
            </motion.div>
          )}

          {currentStep === 'age' && (
            <motion.div key="age" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <AgeStep value={data.age} onSelect={(age) => { updateData('age', age); handleNext(); }} onBack={handleBack} />
            </motion.div>
          )}

          {currentStep === 'name' && (
            <motion.div key="name" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <NameStep value={data.name || ''} onChange={(name) => updateData('name', name)} onContinue={handleNext} onBack={handleBack} />
            </motion.div>
          )}

          {currentStep === 'gender' && (
            <motion.div key="gender" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <GenderStep value={data.gender} onSelect={(gender) => { updateData('gender', gender); handleNext(); }} onBack={handleBack} />
            </motion.div>
          )}

          {currentStep === 'notifications' && (
            <motion.div key="notifications" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <NotificationStep 
                onContinue={(notifData) => { updateData('notifications', notifData); handleNext(); }} 
                onBack={handleBack} 
              />
            </motion.div>
          )}

          {currentStep === 'theme' && (
            <motion.div key="theme" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <ThemeStep 
                onSelect={(theme: string) => { updateData('theme', theme); handleNext(); }} 
                onBack={handleBack} 
              />
            </motion.div>
          )}

          {currentStep === 'widget' && (
            <motion.div key="widget" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <WidgetStep onContinue={handleNext} onBack={handleBack} />
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div key="complete" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <CompleteStep onComplete={handleComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
