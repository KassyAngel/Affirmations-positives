import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';

/**
 * Bouton de reset — UNIQUEMENT en développement (import.meta.env.DEV).
 * Invisible en production.
 */
export function DevResetButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!import.meta.env.DEV) return null;

  const handleReset = () => {
    // Toutes les clés à effacer pour un reset complet
    const keysToRemove = [
      'onboarding_completed',
      'user_data',
      'app_theme',
      'app_language',
      // Clés liées au mood/streak/état utilisateur
      'user_state',
      'user-state',
      'mood_log',
      'moodLog',
      'streak',
      'last_visit',
      'lastVisit',
      'favorites',
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Effacer aussi toutes les clés qui contiennent "mood" ou "streak"
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (
        key.includes('mood') ||
        key.includes('streak') ||
        key.includes('state') ||
        key.includes('visit')
      ) {
        localStorage.removeItem(key);
      }
    });

    window.location.reload();
  };

  return (
    <>
      <motion.button
        onClick={() => setShowConfirm(true)}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
        title="DEV ONLY — Reset complet"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>RESET</span>
      </motion.button>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Dev Only</p>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">Reset complet ?</h3>
                  </div>
                </div>
                <button onClick={() => setShowConfirm(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Données supprimées</p>
                {['onboarding_completed', 'user_data', 'app_theme', 'user_state', 'mood + streak + visit'].map(key => (
                  <div key={key} className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <code className="text-xs text-slate-600">{key}</code>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}