import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Wind, Eye, PenLine, Scan, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePremium } from '@/hooks/use-premium';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import emergencyQuotes from '@/data/emergency-quotes.json';

type Phase = 'quote' | 'exercise' | 'anchor';
type ExerciseTab = 'breathing' | 'grounding' | 'writing' | 'bodyscan' | 'visualization';
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

// ── Scan corporel ─────────────────────────────────────────────────────────────
const BODYSCAN_FR = [
  { zone: 'Tête & visage',    instruction: 'Remarque les tensions dans ton front, tes mâchoires, tes yeux. Laisse-les se relâcher doucement.' },
  { zone: 'Cou & épaules',   instruction: 'Sens le poids de tes épaules. Laisse-les descendre, loin des oreilles.' },
  { zone: 'Poitrine',         instruction: 'Observe ta respiration. Ton cœur bat. Tu es en vie. C\'est suffisant.' },
  { zone: 'Ventre',           instruction: 'Relâche toute contraction dans ton ventre. Laisse-le se détendre complètement.' },
  { zone: 'Bras & mains',    instruction: 'Sens le poids de tes bras. Ouvre les mains, relâche les doigts.' },
  { zone: 'Jambes & pieds',  instruction: 'Sens tes pieds au sol. Tu es ancré, stable, présent.' },
];
const BODYSCAN_EN = [
  { zone: 'Head & face',      instruction: 'Notice the tension in your forehead, jaw, eyes. Let them gently release.' },
  { zone: 'Neck & shoulders', instruction: 'Feel the weight of your shoulders. Let them drop, away from your ears.' },
  { zone: 'Chest',            instruction: 'Observe your breathing. Your heart is beating. You are alive. That is enough.' },
  { zone: 'Belly',            instruction: 'Release any tightness in your belly. Let it fully soften.' },
  { zone: 'Arms & hands',    instruction: 'Feel the weight of your arms. Open your hands, release your fingers.' },
  { zone: 'Legs & feet',     instruction: 'Feel your feet on the ground. You are grounded, stable, present.' },
];

// ── Visualisation sécurisante ─────────────────────────────────────────────────
const VISUALIZATION_FR = [
  { step: 'Ferme les yeux',         instruction: 'Ferme doucement les yeux. Prends trois respirations profondes. Laisse ton corps se poser.' },
  { step: 'Ton endroit sûr',        instruction: 'Imagine un endroit où tu te sens totalement en sécurité. Une plage, une forêt, une pièce chaleureuse... Laisse l\'image se former.' },
  { step: 'Ce que tu vois',         instruction: 'Observe les couleurs, les formes, la lumière de cet endroit. Prends le temps de tout voir en détail.' },
  { step: 'Ce que tu entends',      instruction: 'Écoute les sons de cet endroit. Le vent, l\'eau, le silence... Laisse ces sons te bercer.' },
  { step: 'Ce que tu ressens',      instruction: 'Sens la texture sous tes pieds, la température de l\'air, la douceur de l\'endroit. Tu es en sécurité ici.' },
  { step: 'Reste ici',              instruction: 'Reste dans cet endroit encore un moment. Sache que tu peux y revenir à tout moment, rien qu\'en fermant les yeux.' },
];
const VISUALIZATION_EN = [
  { step: 'Close your eyes',        instruction: 'Gently close your eyes. Take three deep breaths. Let your body settle.' },
  { step: 'Your safe place',        instruction: 'Imagine a place where you feel completely safe. A beach, a forest, a warm room... Let the image form.' },
  { step: 'What you see',           instruction: 'Notice the colors, shapes, and light of this place. Take time to see every detail.' },
  { step: 'What you hear',          instruction: 'Listen to the sounds of this place. Wind, water, silence... Let these sounds soothe you.' },
  { step: 'What you feel',          instruction: 'Feel the texture under your feet, the temperature of the air, the softness of this place. You are safe here.' },
  { step: 'Stay here',              instruction: 'Remain in this place a little longer. Know that you can return here anytime, just by closing your eyes.' },
];

