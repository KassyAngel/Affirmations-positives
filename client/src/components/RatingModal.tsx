import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kcdev.affirmationspositives';

interface RatingModalProps {
  isOpen: boolean;
  onRated: () => void;
  onDismiss: () => void;
}

export function RatingModal({ isOpen, onRated, onDismiss }: RatingModalProps) {
  const { language } = useLanguage();
  const isFr = language === 'fr';
  const [hovered, setHovered] = useState(0);

  const handleRate = () => {
    window.open(PLAY_STORE_URL, '_blank');
    onRated();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md mx-4 mb-8 rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,250,248,0.99)',
              boxShadow: '0 -4px 40px rgba(255,140,105,0.18), 0 20px 60px rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,140,105,0.15)',
            }}
          >
            {/* Bouton fermer */}
            <div className="flex justify-end pt-4 pr-4">
              <button
                onClick={onDismiss}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,140,105,0.1)' }}
              >
                <X className="w-4 h-4" style={{ color: '#B07060' }} />
              </button>
            </div>

            <div className="px-6 pb-8 flex flex-col items-center text-center">

              {/* Emoji */}
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                className="text-5xl mb-4 leading-none"
              >
                ✨
              </motion.div>

              {/* Titre */}
              <h2 className="text-xl font-bold mb-2" style={{ color: '#2D1A12' }}>
                {isFr ? 'Vous aimez l\'appli ?' : 'Enjoying the app?'}
              </h2>

              {/* Sous-titre */}
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#B07060' }}>
                {isFr
                  ? 'Votre avis aide d\'autres personnes à découvrir l\'app et nous motive à continuer 🙏'
                  : 'Your review helps others discover the app and motivates us to keep going 🙏'}
              </p>

              {/* Étoiles interactives */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={handleRate}
                    style={{ lineHeight: 1 }}
                  >
                    <Star
                      className="w-9 h-9 transition-colors"
                      style={{
                        color: star <= (hovered || 5) ? '#FF8C69' : '#E8D0C4',
                        fill: star <= (hovered || 5) ? '#FF8C69' : 'none',
                        transition: 'color 0.15s, fill 0.15s',
                      }}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Bouton principal */}
              <motion.button
                onClick={handleRate}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl text-white font-bold text-base mb-3"
                style={{
                  background: 'linear-gradient(135deg, #FF8C69 0%, #FFA882 100%)',
                  boxShadow: '0 6px 24px rgba(255,140,105,0.4)',
                }}
              >
                {isFr ? '⭐ Noter sur le Play Store' : '⭐ Rate on Play Store'}
              </motion.button>

              {/* Lien discret "Plus tard" */}
              <button
                onClick={onDismiss}
                className="text-sm py-2"
                style={{ color: 'rgba(176,112,96,0.6)' }}
              >
                {isFr ? 'Plus tard' : 'Maybe later'}
              </button>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}