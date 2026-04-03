import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Heart, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavedThought {
  id: string;
  text: string;
  createdAt: string;
}

interface InkParticle {
  id: number;
  char: string;
  x: number;
  y: number;
  opacity: number;
  blur: number;
  scale: number;
  vx: number;
  vy: number;
  delay: number;
}

interface ReleaseJournalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReleaseJournal({ isOpen, onClose }: ReleaseJournalProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();

  const [thought, setThought] = useState('');
  const [savedThoughts, setSavedThoughts] = useState<SavedThought[]>([]);
  const [burnedCount, setBurnedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inkParticles, setInkParticles] = useState<InkParticle[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [confirmingBurn, setConfirmingBurn] = useState<string | null>(null);
  const [showPositiveMessage, setShowPositiveMessage] = useState(false);
  const [currentPositiveMessage, setCurrentPositiveMessage] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('savedThoughts');
    const count = localStorage.getItem('burnedCount');
    if (saved) setSavedThoughts(JSON.parse(saved));
    if (count) setBurnedCount(parseInt(count));
  }, []);

  useEffect(() => {
    localStorage.setItem('savedThoughts', JSON.stringify(savedThoughts));
  }, [savedThoughts]);

  useEffect(() => {
    localStorage.setItem('burnedCount', burnedCount.toString());
  }, [burnedCount]);

  useEffect(() => {
    if (!isOpen) {
      setShowPositiveMessage(false);
      setIsAnimating(false);
      setInkParticles([]);
      setDisplayedText('');
      setIsTyping(false);
      if (animationRef.current) clearInterval(animationRef.current);
    }
  }, [isOpen]);

  // Typewriter effect
  useEffect(() => {
    if (!showPositiveMessage || !currentPositiveMessage || !isTyping) return;

    let index = 0;
    setDisplayedText('');

    const typingInterval = setInterval(() => {
      if (index < currentPositiveMessage.length) {
        setDisplayedText(currentPositiveMessage.substring(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [showPositiveMessage, currentPositiveMessage, isTyping]);

  const createInkParticles = (text: string): InkParticle[] => {
    const particles: InkParticle[] = [];
    const chars = text.split('');

    chars.forEach((char, index) => {
      if (char.trim()) {
        const lineApprox = Math.floor(index / 38);
        const charInLine = index % 38;

        const x = 8 + charInLine * 2.2;
        const y = 18 + lineApprox * 7;

        particles.push({
          id: index,
          char,
          x,
          y,
          opacity: 1,
          blur: 0,
          scale: 1,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.08,
          delay: index * 30,
        });
      }
    });

    return particles;
  };

  const animateInkDissolution = (particles: InkParticle[], messageToShow: string) => {
    setInkParticles(particles);
    const startTime = Date.now();
    let messageShown = false;

    animationRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (!messageShown && elapsed > 3800) {
        messageShown = true;
        setBurnedCount(prev => prev + 1);
        setCurrentPositiveMessage(messageToShow);
        setShowPositiveMessage(true);
        setIsTyping(true);
        setIsAnimating(false);
        setInkParticles([]);
        if (animationRef.current) clearInterval(animationRef.current);
        return;
      }

      setInkParticles(prev => {
        const updated = prev.map(particle => {
          if (elapsed < particle.delay) return particle;

          const timeSinceStart = elapsed - particle.delay;
          // Phase 1 (0-1200ms): légère dispersion
          // Phase 2 (1200-2500ms): dilution et flou
          // Phase 3 (2500+): disparition complète

          let newBlur = particle.blur;
          let newOpacity = particle.opacity;
          let newScale = particle.scale;
          let newVx = particle.vx;
          let newVy = particle.vy;

          if (timeSinceStart < 1200) {
            newBlur = timeSinceStart * 0.003;
            newOpacity = 1;
            newScale = 1 + timeSinceStart * 0.0003;
            newVx = particle.vx * 1.01;
            newVy = particle.vy * 1.01;
          } else if (timeSinceStart < 2600) {
            const t2 = (timeSinceStart - 1200) / 1400;
            newBlur = 0.4 + t2 * 6;
            newOpacity = 1 - t2 * 0.6;
            newScale = 1.04 + t2 * 0.5;
            newVx = particle.vx + (Math.random() - 0.5) * 0.04;
            newVy = particle.vy + (Math.random() - 0.5) * 0.02;
          } else {
            const t3 = (timeSinceStart - 2600) / 1000;
            newBlur = 6.4 + t3 * 8;
            newOpacity = Math.max(0, 0.4 - t3 * 0.45);
            newScale = 1.54 + t3 * 0.8;
            newVx = particle.vx + (Math.random() - 0.5) * 0.06;
            newVy = particle.vy - 0.02;
          }

          return {
            ...particle,
            x: particle.x + newVx,
            y: particle.y + newVy,
            vx: newVx,
            vy: newVy,
            blur: newBlur,
            opacity: newOpacity,
            scale: newScale,
          };
        }).filter(p => p.opacity > 0);

        if (updated.length === 0 && !messageShown) {
          messageShown = true;
          setBurnedCount(prev => prev + 1);
          setCurrentPositiveMessage(messageToShow);
          setShowPositiveMessage(true);
          setIsTyping(true);
          setIsAnimating(false);
          if (animationRef.current) clearInterval(animationRef.current);
        }

        return updated;
      });
    }, 16);
  };

  const handleBurn = () => {
    if (!thought.trim()) return;

    const messageToShow = t.releaseJournal.positiveMessages[
      Math.floor(Math.random() * t.releaseJournal.positiveMessages.length)
    ];

    const textToAnimate = thought;
    setThought('');
    setIsAnimating(true);

    const particles = createInkParticles(textToAnimate);
    animateInkDissolution(particles, messageToShow);
  };

  const handleSave = () => {
    if (!thought.trim()) return;

    const newThought: SavedThought = {
      id: Date.now().toString(),
      text: thought,
      createdAt: new Date().toISOString(),
    };

    setSavedThoughts(prev => [newThought, ...prev]);
    setThought('');

    toast({
      title: t.releaseJournal.saveButton,
      description: t.common.success,
      duration: 3000,
    });
  };

  const handleBurnSaved = (id: string) => {
    setConfirmingBurn(id);
  };

  const confirmBurnSaved = () => {
    if (!confirmingBurn) return;

    const thoughtToBurn = savedThoughts.find(s => s.id === confirmingBurn);
    if (!thoughtToBurn) return;

    setSavedThoughts(prev => prev.filter(s => s.id !== confirmingBurn));
    setConfirmingBurn(null);

    const messageToShow = t.releaseJournal.positiveMessages[
      Math.floor(Math.random() * t.releaseJournal.positiveMessages.length)
    ];

    setIsAnimating(true);
    const particles = createInkParticles(thoughtToBurn.text);
    animateInkDissolution(particles, messageToShow);
  };

  const handleClose = () => {
    setShowPositiveMessage(false);
    setIsAnimating(false);
    setInkParticles([]);
    if (animationRef.current) clearInterval(animationRef.current);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #faf4ed 0%, #f9e8e0 25%, #f5ddd5 50%, #f1d2ca 75%, #ecc7bf 100%)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-6 border-b backdrop-blur-sm"
          style={{
            background: 'rgba(250, 244, 237, 0.9)',
            borderColor: 'rgba(236, 199, 191, 0.3)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-display font-bold text-gray-800">
                {t.releaseJournal.title}
              </h2>
              <p className="text-sm mt-1 text-gray-600">
                {t.releaseJournal.subtitle}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full transition-all hover:bg-white/50 text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full inline-flex"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(236, 199, 191, 0.3)',
            }}
          >
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-gray-700">
              {burnedCount} {t.releaseJournal.burnedCount}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-6 py-6">

          {/* Formulaire */}
          {!showPositiveMessage && !isAnimating && (
            <>
              <div className="relative mb-6">
                <textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder={t.releaseJournal.placeholder}
                  className="w-full h-48 p-4 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition-all text-gray-800 placeholder-gray-400"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(236, 199, 191, 0.3)',
                  }}
                />
              </div>

              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleSave}
                  disabled={!thought.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderColor: 'rgba(236, 199, 191, 0.5)',
                  }}
                >
                  <Save className="w-4 h-4" />
                  <span>{t.releaseJournal.saveButton}</span>
                </button>

                <button
                  onClick={handleBurn}
                  disabled={!thought.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FF69B4 0%, #DA70D6 50%, #FFD700 100%)',
                    boxShadow: '0 4px 15px rgba(255, 105, 180, 0.5)',
                  }}
                >
                  <Heart className="w-4 h-4" />
                  <span className="font-medium">{t.releaseJournal.burnButton}</span>
                </button>
              </div>
            </>
          )}

          {/* ANIMATION ENCRE DANS L'EAU */}
          {isAnimating && (
            <div className="relative w-full mb-6">
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.85) 0%, rgba(224, 240, 255, 0.75) 100%)',
                  border: '1.5px solid rgba(180, 210, 240, 0.4)',
                  boxShadow: 'inset 0 2px 20px rgba(180, 210, 240, 0.3), 0 8px 32px rgba(180, 210, 240, 0.2)',
                  height: '200px',
                  padding: '16px',
                }}
              >
                {/* Vague de fond subtile */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      'radial-gradient(ellipse at 30% 60%, rgba(180,220,255,0.18) 0%, transparent 60%), ' +
                      'radial-gradient(ellipse at 70% 40%, rgba(200,180,255,0.12) 0%, transparent 50%)',
                    pointerEvents: 'none',
                  }}
                />

                <div className="text-center mb-2">
                  <p className="text-xs font-medium text-blue-300/70 italic tracking-widest uppercase">
                    Laissez partir…
                  </p>
                </div>

                <div className="relative h-36">
                  {inkParticles.map(particle => (
                    <div
                      key={particle.id}
                      className="absolute select-none pointer-events-none"
                      style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        opacity: particle.opacity,
                        transform: `scale(${particle.scale})`,
                        filter: `blur(${particle.blur}px)`,
                        fontSize: '18px',
                        color: '#5b8db8',
                        fontFamily: 'Georgia, serif',
                        fontWeight: '400',
                        letterSpacing: '0.02em',
                        willChange: 'transform, opacity, filter',
                        transition: 'none',
                      }}
                    >
                      {particle.char}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MESSAGE POSITIF avec effet machine à écrire */}
          {showPositiveMessage && (
            <div
              className="mb-6 p-8 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 240, 0.95) 100%)',
                border: '2px solid rgba(255, 182, 193, 0.4)',
                boxShadow: '0 12px 40px rgba(255, 182, 193, 0.3)',
                animation: 'slideInScale 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                minHeight: '200px',
              }}
            >
              <div className="relative flex flex-col items-center text-center w-full">
                {/* Guillemet ouvrant */}
                <span
                  className="absolute -top-4 left-2 leading-none select-none pointer-events-none"
                  style={{
                    fontSize: '90px',
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #FF69B4 0%, #DA70D6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: 0.3,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  &ldquo;
                </span>

                <p
                  className="leading-relaxed px-10 pt-6 pb-6 min-h-[5rem]"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: '1.6rem',
                    color: '#4a3f3f',
                    letterSpacing: '0.01em',
                    lineHeight: '1.6',
                  }}
                >
                  {displayedText}
                  {isTyping && <span className="animate-pulse ml-1" style={{ fontStyle: 'normal' }}>|</span>}
                </p>

                {/* Guillemet fermant */}
                <span
                  className="absolute -bottom-6 right-2 leading-none select-none pointer-events-none"
                  style={{
                    fontSize: '90px',
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #DA70D6 0%, #FFD700 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: 0.3,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  &rdquo;
                </span>

                <button
                  onClick={() => setShowPositiveMessage(false)}
                  disabled={isTyping}
                  className="mt-2 mb-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-white/90 active:scale-95 disabled:opacity-50 text-gray-700"
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(236, 199, 191, 0.4)',
                  }}
                >
                  {t.common.close}
                </button>
              </div>
            </div>
          )}

          {/* Pensées sauvegardées */}
          {savedThoughts.length > 0 && !showPositiveMessage && !isAnimating && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(236, 199, 191, 0.3)',
              }}
            >
              <button
                onClick={() => setShowSaved(!showSaved)}
                className="w-full px-4 py-3 flex items-center justify-between transition-colors hover:bg-white/30"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">
                    {t.releaseJournal.savedThoughts}
                  </span>
                  <span
                    className="text-sm px-2 py-1 rounded-full text-gray-700"
                    style={{ background: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {savedThoughts.length}
                  </span>
                </div>
                {showSaved ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {showSaved && (
                <div
                  className="border-t divide-y"
                  style={{ borderColor: 'rgba(236, 199, 191, 0.3)' }}
                >
                  {savedThoughts.map(saved => (
                    <div
                      key={saved.id}
                      className="p-4"
                      style={{ background: 'rgba(255, 255, 255, 0.3)' }}
                    >
                      <p className="text-sm mb-3 whitespace-pre-wrap text-gray-800">
                        {saved.text}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {new Date(saved.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleBurnSaved(saved.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all active:scale-95 text-white"
                          style={{
                            background: 'linear-gradient(135deg, #FF69B4 0%, #DA70D6 100%)',
                            boxShadow: '0 2px 8px rgba(255, 105, 180, 0.4)',
                          }}
                        >
                          <Heart className="w-3 h-3" />
                          {t.releaseJournal.burnButton}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {savedThoughts.length === 0 && !showPositiveMessage && !isAnimating && (
            <div
              className="text-center py-8 px-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(236, 199, 191, 0.3)',
              }}
            >
              <p className="font-medium mb-1 text-gray-800">
                {t.releaseJournal.emptyState}
              </p>
              <p className="text-sm text-gray-600">
                {t.releaseJournal.emptyStateSubtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      {confirmingBurn && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
          <div
            className="max-w-sm mx-4 p-6 rounded-2xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #faf4ed 0%, #f5ddd5 100%)',
            }}
          >
            <h3 className="text-lg font-bold mb-2 text-gray-800">
              {t.releaseJournal.confirmBurn}
            </h3>
            <p className="text-sm mb-6 text-gray-600">
              {t.releaseJournal.confirmBurnMessage}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingBurn(null)}
                className="flex-1 px-4 py-2 rounded-full border transition-all active:scale-95 text-gray-700"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(236, 199, 191, 0.5)',
                }}
              >
                {t.releaseJournal.cancel}
              </button>
              <button
                onClick={confirmBurnSaved}
                className="flex-1 px-4 py-2 rounded-full transition-all active:scale-95 text-white"
                style={{
                  background: 'linear-gradient(135deg, #FF69B4 0%, #DA70D6 100%)',
                }}
              >
                {t.releaseJournal.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&display=swap');

        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}