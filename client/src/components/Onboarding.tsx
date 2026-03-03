import { useState, useEffect, useRef } from 'react';
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

// ✅ Détecte les appareils lents (≤2 coeurs = ancien Android)
function isSlowDevice(): boolean {
  return (navigator.hardwareConcurrency ?? 4) <= 2;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useLanguage();
  const { setTheme } = useTheme();
  const slow = useRef(isSlowDevice());

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});

  // ✅ Animation CSS pure — pas de framer-motion pour les transitions
  const [animClass, setAnimClass] = useState('step-enter');
  const [displayStep, setDisplayStep] = useState(0);
  const isAnimating = useRef(false);

  const steps = [
    'welcome', 'personalize', 'age', 'name', 'gender',
    'notifications', 'theme', 'widget', 'complete'
  ];
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // ✅ Transition CSS entre étapes — remplace AnimatePresence
  const goToStep = (next: number) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    // Sur appareil lent → pas d'animation du tout
    if (slow.current) {
      setDisplayStep(next);
      setCurrentStep(next);
      isAnimating.current = false;
      return;
    }

    setAnimClass('step-exit');
    setTimeout(() => {
      setDisplayStep(next);
      setCurrentStep(next);
      setAnimClass('step-enter');
      setTimeout(() => {
        setAnimClass('step-visible');
        isAnimating.current = false;
      }, 20);
    }, 180);
  };

  // Init
  useEffect(() => {
    setTimeout(() => setAnimClass('step-visible'), 20);
  }, []);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) goToStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };
  const handleSkip = () => {
    if (currentStep === totalSteps - 1) onComplete(data);
    else handleNext();
  };
  const handleThemeSelect = (selectedTheme: ThemeId) => {
    setData({ ...data, theme: selectedTheme });
  };
  const handleComplete = () => {
    if (data.theme) setTheme(data.theme as ThemeId);
    onComplete(data);
  };

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        background: 'linear-gradient(160deg, #FFF5F0 0%, #FFE8DC 40%, #FFF8F5 100%)',
      }}
    >
      <style>{`
        .step-enter  { opacity: 0; transform: translateX(16px); }
        .step-exit   { opacity: 0; transform: translateX(-16px); transition: opacity 0.18s ease, transform 0.18s ease; }
        .step-visible { opacity: 1; transform: translateX(0);    transition: opacity 0.22s ease, transform 0.22s ease; }

        @keyframes bubble-pulse-1 {
          0%, 100% { transform: scale(1);    opacity: 0.35; }
          50%       { transform: scale(1.15); opacity: 0.55; }
        }
        @keyframes bubble-pulse-2 {
          0%, 100% { transform: scale(1.1); opacity: 0.3; }
          50%       { transform: scale(1);   opacity: 0.5; }
        }
        .bubble-1 { animation: bubble-pulse-1 8s ease-in-out infinite; }
        .bubble-2 { animation: bubble-pulse-2 10s ease-in-out infinite; }
      `}</style>

      {/* Bulles décoratives — CSS pur, seulement sur appareils rapides */}
      {!slow.current && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="bubble-1 absolute top-16 left-8 w-56 h-56 rounded-full blur-3xl"
            style={{ background: 'rgba(255,168,130,0.25)' }}
          />
          <div
            className="bubble-2 absolute bottom-16 right-8 w-72 h-72 rounded-full blur-3xl"
            style={{ background: 'rgba(255,203,184,0.30)' }}
          />
        </div>
      )}

      {/* Barre de progression */}
      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1" style={{ background: 'rgba(255,203,184,0.40)' }}>
          <div
            className="h-full"
            style={{
              background: 'linear-gradient(to right, #FF8C69, #FFA882)',
              width: `${progress}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Bouton Ignorer */}
      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <button
          onClick={handleSkip}
          className="fixed top-4 right-4 z-50 px-4 py-2 text-sm font-medium transition-colors"
          style={{ color: '#FF8C69' }}
        >
          {t.onboarding.skip}
        </button>
      )}

      {/* Contenu des étapes — transition CSS au lieu d'AnimatePresence */}
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          <div className={animClass}>
            {displayStep === 0 && (
              <WelcomeStep onContinue={handleNext} />
            )}
            {displayStep === 1 && (
              <PersonalizeStep onContinue={handleNext} onBack={handleBack} />
            )}
            {displayStep === 2 && (
              <AgeStep
                value={data.age}
                onSelect={(age) => { setData({ ...data, age }); handleNext(); }}
                onBack={handleBack}
              />
            )}
            {displayStep === 3 && (
              <NameStep
                value={data.name || ''}
                onChange={(name) => setData({ ...data, name })}
                onContinue={handleNext}
                onBack={handleBack}
              />
            )}
            {displayStep === 4 && (
              <GenderStep
                value={data.gender}
                onSelect={(gender) => { setData({ ...data, gender }); handleNext(); }}
                onBack={handleBack}
              />
            )}
            {displayStep === 5 && (
              <NotificationStep
                onContinue={(notifData) => { setData({ ...data, notifications: notifData }); handleNext(); }}
                onBack={handleBack}
              />
            )}
            {displayStep === 6 && (
              <div className="space-y-4">
                <ThemeStep
                  selectedTheme={(data.theme as ThemeId) || 'zen'}
                  onThemeSelect={handleThemeSelect}
                  onBack={handleBack}
                />
                <button
                  onClick={handleNext}
                  className="w-full py-4 rounded-full font-semibold text-lg text-white shadow-lg"
                  style={{
                    background: 'linear-gradient(to right, #FF8C69, #FFA882)',
                    boxShadow: '0 8px 24px rgba(255,140,105,0.35)',
                  }}
                >
                  {t.onboarding.personalize.continue}
                </button>
              </div>
            )}
            {displayStep === 7 && (
              <WidgetStep onContinue={handleNext} onBack={handleBack} />
            )}
            {displayStep === 8 && (
              <CompleteStep onComplete={handleComplete} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}