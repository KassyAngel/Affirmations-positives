import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Wind, Eye, PenLine } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePremium } from '@/hooks/use-premium';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import emergencyQuotes from '@/data/emergency-quotes.json';

type Phase = 'quote' | 'exercise' | 'anchor';
type ExerciseTab = 'breathing' | 'grounding' | 'writing';
type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface EmergencyModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const BG = 'linear-gradient(160deg, #0a0e1a 0%, #0d1526 50%, #09101d 100%)';

const R = {
  accent:       '#60a5fa',
  text:         '#bfdbfe',
  soft:         'rgba(96,165,250,0.18)',
  border:       'rgba(96,165,250,0.35)',
  glow:         'rgba(96,165,250,0.25)',
  circleBg:     'radial-gradient(circle, rgba(96,165,250,0.32) 0%, rgba(59,130,246,0.16) 55%, transparent 100%)',
  circleBorder: 'rgba(96,165,250,0.42)',
  dimText:      'rgba(191,219,254,0.65)',
  veryDim:      'rgba(191,219,254,0.35)',
  bodyText:     'rgba(230,240,255,0.92)',
  blueGlow:     'rgba(59,130,246,0.08)',
  cardBg:       'rgba(96,165,250,0.08)',
  cardBorder:   'rgba(96,165,250,0.22)',
  cardHover:    'rgba(96,165,250,0.14)',
};

const BREATH_CYCLE: { phase: BreathPhase; duration: number; labelFr: string; labelEn: string }[] = [
  { phase: 'inhale',   duration: 4000, labelFr: 'Inspire',   labelEn: 'Inhale'   },
  { phase: 'hold-in',  duration: 4000, labelFr: 'Retiens',   labelEn: 'Hold'     },
  { phase: 'exhale',   duration: 4000, labelFr: 'Expire',    labelEn: 'Exhale'   },
  { phase: 'hold-out', duration: 4000, labelFr: 'Pause',     labelEn: 'Pause'    },
];
const TOTAL_CYCLES = 3;

const GROUNDING_FR = [
  { count: 5, labelFr: 'Tu vois',    labelEn: 'You see',   instruction: '5 choses que tu vois autour de toi' },
  { count: 4, labelFr: 'Tu touches', labelEn: 'You touch', instruction: '4 choses que tu peux toucher' },
  { count: 3, labelFr: 'Tu entends', labelEn: 'You hear',  instruction: '3 choses que tu entends' },
  { count: 2, labelFr: 'Tu sens',    labelEn: 'You smell', instruction: '2 choses que tu peux sentir' },
  { count: 1, labelFr: 'Tu goûtes',  labelEn: 'You taste', instruction: '1 chose que tu peux goûter' },
];
const GROUNDING_EN = [
  { count: 5, labelFr: 'Tu vois',    labelEn: 'You see',   instruction: '5 things you can see around you' },
  { count: 4, labelFr: 'Tu touches', labelEn: 'You touch', instruction: '4 things you can touch' },
  { count: 3, labelFr: 'Tu entends', labelEn: 'You hear',  instruction: '3 things you can hear' },
  { count: 2, labelFr: 'Tu sens',    labelEn: 'You smell', instruction: '2 things you can smell' },
  { count: 1, labelFr: 'Tu goûtes',  labelEn: 'You taste', instruction: '1 thing you can taste' },
];

const WRITING_FR = [
  'En ce moment, je ressens...',
  "Ce qui me pèse le plus c'est...",
  "Ce dont j'ai besoin maintenant c'est...",
  "Une chose que je peux faire pour moi là, c'est...",
];
const WRITING_EN = [
  'Right now, I feel...',
  'What weighs on me most is...',
  'What I need right now is...',
  'One thing I can do for myself is...',
];

const ANCHOR_FR = [
  'Tu es encore là.',
  'Tu as bien fait.',
  'La tempête se calme.',
  'Tu es en sécurité.',
  'Tu mérites de prendre soin de toi.',
];
const ANCHOR_EN = [
  'You are still here.',
  'You did well.',
  'The storm is calming.',
  'You are safe.',
  'You deserve to take care of yourself.',
];

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-2 items-center justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i} className="rounded-full"
          animate={{
            width: i === current ? 24 : 8, height: 8,
            backgroundColor: i < current ? 'rgba(251,113,133,0.55)' : i === current ? R.accent : 'rgba(255,255,255,0.12)',
          }}
          transition={{ duration: 0.35 }}
        />
      ))}
    </div>
  );
}

