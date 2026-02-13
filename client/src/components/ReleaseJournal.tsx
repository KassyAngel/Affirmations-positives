import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Flame, Save, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavedThought {
  id: string;
  text: string;
  createdAt: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  color: string;
  type: 'flame' | 'spark' | 'smoke' | 'ash';
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
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [confirmingBurn, setConfirmingBurn] = useState<string | null>(null);
  const [showPositiveMessage, setShowPositiveMessage] = useState(false);
  const [currentPositiveMessage, setCurrentPositiveMessage] = useState('');

  // Charger les données depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedThoughts');
    const count = localStorage.getItem('burnedCount');
    if (saved) setSavedThoughts(JSON.parse(saved));
    if (count) setBurnedCount(parseInt(count));
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('savedThoughts', JSON.stringify(savedThoughts));
  }, [savedThoughts]);

  useEffect(() => {
    localStorage.setItem('burnedCount', burnedCount.toString());
  }, [burnedCount]);

  const createIntenseBurningParticles = () => {
    const newParticles: Particle[] = [];

    // ÉNORMES FLAMMES CENTRALES (40 au lieu de 20)
    for (let i = 0; i < 40; i++) {
      const baseX = 35 + Math.random() * 30;
      newParticles.push({
        id: Date.now() + i,
        x: baseX,
        y: 55 + Math.random() * 15,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 6 - 3, // Monte TRÈS rapidement
        opacity: 1,
        size: Math.random() * 25 + 15, // BEAUCOUP plus grosses
        color: ['#ff0000', '#ff4500', '#ff6347', '#ffa500', '#ffff00'][Math.floor(Math.random() * 5)],
        type: 'flame'
      });
    }

    // ÉTINCELLES EXPLOSIVES (30 au lieu de 15)
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: Date.now() + 100 + i,
        x: 50 + (Math.random() - 0.5) * 40,
        y: 50 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 6, // Plus rapide
        vy: -Math.random() * 7 - 3,
        opacity: 1,
        size: Math.random() * 6 + 3, // Plus grosses
        color: '#ffeb3b',
        type: 'spark'
      });
    }

    // FUMÉE ÉPAISSE ET DENSE (25 au lieu de 10)
    for (let i = 0; i < 25; i++) {
      newParticles.push({
        id: Date.now() + 200 + i,
        x: 35 + Math.random() * 30,
        y: 35 + Math.random() * 25,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 3 - 1,
        opacity: 0.8, // Plus opaque
        size: Math.random() * 35 + 25, // ÉNORME fumée
        color: ['#808080', '#696969', '#a9a9a9'][Math.floor(Math.random() * 3)],
        type: 'smoke'
      });
    }

    // CENDRES VOLANTES (15 nouvelles)
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: Date.now() + 300 + i,
        x: 40 + Math.random() * 20,
        y: 50 + Math.random() * 15,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 2 - 0.5,
        opacity: 0.6,
        size: Math.random() * 4 + 2,
        color: '#4a4a4a',
        type: 'ash'
      });
    }

    setParticles(newParticles);
  };

  const animateParticles = () => {
    const animationInterval = setInterval(() => {
      setParticles(prev => {
        const updated = prev.map(p => {
          if (p.type === 'flame') {
            return {
              ...p,
              x: p.x + p.vx + (Math.random() - 0.5) * 1.5, // Vacillement intense
              y: p.y + p.vy,
              vy: p.vy - 0.15, // Accélère vers le haut
              opacity: p.opacity - 0.02,
              size: p.size * 0.97
            };
          } else if (p.type === 'spark') {
            return {
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy + 0.25, // Gravité
              opacity: p.opacity - 0.03,
              size: p.size * 0.99
            };
          } else if (p.type === 'smoke') {
            return {
              ...p,
              x: p.x + p.vx + (Math.random() - 0.5) * 0.3,
              y: p.y + p.vy,
              opacity: p.opacity - 0.012,
              size: p.size * 1.03 // Grandit beaucoup
            };
          } else { // ash
            return {
              ...p,
              x: p.x + p.vx + (Math.random() - 0.5) * 0.2,
              y: p.y + p.vy,
              vy: p.vy + 0.05,
              opacity: p.opacity - 0.018
            };
          }
        }).filter(p => p.opacity > 0 && p.y > -30);

        if (updated.length === 0) {
          clearInterval(animationInterval);
          setIsAnimating(false);
        }

        return updated;
      });
    }, 25); // Plus rapide pour plus de fluidité
  };

  const showPositiveMessageCard = (message: string) => {
    setCurrentPositiveMessage(message);
    setShowPositiveMessage(true);

    setTimeout(() => {
      setShowPositiveMessage(false);
    }, 6000);
  };

  const handleBurn = () => {
    if (!thought.trim()) return;

    setIsAnimating(true);
    createIntenseBurningParticles();
    animateParticles();

    setTimeout(() => {
      setThought('');
      setBurnedCount(prev => prev + 1);

      const messages = t.releaseJournal.positiveMessages;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      showPositiveMessageCard(randomMessage);
    }, 2000); // Plus long pour voir l'animation complète
  };

  const handleSave = () => {
    if (!thought.trim()) return;

    const newThought: SavedThought = {
      id: Date.now().toString(),
      text: thought,
      createdAt: new Date().toISOString()
    };

    setSavedThoughts(prev => [newThought, ...prev]);
    setThought('');

    toast({
      title: '💾 ' + t.releaseJournal.saveButton,
      description: t.common.success,
      duration: 3000,
    });
  };

  const handleBurnSaved = (id: string) => {
    setConfirmingBurn(id);
  };

  const confirmBurnSaved = () => {
    if (!confirmingBurn) return;

    setSavedThoughts(prev => prev.filter(t => t.id !== confirmingBurn));
    setBurnedCount(prev => prev + 1);
    setConfirmingBurn(null);

    const messages = t.releaseJournal.positiveMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    showPositiveMessageCard(randomMessage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #faf4ed 0%, #f9e8e0 25%, #f5ddd5 50%, #f1d2ca 75%, #ecc7bf 100%)'
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 z-10 px-6 py-6 border-b backdrop-blur-sm"
          style={{
            background: 'rgba(250, 244, 237, 0.9)',
            borderColor: 'rgba(236, 199, 191, 0.3)'
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
              onClick={onClose}
              className="p-2 rounded-full transition-all hover:bg-white/50 text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Compteur */}
          <div 
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full inline-flex"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(236, 199, 191, 0.3)'
            }}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">
              {burnedCount} {t.releaseJournal.burnedCount}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-6 py-6">
          {/* Zone d'écriture */}
          <div className="relative mb-6">
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder={t.releaseJournal.placeholder}
              className="w-full h-48 p-4 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition-all text-gray-800 placeholder-gray-400"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(236, 199, 191, 0.3)',
                opacity: isAnimating ? 0.2 : 1,
                transform: isAnimating ? 'scale(0.92)' : 'scale(1)',
                transition: 'all 0.8s ease'
              }}
            />

            {/* PARTICULES DE FEU INTENSES */}
            {isAnimating && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {particles.map(particle => (
                  <div
                    key={particle.id}
                    className="absolute"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      width: `${particle.size}px`,
                      height: `${particle.size}px`,
                      backgroundColor: particle.color,
                      opacity: particle.opacity,
                      borderRadius: particle.type === 'smoke' ? '50%' : particle.type === 'spark' ? '50%' : particle.type === 'ash' ? '50%' : '45%',
                      boxShadow: particle.type === 'flame' 
                        ? `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 1.5}px ${particle.color}` 
                        : particle.type === 'spark'
                        ? `0 0 ${particle.size * 2}px #ffeb3b, 0 0 ${particle.size}px #ffffff`
                        : 'none',
                      filter: particle.type === 'smoke' ? 'blur(12px)' : particle.type === 'flame' ? 'blur(3px)' : particle.type === 'ash' ? 'blur(1px)' : 'none',
                      mixBlendMode: particle.type === 'flame' || particle.type === 'spark' ? 'screen' : 'normal',
                      transition: 'all 0.025s linear'
                    }}
                  />
                ))}

                {/* LUEUR DE BASE DU FEU */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at 50% 60%, rgba(255, 69, 0, 0.4) 0%, rgba(255, 140, 0, 0.2) 30%, transparent 60%)',
                    animation: 'fireGlow 0.5s ease-in-out infinite alternate'
                  }}
                />
              </div>
            )}
          </div>

          {/* MESSAGE POSITIF - INTÉGRÉ AU DESIGN */}
          {showPositiveMessage && (
            <div 
              className="mb-6 p-6 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 240, 0.9) 100%)',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 8px 32px rgba(255, 193, 7, 0.2)',
                animation: 'slideInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="p-3 rounded-2xl flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #ffd93d 0%, #ff8e53 50%, #ff6b9d 100%)',
                    boxShadow: '0 4px 12px rgba(255, 217, 61, 0.4)'
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-800 leading-relaxed">
                    {currentPositiveMessage}
                  </p>
                  <button
                    onClick={() => setShowPositiveMessage(false)}
                    className="mt-3 px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:bg-white/80 text-gray-600"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(236, 199, 191, 0.3)'
                    }}
                  >
                    {t.common.close}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleSave}
              disabled={!thought.trim() || isAnimating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(236, 199, 191, 0.5)'
              }}
            >
              <Save className="w-4 h-4" />
              <span>{t.releaseJournal.saveButton}</span>
            </button>

            <button
              onClick={handleBurn}
              disabled={!thought.trim() || isAnimating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #ffd93d 100%)',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
              }}
            >
              <Flame className="w-4 h-4" />
              <span className="font-medium">{t.releaseJournal.burnButton}</span>
            </button>
          </div>

          {/* Pensées sauvegardées */}
          {savedThoughts.length > 0 && (
            <div 
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(236, 199, 191, 0.3)'
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
                <div className="border-t divide-y" style={{ borderColor: 'rgba(236, 199, 191, 0.3)' }}>
                  {savedThoughts.map((saved) => (
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
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
                          }}
                        >
                          <Flame className="w-3 h-3" />
                          {t.releaseJournal.burnButton}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {savedThoughts.length === 0 && (
            <div 
              className="text-center py-8 px-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(236, 199, 191, 0.3)'
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

      {/* Confirmation de suppression */}
      {confirmingBurn && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
          <div 
            className="max-w-sm mx-4 p-6 rounded-2xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #faf4ed 0%, #f5ddd5 100%)'
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
                  borderColor: 'rgba(236, 199, 191, 0.5)'
                }}
              >
                {t.releaseJournal.cancel}
              </button>
              <button
                onClick={confirmBurnSaved}
                className="flex-1 px-4 py-2 rounded-full transition-all active:scale-95 text-white"
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
                }}
              >
                {t.releaseJournal.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fireGlow {
          from {
            opacity: 0.6;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}