// ── Phrases d'ancrage ─────────────────────────────────────────────────────────
// ✅ Plusieurs sets pour varier à chaque session
const ANCHOR_SETS_FR = [
  [
    'Tu es encore là.',
    'Tu as bien fait.',
    'La tempête se calme.',
    'Tu es en sécurité.',
    'Tu mérites de prendre soin de toi.',
  ],
  [
    'Respire. Tu es présent.',
    'Ce moment difficile va passer.',
    'Tu es plus fort que tu ne le crois.',
    'Tu as le droit d\'aller à ton rythme.',
    'Tu comptes. Tu es précieux.',
  ],
  [
    'Chaque seconde que tu tiens est une victoire.',
    'Tu n\'es pas seul dans ce que tu vis.',
    'Cette douleur est réelle. Et elle est temporaire.',
    'Tu mérites la même douceur que tu offres aux autres.',
    'Demain sera différent d\'aujourd\'hui.',
  ],
];
const ANCHOR_SETS_EN = [
  [
    'You are still here.',
    'You did well.',
    'The storm is calming.',
    'You are safe.',
    'You deserve to take care of yourself.',
  ],
  [
    'Breathe. You are present.',
    'This difficult moment will pass.',
    'You are stronger than you think.',
    'You have the right to go at your own pace.',
    'You matter. You are precious.',
  ],
  [
    'Every second you hold on is a victory.',
    'You are not alone in what you are experiencing.',
    'This pain is real. And it is temporary.',
    'You deserve the same gentleness you offer others.',
    'Tomorrow will be different from today.',
  ],
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

function AnchorSequence({ messages, onAllDone }: { messages: string[]; onAllDone: () => void }) {
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentMsg, messages]);

  return (
    <div className="flex flex-col items-center gap-3 justify-center" style={{ minHeight: 200 }}>
      {messages.map((msg, i) => {
        const chars = revealed[i] ?? 0;
        const isActive = i === currentMsg;
        const isPast = i < currentMsg;
        const displayText = msg.slice(0, chars);
        return (
          <motion.div key={i}
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

function ContinueButton({ isFr, onClick, glow }: { isFr: boolean; onClick: () => void; glow: string }) {
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
      className="px-7 py-3 rounded-full text-white text-sm font-semibold"
      style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', boxShadow: `0 0 24px ${glow}` }}>
      {isFr ? 'Continuer →' : 'Continue →'}
    </motion.button>
  );
}

// ── Écran de fin d'exercice (sans emoji) ──────────────────────────────────────
function ExerciseDone({ message, onContinue, isFr, glow }: {
  message: string; onContinue: () => void; isFr: boolean; glow: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 text-center"
    >
      <p className="text-base" style={{ color: R.bodyText, fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>
        {message}
      </p>
      <ContinueButton isFr={isFr} onClick={onContinue} glow={glow} />
    </motion.div>
  );
}

export function EmergencyMode({ isOpen, onClose }: EmergencyModeProps) {
  const { language } = useLanguage();
  const { isPremium } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);
  const isFr = language === 'fr';

  const [phase, setPhase]         = useState<Phase>('quote');
  const [quote, setQuote]         = useState(emergencyQuotes[0]);
  const [activeTab, setActiveTab] = useState<ExerciseTab>('breathing');

  const [quoteDisplayed, setQuoteDisplayed] = useState('');
  const [quoteDone, setQuoteDone]           = useState(false);
  const [authorDisplayed, setAuthorDisplayed] = useState('');

  // Breathing
  const [breathPhaseIdx, setBreathPhaseIdx] = useState(0);
  const [cycleCount, setCycleCount]         = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [breathDone, setBreathDone]         = useState(false);
  const breathTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Grounding
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingDone, setGroundingDone] = useState(false);

  // Writing
  const [writingStep, setWritingStep]       = useState(0);
  const [writingAnswers, setWritingAnswers] = useState(['', '', '', '']);
  const [writingDone, setWritingDone]       = useState(false);

  // Body scan
  const [bodyscanStep, setBodyscanStep] = useState(0);
  const [bodyscanDone, setBodyscanDone] = useState(false);

  // Visualization
  const [vizStep, setVizStep] = useState(0);
  const [vizDone, setVizDone] = useState(false);

  // Anchor — ✅ set aléatoire à chaque session
  const [anchorDone, setAnchorDone] = useState(false);
  const [anchorKey, setAnchorKey]   = useState(0);
  const [anchorSetIdx, setAnchorSetIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const random = emergencyQuotes[Math.floor(Math.random() * emergencyQuotes.length)];
    // ✅ Set d'ancrage aléatoire différent à chaque ouverture
    const randomAnchorSet = Math.floor(Math.random() * ANCHOR_SETS_FR.length);
    setQuote(random);
    setAnchorSetIdx(randomAnchorSet);
    setPhase('quote');
    setActiveTab('breathing');
    setQuoteDisplayed(''); setQuoteDone(false); setAuthorDisplayed('');
    resetBreath(); resetGrounding(); resetWriting(); resetBodyscan(); resetViz();
    setAnchorDone(false); setAnchorKey(k => k + 1);
  }, [isOpen]);

  const resetBreath    = () => {
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setBreathPhaseIdx(0); setCycleCount(0); setBreathProgress(0); setBreathDone(false);
  };
  const resetGrounding  = () => { setGroundingStep(0); setGroundingDone(false); };
  const resetWriting    = () => { setWritingStep(0); setWritingAnswers(['', '', '', '']); setWritingDone(false); };
  const resetBodyscan   = () => { setBodyscanStep(0); setBodyscanDone(false); };
  const resetViz        = () => { setVizStep(0); setVizDone(false); };

  useEffect(() => {
    if (phase !== 'exercise') return;
    resetBreath(); resetGrounding(); resetWriting(); resetBodyscan(); resetViz();
  }, [activeTab]);

  useEffect(() => {
    if (phase === 'anchor') { setAnchorDone(false); setAnchorKey(k => k + 1); }
  }, [phase]);

  // Typewriter citation
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

  // Breathing timer
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
      const nextIdx  = (phaseIdx + 1) % BREATH_CYCLE.length;
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

  const currentBreath  = BREATH_CYCLE[breathPhaseIdx];
  const isExpanding    = currentBreath.phase === 'inhale' || currentBreath.phase === 'hold-in';
  const groundingSteps = isFr ? GROUNDING_FR : GROUNDING_EN;
  const writingPrompts = isFr ? WRITING_FR   : WRITING_EN;
  const bodyscanSteps  = isFr ? BODYSCAN_FR  : BODYSCAN_EN;
  const vizSteps       = isFr ? VISUALIZATION_FR : VISUALIZATION_EN;
  const anchorMessages = isFr
    ? ANCHOR_SETS_FR[anchorSetIdx] ?? ANCHOR_SETS_FR[0]
    : ANCHOR_SETS_EN[anchorSetIdx] ?? ANCHOR_SETS_EN[0];

  const TABS = [
    {
      id: 'breathing' as ExerciseTab,
      Icon: Wind,
      fr: 'Respiration',   en: 'Breathing',
      desc_fr: 'Cohérence cardiaque', desc_en: 'Cardiac coherence',
      premium: false,
    },
    {
      id: 'grounding' as ExerciseTab,
      Icon: Eye,
      fr: '5-4-3-2-1',    en: '5-4-3-2-1',
      desc_fr: 'Ancrage sensoriel', desc_en: 'Sensory grounding',
      premium: false,
    },
    {
      id: 'bodyscan' as ExerciseTab,
      Icon: Scan,
      fr: 'Scan corporel', en: 'Body scan',
      desc_fr: 'Relâche les tensions', desc_en: 'Release tension',
      premium: false,
    },
    {
      id: 'writing' as ExerciseTab,
      Icon: PenLine,
      fr: 'Écriture',      en: 'Writing',
      desc_fr: 'Exprime tes émotions', desc_en: 'Express your feelings',
      premium: true,
    },
    {
      id: 'visualization' as ExerciseTab,
      Icon: MapPin,
      fr: 'Lieu sûr',      en: 'Safe place',
      desc_fr: 'Visualisation guidée', desc_en: 'Guided visualization',
      premium: true,
    },
  ];

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
          style={{ color: R.veryDim, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          onMouseEnter={e => { e.currentTarget.style.color = R.text; e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = R.veryDim; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2 items-center z-10">
          {(['quote', 'exercise', 'anchor'] as Phase[]).map((p, i) => {
            const order = ['quote', 'exercise', 'anchor'];
            const isActive = phase === p;
            const isPast   = order.indexOf(phase) > i;
            return (
              <motion.div key={p} className="rounded-full" style={{ height: 5 }}
                animate={{
                  width: isActive ? 20 : 5,
                  backgroundColor: isActive ? R.accent : isPast ? 'rgba(251,113,133,0.40)' : 'rgba(255,255,255,0.15)',
                }}
                transition={{ duration: 0.4 }}
              />
            );
          })}
        </div>

        <div className="w-full max-w-sm px-6 flex items-center justify-center overflow-y-auto" style={{ maxHeight: '90vh' }}>
          <AnimatePresence mode="wait">

            {/* ── PHASE CITATION ─────────────────────────────────────────────── */}
            {phase === 'quote' && (
              <motion.div key="quote"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center w-full text-center gap-6 py-16"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1], boxShadow: [`0 0 0px ${R.glow}`, `0 0 24px ${R.glow}`, `0 0 0px ${R.glow}`] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(96,165,250,0.14)', border: '1.5px solid rgba(96,165,250,0.30)' }}
                >
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
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="text-xs italic font-light" style={{ color: R.veryDim }}>
                      {authorDisplayed}
                    </motion.p>
                  )}
                </div>

                <div style={{ opacity: quoteDone ? 1 : 0, transition: 'opacity 0.5s' }} className="w-full">
                  {quoteDone && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                      className="flex flex-col gap-3 w-full"
                    >
                      <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: R.text }}>
                        {isFr ? 'Choisis un exercice' : 'Choose an exercise'}
                      </p>
                      {TABS.map(({ id, Icon, fr, en, desc_fr, desc_en, premium }) => {
                        const isLocked = premium && !isPremium();
                        return (
                          <motion.button key={id}
                            onClick={() => handleExerciseSelect(id, premium)}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="relative flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left"
                            style={{ background: R.cardBg, border: `1.5px solid ${R.cardBorder}`, opacity: isLocked ? 0.7 : 1 }}
                          >
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: R.soft, border: `1px solid ${R.border}` }}>
                              <Icon className="w-4 h-4" style={{ color: R.accent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold" style={{ color: R.text }}>{isFr ? fr : en}</p>
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

            {/* ── PHASE EXERCICE ──────────────────────────────────────────────── */}
            {phase === 'exercise' && (
              <motion.div key={`exercise-${activeTab}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center w-full gap-5 py-16"
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

                  {/* BREATHING */}
                  {activeTab === 'breathing' && (
                    <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-5 w-full text-center"
                    >
                      {!breathDone ? (
                        <>
                          <p className="text-xs tracking-wider font-medium" style={{ color: R.dimText }}>
                            {isFr
                              ? `Cycle ${Math.min(cycleCount + 1, TOTAL_CYCLES)} / ${TOTAL_CYCLES}`
                              : `Cycle ${Math.min(cycleCount + 1, TOTAL_CYCLES)} / ${TOTAL_CYCLES}`}
                          </p>
                          <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                            <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(96,165,250,0.12)' }} />
                            <motion.div
                              animate={{ scale: isExpanding ? 1 : 0.52 }}
                              transition={{ duration: currentBreath.duration / 1000, ease: 'easeInOut' }}
                              className="absolute rounded-full"
                              style={{ width: 180, height: 180, background: R.circleBg, border: `1.5px solid ${R.circleBorder}`, boxShadow: `0 0 48px ${R.glow}` }}
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
                              style={{ width: `${breathProgress * 100}%`, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)', boxShadow: `0 0 8px ${R.glow}` }}
                            />
                          </div>
                          <p className="text-xs max-w-[200px] leading-relaxed" style={{ color: R.dimText }}>
                            {isFr ? 'Laisse ton souffle te guider' : 'Let your breath guide you'}
                          </p>
                        </>
                      ) : (
                        <ExerciseDone
                          message={isFr ? 'Bien respiré. Tu vas mieux.' : 'Well breathed. You feel better.'}
                          onContinue={() => setPhase('anchor')}
                          isFr={isFr} glow={R.glow}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* GROUNDING 5-4-3-2-1 */}
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
                            style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', boxShadow: `0 0 24px ${R.glow}` }}>
                            {groundingStep < groundingSteps.length - 1
                              ? (isFr ? 'Suivant →' : 'Next →')
                              : (isFr ? 'Terminé ✓' : 'Done ✓')}
                          </motion.button>
                        </>
                      ) : (
                        <ExerciseDone
                          message={isFr ? 'Tu es ancré dans le présent.' : 'You are grounded in the present.'}
                          onContinue={() => setPhase('anchor')}
                          isFr={isFr} glow={R.glow}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* BODY SCAN */}
                  {activeTab === 'bodyscan' && (
                    <motion.div key="bs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-5 w-full text-center"
                    >
                      {!bodyscanDone ? (
                        <>
                          <StepDots total={bodyscanSteps.length} current={bodyscanStep} />
                          <div style={{ minHeight: 280 }}>
                            <AnimatePresence mode="wait">
                              <motion.div key={bodyscanStep}
                                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.25 }}
                                className="flex flex-col items-center gap-4"
                              >
                                <div className="px-5 py-2 rounded-full"
                                  style={{ background: R.soft, border: `1px solid ${R.border}` }}>
                                  <p className="text-sm font-semibold tracking-wide" style={{ color: R.accent }}>
                                    {bodyscanSteps[bodyscanStep].zone}
                                  </p>
                                </div>
                                <p className="text-base leading-relaxed px-2" style={{ color: R.bodyText }}>
                                  {bodyscanSteps[bodyscanStep].instruction}
                                </p>
                                <p className="text-xs" style={{ color: R.dimText }}>
                                  {isFr ? 'Respire lentement pendant que tu explores cette zone' : 'Breathe slowly as you explore this area'}
                                </p>
                              </motion.div>
                            </AnimatePresence>
                          </div>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { if (bodyscanStep < bodyscanSteps.length - 1) setBodyscanStep(s => s + 1); else setBodyscanDone(true); }}
                            className="px-7 py-3 rounded-full text-white text-sm font-semibold"
                            style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', boxShadow: `0 0 24px ${R.glow}` }}>
                            {bodyscanStep < bodyscanSteps.length - 1
                              ? (isFr ? 'Suivant →' : 'Next →')
                              : (isFr ? 'Terminé ✓' : 'Done ✓')}
                          </motion.button>
                        </>
                      ) : (
                        <ExerciseDone
                          message={isFr ? 'Ton corps se détend. Tu es présent.' : 'Your body is relaxing. You are present.'}
                          onContinue={() => setPhase('anchor')}
                          isFr={isFr} glow={R.glow}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* WRITING */}
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
                                  style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.14)', color: R.bodyText, caretColor: R.accent }}
                                />
                              </motion.div>
                            </AnimatePresence>
                          </div>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { if (writingStep < writingPrompts.length - 1) setWritingStep(s => s + 1); else setWritingDone(true); }}
                            className="px-7 py-3 rounded-full text-white text-sm font-semibold"
                            style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', boxShadow: `0 0 24px ${R.glow}` }}>
                            {writingStep < writingPrompts.length - 1
                              ? (isFr ? 'Suivant →' : 'Next →')
                              : (isFr ? 'Terminer ✓' : 'Finish ✓')}
                          </motion.button>
                        </>
                      ) : (
                        <ExerciseDone
                          message={isFr ? "Merci de t'être confié. C'est du courage." : 'Thank you for opening up. That takes courage.'}
                          onContinue={() => setPhase('anchor')}
                          isFr={isFr} glow={R.glow}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* VISUALIZATION */}
                  {activeTab === 'visualization' && (
                    <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-5 w-full text-center"
                    >
                      {!vizDone ? (
                        <>
                          <StepDots total={vizSteps.length} current={vizStep} />
                          <div style={{ minHeight: 280 }}>
                            <AnimatePresence mode="wait">
                              <motion.div key={vizStep}
                                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.25 }}
                                className="flex flex-col items-center gap-4"
                              >
                                <div className="px-5 py-2 rounded-full"
                                  style={{ background: R.soft, border: `1px solid ${R.border}` }}>
                                  <p className="text-sm font-semibold tracking-wide" style={{ color: R.accent }}>
                                    {vizSteps[vizStep].step}
                                  </p>
                                </div>
                                <p className="text-base leading-relaxed px-2" style={{ color: R.bodyText }}>
                                  {vizSteps[vizStep].instruction}
                                </p>
                                <p className="text-xs" style={{ color: R.dimText }}>
                                  {isFr ? 'Laisse les images venir naturellement' : 'Let the images come naturally'}
                                </p>
                              </motion.div>
                            </AnimatePresence>
                          </div>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { if (vizStep < vizSteps.length - 1) setVizStep(s => s + 1); else setVizDone(true); }}
                            className="px-7 py-3 rounded-full text-white text-sm font-semibold"
                            style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', boxShadow: `0 0 24px ${R.glow}` }}>
                            {vizStep < vizSteps.length - 1
                              ? (isFr ? 'Suivant →' : 'Next →')
                              : (isFr ? 'Terminé ✓' : 'Done ✓')}
                          </motion.button>
                        </>
                      ) : (
                        <ExerciseDone
                          message={isFr ? 'Ton lieu sûr existe. Tu peux y revenir à tout moment.' : 'Your safe place exists. You can return there anytime.'}
                          onContinue={() => setPhase('anchor')}
                          isFr={isFr} glow={R.glow}
                        />
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>

                <button onClick={() => setPhase('anchor')}
                  className="text-xs mt-1 transition-colors" style={{ color: R.veryDim }}
                  onMouseEnter={e => (e.currentTarget.style.color = R.dimText)}
                  onMouseLeave={e => (e.currentTarget.style.color = R.veryDim)}>
                  {isFr ? "Passer à l'étape finale" : 'Skip to final step'}
                </button>
              </motion.div>
            )}

            {/* ── PHASE ANCRAGE ───────────────────────────────────────────────── */}
            {phase === 'anchor' && (
              <motion.div key="anchor"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center w-full text-center gap-6 py-16"
              >
                <motion.div
                  animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 0px rgba(74,222,128,0.2)', '0 0 24px rgba(74,222,128,0.3)', '0 0 0px rgba(74,222,128,0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(74,222,128,0.14)', border: '1.5px solid rgba(74,222,128,0.30)' }}
                >
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
                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 32px rgba(34,197,94,0.35)' }}
                  >
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

        <PremiumPaywall
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          trigger="exercise_locked"
        />
      </motion.div>
    </AnimatePresence>
  );
}