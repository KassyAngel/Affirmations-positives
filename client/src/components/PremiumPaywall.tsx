import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Zap, Star, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium, type PremiumPlan } from '@/hooks/use-premium';
import { useState } from 'react';

interface PremiumPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'quote_limit' | 'category_locked' | 'theme_locked' | 'exercise_locked';
}

export function PremiumPaywall({ isOpen, onClose, trigger = 'quote_limit' }: PremiumPaywallProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { setPremium } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>('yearly');
  const isFr = language === 'fr';

  const plans = [
    {
      id: 'monthly' as PremiumPlan,
      name: isFr ? 'Mensuel' : 'Monthly',
      price: '4,99€',
      period: isFr ? '/mois' : '/month',
      savings: null,
      popular: false,
    },
    {
      id: 'yearly' as PremiumPlan,
      name: isFr ? 'Annuel' : 'Yearly',
      price: '29,99€',
      period: isFr ? '/an' : '/year',
      savings: isFr ? 'Économisez 40%' : 'Save 40%',
      popular: true,
    },
    {
      id: 'lifetime' as PremiumPlan,
      name: isFr ? 'À vie' : 'Lifetime',
      price: '69,99€',
      period: isFr ? 'paiement unique' : 'one-time',
      savings: isFr ? 'Meilleure valeur' : 'Best value',
      popular: false,
    },
  ];

  const features = [
    {
      icon: Zap,
      title: isFr ? 'Citations illimitées' : 'Unlimited quotes',
      description: isFr ? 'Accès illimité toute la journée' : 'Unlimited access all day',
    },
    {
      icon: Star,
      title: isFr ? 'Toutes les catégories' : 'All categories',
      description: isFr ? '8 catégories exclusives' : '8 exclusive categories',
    },
    {
      icon: Heart,
      title: isFr ? '3 exercices SOS' : '3 SOS exercises',
      description: isFr ? 'Respiration + Ancrage + Écriture' : 'Breathing + Grounding + Writing',
    },
    {
      icon: Sparkles,
      title: isFr ? '15+ thèmes premium' : '15+ premium themes',
      description: isFr ? 'Fonds d\'écran exclusifs' : 'Exclusive wallpapers',
    },
  ];

  const handlePurchase = () => {
    // TODO: Integrate Google Play Billing here
    setPremium(selectedPlan);
    onClose();

    // Show success toast
    alert(isFr ? '🎉 Bienvenue en Premium !' : '🎉 Welcome to Premium!');
  };

  const triggerMessages = {
    quote_limit: {
      title: isFr ? '✨ Vous aimez ces citations ?' : '✨ Loving these quotes?',
      subtitle: isFr ? 'Passez Premium pour continuer à vous inspirer' : 'Go Premium to keep inspiring yourself',
    },
    category_locked: {
      title: isFr ? '🔒 Catégorie Premium' : '🔒 Premium Category',
      subtitle: isFr ? 'Débloquez toutes les catégories avec Premium' : 'Unlock all categories with Premium',
    },
    theme_locked: {
      title: isFr ? '🎨 Thème Premium' : '🎨 Premium Theme',
      subtitle: isFr ? 'Accédez à 15+ thèmes exclusifs' : 'Access 15+ exclusive themes',
    },
    exercise_locked: {
      title: isFr ? '🧘 Exercice Premium' : '🧘 Premium Exercise',
      subtitle: isFr ? 'Débloquez tous les exercices d\'urgence' : 'Unlock all emergency exercises',
    },
  };

  const message = triggerMessages[trigger];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden z-[201]"
          style={{
            background: theme.bgClass === 'bg-black' 
              ? 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%)'
              : 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', // ✅ Fond sombre pour TOUS les thèmes
            maxHeight: '90vh',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <X className="w-5 h-5" style={{ color: theme.textClass === 'text-white' ? '#fff' : '#000' }} />
          </button>

          <div className="overflow-y-auto max-h-[90vh] pb-safe">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)',
                }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-2 text-white">
                {message.title}
              </h2>
              <p className="text-sm text-slate-300">
                {message.subtitle}
              </p>
            </div>

            {/* Features */}
            <div className="px-6 pb-6 space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)', // ✅ Fond sombre semi-transparent
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {feature.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                  <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#10b981' }} />
                </motion.div>
              ))}
            </div>

            {/* Plans */}
            <div className="px-6 pb-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-center mb-4 text-slate-400">
                {isFr ? 'Choisissez votre plan' : 'Choose your plan'}
              </p>

              {plans.map((plan) => (
                <motion.button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full p-4 rounded-xl transition-all"
                  style={{
                    background: selectedPlan === plan.id
                      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)'
                      : 'rgba(255,255,255,0.05)', // ✅ Fond sombre pour tous
                    border: selectedPlan === plan.id
                      ? '2px solid #fbbf24'
                      : '2px solid transparent',
                  }}
                >
                  {plan.popular && (
                    <div 
                      className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
                    >
                      {isFr ? 'POPULAIRE' : 'POPULAR'}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-left">
                      <p className="text-base font-bold text-white">
                        {plan.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {plan.price} {plan.period}
                      </p>
                      {plan.savings && (
                        <p className="text-xs font-semibold mt-1" style={{ color: '#10b981' }}>
                          {plan.savings}
                        </p>
                      )}
                    </div>
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: selectedPlan === plan.id ? '#fbbf24' : 'transparent',
                        border: `2px solid ${selectedPlan === plan.id ? '#fbbf24' : 'rgba(128,128,128,0.3)'}`,
                      }}
                    >
                      {selectedPlan === plan.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* CTA */}
            <div className="px-6 pb-8">
              <motion.button
                onClick={handlePurchase}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl text-white font-bold text-base shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  boxShadow: '0 8px 32px rgba(251, 191, 36, 0.4)',
                }}
              >
                <span>{isFr ? '✨ Débloquer Premium' : '✨ Unlock Premium'}</span>
              </motion.button>

              <p className="text-center text-xs mt-3 text-slate-400">
                {isFr ? '7 jours gratuits sur l\'abonnement annuel' : '7 days free on yearly subscription'}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}