function AnchorSequence({
  messages,
  onAllDone,
}: {
  messages: string[];
  onAllDone: () => void;
}) {
  const [revealed, setRevealed] = useState<number[]>(messages.map(() => 0));
  const [currentMsg, setCurrentMsg] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onAllDoneRef = useRef(onAllDone);
  onAllDoneRef.current = onAllDone;

  useEffect(() => {
    const msg = messages[currentMsg];
    if (!msg) return;

    let charIdx = 0;
    timerRef.current = setInterval(() => {
      charIdx++;
      setRevealed(prev => {
        const next = [...prev];
        next[currentMsg] = charIdx;
        return next;
      });

      if (charIdx >= msg.length) {
        if (timerRef.current) clearInterval(timerRef.current);

        if (currentMsg < messages.length - 1) {
          setTimeout(() => setCurrentMsg(c => c + 1), 850);
        } else {
          setTimeout(() => onAllDoneRef.current(), 600);
        }
      }
    }, 38);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentMsg, messages]);

  return (
    <div className="flex flex-col items-center gap-3 justify-center" style={{ minHeight: 200 }}>
      {messages.map((msg, i) => {
        const chars = revealed[i] ?? 0;
        const isActive = i === currentMsg;
        const isPast = i < currentMsg;
        const displayText = msg.slice(0, chars);

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: isPast ? 0.25 : isActive || chars > 0 ? 1 : 0, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-lg font-light leading-relaxed text-center px-4"
            style={{ fontFamily: "'Georgia', serif", color: isPast ? 'rgba(230,240,255,0.25)' : R.bodyText }}
          >
            {displayText}
            {isActive && chars < msg.length && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 ml-0.5 align-middle"
                style={{ height: '1em', backgroundColor: R.accent }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function EmergencyMode({ isOpen, onClose }: EmergencyModeProps) {
  const { language } = useLanguage();
  const { isPremium } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);
  const isFr = language === 'fr';

  const [phase, setPhase] = useState<Phase>('quote');
  const [quote, setQuote] = useState(emergencyQuotes[0]);
  const [activeTab, setActiveTab] = useState<ExerciseTab>('breathing');

  const [quoteDisplayed, setQuoteDisplayed] = useState('');
  const [quoteDone, setQuoteDone] = useState(false);
  const [authorDisplayed, setAuthorDisplayed] = useState('');

  const [breathPhaseIdx, setBreathPhaseIdx] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [breathDone, setBreathDone] = useState(false);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingDone, setGroundingDone] = useState(false);

  const [writingStep, setWritingStep] = useState(0);
  const [writingAnswers, setWritingAnswers] = useState(['', '', '', '']);
  const [writingDone, setWritingDone] = useState(false);

  const [anchorDone, setAnchorDone] = useState(false);
  const [anchorKey, setAnchorKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const random = emergencyQuotes[Math.floor(Math.random() * emergencyQuotes.length)];
    setQuote(random);
    setPhase('quote');
    setActiveTab('breathing');
    setQuoteDisplayed(''); setQuoteDone(false); setAuthorDisplayed('');
    resetBreath(); resetGrounding(); resetWriting();
    setAnchorDone(false); setAnchorKey(k => k + 1);
  }, [isOpen]);

  const resetBreath = () => {
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setBreathPhaseIdx(0); setCycleCount(0); setBreathProgress(0); setBreathDone(false);
  };
  const resetGrounding = () => { setGroundingStep(0); setGroundingDone(false); };
  const resetWriting = () => { setWritingStep(0); setWritingAnswers(['', '', '', '']); setWritingDone(false); };

  useEffect(() => {
    if (phase !== 'exercise') return;
    resetBreath(); resetGrounding(); resetWriting();
  }, [activeTab]);

  useEffect(() => {
    if (phase === 'anchor') {
      setAnchorDone(false);
      setAnchorKey(k => k + 1);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'quote' || !isOpen) return;
    const text = isFr ? quote.content : quote.contentEn;
    setQuoteDisplayed(''); setQuoteDone(false);
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) { setQuoteDisplayed(text.slice(0, i + 1)); i++; }
      else { setQuoteDone(true); clearInterval(iv); }
    }, 26);
    return () => clearInterval(iv);
  }, [phase, isOpen, isFr, quote]);

  useEffect(() => {
    if (!quoteDone) return;
    const text = `— ${quote.author}`;
    setAuthorDisplayed('');
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) { setAuthorDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(iv);
    }, 42);
    return () => clearInterval(iv);
  }, [quoteDone]);

  const startBreathTimer = useCallback((phaseIdx: number, cycle: number) => {
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    const { duration } = BREATH_CYCLE[phaseIdx];
    let elapsed = 0;
    progressTimerRef.current = setInterval(() => {
      elapsed += 50;
      setBreathProgress(Math.min(elapsed / duration, 1));
    }, 50);
    breathTimerRef.current = setTimeout(() => {
      const nextIdx = (phaseIdx + 1) % BREATH_CYCLE.length;
      const nextCycle = nextIdx === 0 ? cycle + 1 : cycle;
      if (nextCycle >= TOTAL_CYCLES && nextIdx === 0) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setBreathDone(true);
      } else {
        setBreathPhaseIdx(nextIdx); setCycleCount(nextCycle); setBreathProgress(0);
        startBreathTimer(nextIdx, nextCycle);
      }
    }, duration);
  }, []);

  useEffect(() => {
    if (phase === 'exercise' && activeTab === 'breathing' && !breathDone) {
      startBreathTimer(0, 0);
    }
    return () => {
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [phase, activeTab]);

  const currentBreath = BREATH_CYCLE[breathPhaseIdx];
  const isExpanding = currentBreath.phase === 'inhale' || currentBreath.phase === 'hold-in';
  const groundingSteps = isFr ? GROUNDING_FR : GROUNDING_EN;
  const writingPrompts = isFr ? WRITING_FR : WRITING_EN;
  const anchorMessages = isFr ? ANCHOR_FR : ANCHOR_EN;

  // ✅ Définir les exercices (gratuit vs premium)
  const TABS = [
    {
      id: 'breathing' as ExerciseTab,
      Icon: Wind,
      fr: 'Respiration', en: 'Breathing',
      desc_fr: 'Cohérence cardiaque', desc_en: 'Cardiac coherence',
      premium: false, // ✅ GRATUIT
    },
    {
      id: 'grounding' as ExerciseTab,
      Icon: Eye,
      fr: '5-4-3-2-1', en: '5-4-3-2-1',
      desc_fr: 'Ancrage sensoriel', desc_en: 'Sensory grounding',
      premium: true, // 💎 PREMIUM
    },
    {
      id: 'writing' as ExerciseTab,
      Icon: PenLine,
      fr: 'Écriture', en: 'Writing',
      desc_fr: 'Exprime tes émotions', desc_en: 'Express your feelings',
      premium: true, // 💎 PREMIUM
    },
  ];

  // ✅ Handler pour sélection exercice
  const handleExerciseSelect = (exerciseId: ExerciseTab, isPremiumExercise: boolean) => {
    if (isPremiumExercise && !isPremium()) {
      setShowPaywall(true);
      return;
    }

    setActiveTab(exerciseId);
    setPhase('exercise');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="emergency-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: BG }}
      >
        <motion.div className="absolute pointer-events-none"
          style={{ width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${R.blueGlow} 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <button onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10"
          style={{ color: R.veryDim, background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)` }}
          onMouseEnter={e => { e.currentTarget.style.color = R.text; e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = R.veryDim; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2 items-center z-10">
          {(['quote', 'exercise', 'anchor'] as Phase[]).map((p, i) => {
            const order = ['quote', 'exercise', 'anchor'];
            const isActive = phase === p;
            const isPast = order.indexOf(phase) > i;
            return (
              <motion.div key={p} className="rounded-full" style={{ height: 5 }}
                animate={{ 
                  width: isActive ? 20 : 5, 
                  backgroundColor: isActive ? R.accent : isPast ? 'rgba(251,113,133,0.40)' : 'rgba(255,255,255,0.15)' 
                }}
                transition={{ duration: 0.4 }}
              />
            );
          })}
        </div>

        <div className="w-full max-w-sm px-6 flex items-center justify-center" style={{ minHeight: '80vh' }}>
          <AnimatePresence mode="wait">

            {phase === 'quote' && (
              <motion.div key="quote"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center w-full text-center gap-6"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1], 
                    boxShadow: [`0 0 0px ${R.glow}`, `0 0 24px ${R.glow}`, `0 0 0px ${R.glow}`] 
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(96,165,250,0.14)', border: `1.5px solid rgba(96,165,250,0.30)` }}>
                  <Heart className="w-6 h-6" style={{ color: '#60a5fa' }} />
                </motion.div>

                <div style={{ minHeight: 160 }} className="flex flex-col items-center gap-3">
                  <p className="text-lg font-light leading-relaxed"
                    style={{ color: R.bodyText, fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>
                    "{quoteDisplayed}
                    {!quoteDone && (
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-0.5 ml-0.5 align-middle" style={{ height: '1em', backgroundColor: R.accent }} />
                    )}"
                  </p>

                  {quoteDone && authorDisplayed && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.2 }}
                      className="text-xs italic font-light" 
                      style={{ color: R.veryDim }}
                    >
                      {authorDisplayed}
                    </motion.p>
                  )}
                </div>

                <div style={{ minHeight: quoteDone ? 'auto' : 0, opacity: quoteDone ? 1 : 0 }} className="w-full transition-opacity duration-500">
                  {quoteDone && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                      className="flex flex-col gap-3 w-full"
                    >
                      <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: R.text }}>
                        {isFr ? 'Choisis un exercice' : 'Choose an exercise'}
                      </p>

                      {/* ✅ Exercices avec badge Premium si bloqué */}
                      {TABS.map(({ id, Icon, fr, en, desc_fr, desc_en, premium }) => {
                        const isLocked = premium && !isPremium();

                        return (
                          <motion.button key={id}
                            onClick={() => handleExerciseSelect(id, premium)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left"
                            style={{ 
                              background: R.cardBg, 
                              border: `1.5px solid ${R.cardBorder}`,
                              boxShadow: `0 2px 8px rgba(96,165,250,0.06)`,
                              opacity: isLocked ? 0.7 : 1,
                            }}
                          >
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: R.soft, border: `1px solid ${R.border}` }}>
                              <Icon className="w-4 h-4" style={{ color: R.accent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold" style={{ color: R.text }}>{isFr ? fr : en}</p>
                                {isLocked && (
                                  <span className="text-lg leading-none">👑</span>
                                )}
                              </div>
                              <p className="text-xs truncate" style={{ color: R.dimText }}>{isFr ? desc_fr : desc_en}</p>
                            </div>
                            <span className="text-base flex-shrink-0 font-semibold" style={{ color: isLocked ? R.veryDim : R.text }}>
                              {isLocked ? '🔒' : '›'}
                            </span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Le reste du code (exercices + anchor) reste identique */}
            {phase === 'exercise' && (
              <motion.div key={`exercise-${activeTab}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center w-full gap-5"
              >
                {(() => {
                  const tab = TABS.find(t => t.id === activeTab)!;
                  return (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" 
                      style={{ background: R.soft, border: `1px solid ${R.border}` }}>
                      <tab.Icon className="w-3.5 h-3.5" style={{ color: R.accent }} />
                      <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: R.text }}>
                        {isFr ? tab.fr : tab.en}
                      </p>
                    </div>
                  );
                })()}

                <AnimatePresence mode="wait">
                  {activeTab === 'breathing' && (
                    <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-5 w-full text-center"
                    >
                      {!breathDone ? (
                        <>
                          <p className="text-xs tracking-wider font-medium" style={{ color: R.dimText }}>
                            {isFr ? `Cycle ${Math.min(cycleCount + 1, TOTAL_CYCLES)} / ${TOTAL_CYCLES}` : `Cycle ${Math.min(cycleCount + 1, TOTAL_CYCLES)} / ${TOTAL_CYCLES}`}
                          </p>
                          <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                            <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(96,165,250,0.12)' }} />
                            <motion.div
                              animate={{ scale: isExpanding ? 1 : 0.52 }}
                              transition={{ 
                                duration: currentBreath.duration / 1000, 
                                ease: currentBreath.phase === 'inhale' ? [0.4, 0, 0.6, 1] : currentBreath.phase === 'exhale' ? [0.4, 0, 0.6, 1] : 'linear' 
                              }}
                              className="absolute rounded-full"
                              style={{ 
                                width: 180, 
                                height: 180, 
                                background: R.circleBg, 
                                border: `1.5px solid ${R.circleBorder}`, 
                                boxShadow: `0 0 48px ${R.glow}` 
                              }}
                            />
                            <div className="relative z-10 flex flex-col items-center gap-1">
                              <AnimatePresence mode="wait">
                                <motion.p key={currentBreath.phase}
                                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                  className="text-xl font-light tracking-wide" style={{ color: R.bodyText }}>
                                  {isFr ? currentBreath.labelFr : currentBreath.labelEn}
                                </motion.p>
                              </AnimatePresence>
                              <p className="text-xs font-medium" style={{ color: R.dimText }}>{currentBreath.duration / 1000}s</p>
                            </div>
                          </div>
                          <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(96,165,250,0.12)' }}>
                            <motion.div className="h-full rounded-full"
                              style={{ 
                                width: `${breathProgress * 100}%`, 
                                background: `linear-gradient(90deg, #60a5fa, #3b82f6)`,
                                boxShadow: `0 0 8px ${R.glow}`
                              }} 
                            />
                          </div>
                          <p className="text-xs max-w-[200px] leading-relaxed" style={{ color: R.dimText }}>
                            {isFr ? 'Laisse ton souffle te guider' : 'Let your breath guide you'}
                          </p>
                        </>
                      ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center" 
                            style={{ background: 'rgba(134,239,172,0.14)', border: '1.5px solid rgba(134,239,172,0.30)' }}>
                            <span className="text-2xl">🌿</span>
                          </div>
                          <p className="text-base" style={{ color: R.bodyText, fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>
                            {isFr ? 'Bien respiré. Tu vas mieux.' : 'Well breathed. You feel better.'}
                          </p>
                          <ContinueButton isFr={isFr} onClick={() => setPhase('anchor')} glow={R.glow} />
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'grounding' && (
                    <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-5 w-full text-center"
                    >
                      {!groundingDone ? (
                        <>
                          <StepDots total={groundingSteps.length} current={groundingStep} />
                          <div style={{ minHeight: 280 }}>
                            <AnimatePresence mode="wait">
                              <motion.div key={groundingStep}
                                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.25 }}
                                className="flex flex-col items-center gap-4"
                              >
                                <div className="w-20 h-20 rounded-xl flex items-center justify-center"
                                  style={{ background: R.soft, border: `1.5px solid ${R.border}`, boxShadow: `0 4px 16px ${R.glow}` }}>
                                  <span className="text-5xl font-bold" style={{ color: R.accent }}>
                                    {groundingSteps[groundingStep].count}
                                  </span>
                                </div>
                                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: R.text }}>
                                  {isFr ? groundingSteps[groundingStep].labelFr : groundingSteps[groundingStep].labelEn}
                                </p>
                                <p className="text-base leading-relaxed" style={{ color: R.bodyText }}>
                                  {groundingSteps[groundingStep].instruction}
                                </p>
                                <p className="text-xs" style={{ color: R.dimText }}>
                                  {isFr ? 'Prends ton temps' : 'Take your time'}
                                </p>
                              </motion.div>
                            </AnimatePresence>
                          </div>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { if (groundingStep < groundingSteps.length - 1) setGroundingStep(s => s + 1); else setGroundingDone(true); }}
                            className="px-7 py-3 rounded-full text-white text-sm font-semibold"
                            style={{ 
                              background: `linear-gradient(135deg, #60a5fa, #3b82f6)`, 
                              boxShadow: `0 0 24px ${R.glow}` 
                            }}>
                            {groundingStep < groundingSteps.length - 1 ? (isFr ? 'Suivant →' : 'Next →') : (isFr ? 'Terminé ✓' : 'Done ✓')}
                          </motion.button>
                        </>
                      ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center" 
                            style={{ background: 'rgba(134,239,172,0.14)', border: '1.5px solid rgba(134,239,172,0.30)' }}>
                            <span className="text-2xl">✨</span>
                          </div>
                          <p className="text-base" style={{ color: R.bodyText, fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>
                            {isFr ? 'Tu es ancré dans le présent' : 'You are grounded in the present'}
                          </p>
                          <ContinueButton isFr={isFr} onClick={() => setPhase('anchor')} glow={R.glow} />
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'writing' && (
                    <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-4 w-full"
                    >
                      {!writingDone ? (
                        <>
                          <StepDots total={writingPrompts.length} current={writingStep} />
                          <div className="w-full" style={{ minHeight: 240 }}>
                            <AnimatePresence mode="wait">
                              <motion.div key={writingStep}
                                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.25 }}
                                className="w-full flex flex-col gap-3"
                              >
                                <p className="text-sm font-semibold text-center" style={{ color: R.text }}>
                                  {writingPrompts[writingStep]}
                                </p>
                                <textarea
                                  value={writingAnswers[writingStep]}
                                  onChange={e => { const u = [...writingAnswers]; u[writingStep] = e.target.value; setWritingAnswers(u); }}
                                  placeholder={isFr ? 'Écris ici...' : 'Write here...'}
                                  rows={4}
                                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                                  style={{ 
                                    background: 'rgba(96,165,250,0.06)', 
                                    border: `1px solid rgba(96,165,250,0.14)`, 
                                    color: R.bodyText, 
                                    caretColor: R.accent 
                                  }}
                                />
                              </motion.div>
                            </AnimatePresence>
                          </div>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { if (writingStep < writingPrompts.length - 1) setWritingStep(s => s + 1); else setWritingDone(true); }}
                            className="px-7 py-3 rounded-full text-white text-sm font-semibold"
                            style={{ 
                              background: `linear-gradient(135deg, #60a5fa, #3b82f6)`, 
                              boxShadow: `0 0 24px ${R.glow}` 
                            }}>
                            {writingStep < writingPrompts.length - 1 ? (isFr ? 'Suivant →' : 'Next →') : (isFr ? 'Terminer ✓' : 'Finish ✓')}
                          </motion.button>
                        </>
                      ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center" 
                            style={{ background: 'rgba(134,239,172,0.14)', border: '1.5px solid rgba(134,239,172,0.30)' }}>
                            <Heart className="w-6 h-6" style={{ color: '#86efac' }} />
                          </div>
                          <p className="text-center text-base" style={{ color: R.bodyText, fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>
                            {isFr ? "Merci de t'être confié" : 'Thank you for opening up'}
                          </p>
                          <ContinueButton isFr={isFr} onClick={() => setPhase('anchor')} glow={R.glow} />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={() => setPhase('anchor')} 
                  className="text-xs mt-1 transition-colors" 
                  style={{ color: R.veryDim }}
                  onMouseEnter={e => (e.currentTarget.style.color = R.dimText)}
                  onMouseLeave={e => (e.currentTarget.style.color = R.veryDim)}>
                  {isFr ? "Passer à l'étape finale" : 'Skip to final step'}
                </button>
              </motion.div>
            )}

            {phase === 'anchor' && (
              <motion.div key="anchor"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center w-full text-center gap-6"
              >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.06, 1], 
                    boxShadow: ['0 0 0px rgba(74,222,128,0.2)', '0 0 24px rgba(74,222,128,0.3)', '0 0 0px rgba(74,222,128,0.2)'] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(74,222,128,0.14)', border: '1.5px solid rgba(74,222,128,0.30)' }}>
                  <Heart className="w-7 h-7" style={{ color: '#4ade80' }} />
                </motion.div>

                <AnchorSequence
                  key={anchorKey}
                  messages={anchorMessages}
                  onAllDone={() => setAnchorDone(true)}
                />

                {anchorDone && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-full text-white font-semibold"
                    style={{ 
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                      boxShadow: '0 0 32px rgba(34,197,94,0.35)' 
                    }}>
                    <Heart className="w-5 h-5" />
                    <span>{isFr ? 'Je me sens mieux' : 'I feel better'}</span>
                  </motion.button>
                )}

                {!anchorDone && (
                  <button onClick={onClose} className="text-xs transition-colors" style={{ color: R.veryDim }}
                    onMouseEnter={e => (e.currentTarget.style.color = R.dimText)}
                    onMouseLeave={e => (e.currentTarget.style.color = R.veryDim)}>
                    {isFr ? 'Fermer' : 'Close'}
                  </button>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Premium Paywall */}
        <PremiumPaywall 
          isOpen={showPaywall} 
          onClose={() => setShowPaywall(false)}
          trigger="exercise_locked"
        />
      </motion.div>
    </AnimatePresence>
  );
}

function ContinueButton({ isFr, onClick, glow }: { isFr: boolean; onClick: () => void; glow: string }) {
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
      className="px-7 py-3 rounded-full text-white text-sm font-semibold"
      style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', boxShadow: `0 0 24px ${glow}` }}>
      {isFr ? 'Continuer →' : 'Continue →'}
    </motion.button>
  );
}