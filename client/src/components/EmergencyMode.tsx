import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Wind } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import emergencyQuotes from '@/data/emergency-quotes.json';

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = 'quote' | 'breathing' | 'anchor' | 'done';
type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface EmergencyModeProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Breathing config (cohérence cardiaque 4-4-4-4) ──────────────────────────
const BREATH_CYCLE: { phase: BreathPhase; duration: number; labelFr: string; labelEn: string }[] = [
  { phase: 'inhale',   duration: 4000, labelFr: 'Inspire...',      labelEn: 'Inhale...' },
  { phase: 'hold-in',  duration: 4000, labelFr: 'Retiens...',      labelEn: 'Hold...' },
  { phase: 'exhale',   duration: 4000, labelFr: 'Expire...',       labelEn: 'Exhale...' },
  { phase: 'hold-out', duration: 4000, labelFr: 'Pause...',        labelEn: 'Pause...' },
];
const TOTAL_CYCLES = 3; // 3 cycles complets (~48 secondes)

// ─── Anchor messages ──────────────────────────────────────────────────────────
const ANCHOR_MESSAGES_FR = [
  "Tu es encore là.",
  "Tu as bien respiré.",
  "La tempête se calme.",
  "Tu es en sécurité maintenant.",
  "Tu mérites de prendre soin de toi.",
];
const ANCHOR_MESSAGES_EN = [
  "You are still here.",
  "You breathed well.",
  "The storm is calming.",
  "You are safe now.",
  "You deserve to take care of yourself.",
];

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 35, enabled = false) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, done };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function EmergencyMode({ isOpen, onClose }: EmergencyModeProps) {
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const [phase, setPhase] = useState<Phase>('quote');
  const [quote, setQuote] = useState(emergencyQuotes[0]);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [anchorIndex, setAnchorIndex] = useState(0);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pick a random quote on open
  useEffect(() => {
    if (isOpen) {
      const random = emergencyQuotes[Math.floor(Math.random() * emergencyQuotes.length)];
      setQuote(random);
      setPhase('quote');
      setBreathPhaseIndex(0);
      setCycleCount(0);
      setBreathProgress(0);
      setAnchorIndex(0);
    }
  }, [isOpen]);

  // Typewriter for quote
  const quoteText = isFr ? quote.content : quote.contentEn;
  const { displayed: displayedQuote, done: quoteDone } = useTypewriter(quoteText, 30, phase === 'quote' && isOpen);

  // Author typewriter (starts after quote)
  const { displayed: displayedAuthor } = useTypewriter(
    `— ${quote.author}`,
    50,
    quoteDone && phase === 'quote'
  );

  // ─── Anchor typewriter ───────────────────────────────────────────────────
  const anchorMessages = isFr ? ANCHOR_MESSAGES_FR : ANCHOR_MESSAGES_EN;
  const { displayed: displayedAnchor, done: anchorDone } = useTypewriter(
    anchorMessages[anchorIndex] ?? '',
    40,
    phase === 'anchor' && isOpen
  );

  // Avance les messages d'ancrage les uns après les autres
  useEffect(() => {
    if (phase !== 'anchor' || !anchorDone) return;
    if (anchorIndex < anchorMessages.length - 1) {
      const t = setTimeout(() => setAnchorIndex(i => i + 1), 900);
      return () => clearTimeout(t);
    }
  }, [anchorDone, anchorIndex, anchorMessages.length, phase]);

  // ─── Breathing logic ─────────────────────────────────────────────────────
  const startBreathTimer = useCallback((phaseIdx: number, cycle: number) => {
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    const currentBreath = BREATH_CYCLE[phaseIdx];
    const { duration } = currentBreath;

    // Progress bar
    let elapsed = 0;
    const tick = 50;
    progressTimerRef.current = setInterval(() => {
      elapsed += tick;
      setBreathProgress(Math.min(elapsed / duration, 1));
    }, tick);

    breathTimerRef.current = setTimeout(() => {
      const nextPhaseIdx = (phaseIdx + 1) % BREATH_CYCLE.length;
      const nextCycle = nextPhaseIdx === 0 ? cycle + 1 : cycle;

      if (nextCycle >= TOTAL_CYCLES && nextPhaseIdx === 0) {
        // Breathing done → anchor phase
        setPhase('anchor');
      } else {
        setBreathPhaseIndex(nextPhaseIdx);
        setCycleCount(nextCycle);
        setBreathProgress(0);
        startBreathTimer(nextPhaseIdx, nextCycle);
      }
    }, duration);
  }, []);

  useEffect(() => {
    if (phase === 'breathing') {
      startBreathTimer(0, 0);
    }
    return () => {
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [phase, startBreathTimer]);

  // ─── Breath circle scale ─────────────────────────────────────────────────
  const currentBreath = BREATH_CYCLE[breathPhaseIndex];
  const circleScale = currentBreath.phase === 'inhale' || currentBreath.phase === 'hold-in' ? 1 : 0.55;
  const circleLabel = isFr ? currentBreath.labelFr : currentBreath.labelEn;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="emergency-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 40%, #16213e 100%)' }}
      >
        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />

        {/* Pulsing ambient glow */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Phase indicator dots */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
          {(['quote', 'breathing', 'anchor'] as Phase[]).map((p, i) => (
            <motion.div
              key={p}
              className="rounded-full"
              style={{ width: 6, height: 6 }}
              animate={{
                backgroundColor: phase === p ? '#818cf8' : (
                  ['quote', 'breathing', 'anchor'].indexOf(phase) > i ? '#4ade80' : 'rgba(255,255,255,0.2)'
                ),
                scale: phase === p ? 1.4 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* ══════════════════════ PHASE 1 — CITATION ══════════════════════ */}
        <AnimatePresence mode="wait">
          {phase === 'quote' && (
            <motion.div
              key="phase-quote"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center px-8 max-w-sm w-full text-center gap-8"
            >
              {/* Icône */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
              >
                <span className="text-2xl">💙</span>
              </motion.div>

              {/* Citation machine à écrire */}
              <div className="space-y-4">
                <p className="text-white/90 text-xl font-light leading-relaxed tracking-wide min-h-[120px]"
                  style={{ fontFamily: "'Georgia', serif" }}>
                  "{displayedQuote}
                  {!quoteDone && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-5 bg-indigo-400 ml-0.5 align-middle"
                    />
                  )}"
                </p>
                {quoteDone && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/40 text-sm uppercase tracking-widest"
                  >
                    {displayedAuthor}
                  </motion.p>
                )}
              </div>

              {/* Bouton suivant */}
              {quoteDone && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  onClick={() => setPhase('breathing')}
                  className="px-8 py-3 rounded-full text-white font-medium text-sm tracking-wide transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
                >
                  {isFr ? 'Exercice de respiration →' : 'Breathing exercise →'}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ══════════════════════ PHASE 2 — RESPIRATION ══════════════════════ */}
          {phase === 'breathing' && (
            <motion.div
              key="phase-breathing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center px-8 max-w-sm w-full text-center gap-10"
            >
              <div className="space-y-1">
                <p className="text-white/40 text-xs uppercase tracking-widest">
                  {isFr ? 'Cohérence cardiaque' : 'Cardiac coherence'}
                </p>
                <p className="text-white/60 text-sm">
                  {isFr ? `Cycle ${Math.min(cycleCount + 1, TOTAL_CYCLES)} / ${TOTAL_CYCLES}` : `Cycle ${Math.min(cycleCount + 1, TOTAL_CYCLES)} / ${TOTAL_CYCLES}`}
                </p>
              </div>

              {/* Cercle de respiration */}
              <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(99,102,241,0.2)' }} />

                {/* Animated circle */}
                <motion.div
                  animate={{ scale: circleScale }}
                  transition={{ duration: currentBreath.duration / 1000, ease: currentBreath.phase === 'inhale' ? 'easeIn' : currentBreath.phase === 'exhale' ? 'easeOut' : 'linear' }}
                  className="absolute rounded-full"
                  style={{
                    width: 180, height: 180,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.3) 50%, rgba(99,102,241,0.1) 100%)',
                    border: '1px solid rgba(99,102,241,0.5)',
                    boxShadow: '0 0 40px rgba(99,102,241,0.3), inset 0 0 40px rgba(139,92,246,0.2)',
                  }}
                />

                {/* Label */}
                <div className="relative z-10 text-center">
                  <motion.p
                    key={circleLabel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white text-lg font-light tracking-wider"
                  >
                    {circleLabel}
                  </motion.p>
                  <p className="text-white/40 text-xs mt-1">
                    {currentBreath.duration / 1000}s
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${breathProgress * 100}%`,
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                  }}
                />
              </div>

              <p className="text-white/30 text-xs max-w-[220px] leading-relaxed">
                {isFr
                  ? 'Laisse ton souffle guider ton corps vers le calme.'
                  : 'Let your breath guide your body toward calm.'}
              </p>
            </motion.div>
          )}

          {/* ══════════════════════ PHASE 3 — ANCRAGE ══════════════════════ */}
          {phase === 'anchor' && (
            <motion.div
              key="phase-anchor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center justify-center px-8 max-w-sm w-full text-center gap-10"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}
              >
                <Heart className="w-7 h-7 text-green-400" />
              </motion.div>

              {/* Messages d'ancrage */}
              <div className="min-h-[140px] flex flex-col items-center justify-center gap-2">
                {anchorMessages.slice(0, anchorIndex + 1).map((msg, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: i === anchorIndex ? 1 : 0.3, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-white text-lg font-light leading-relaxed"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    {i === anchorIndex ? displayedAnchor : msg}
                  </motion.p>
                ))}
              </div>

              {/* Bouton "Je me sens mieux" */}
              {anchorIndex >= anchorMessages.length - 1 && anchorDone && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={onClose}
                  className="px-8 py-4 rounded-full text-white font-semibold text-base tracking-wide transition-all active:scale-95 flex items-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    boxShadow: '0 0 40px rgba(34,197,94,0.4)',
                  }}
                >
                  <span>💚</span>
                  <span>{isFr ? 'Je me sens mieux' : 'I feel better'}</span>
                </motion.button>
              )}

              {/* Skip anchor */}
              {anchorIndex < anchorMessages.length - 1 && (
                <button
                  onClick={onClose}
                  className="text-white/20 text-xs hover:text-white/40 transition-colors"
                >
                  {isFr ? 'Fermer' : 'Close'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}