import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme, type ThemeId } from '@/contexts/ThemeContext';
import { languages } from '@/locales';
import { notificationService } from '@/services/notification-service';
import {
  Settings, Check, Bell, Globe, LayoutGrid,
  Star, PenLine, FileText, Shield, X, ChevronRight,
} from 'lucide-react';
import { NotificationStep } from '@/components/onboarding/NotificationStep';
import { WidgetStep } from '@/components/onboarding/WidgetStep';
import { SubmitQuotePanel } from '@/components/SubmitQuotePanel';

const LIGHT_THEMES: ThemeId[] = [
  'minimaliste-1', 'minimaliste-2', 'minimaliste-3',
  'minimaliste-5', 'minimaliste-6', 'minimaliste-7',
  'minimaliste-8', 'zen-cascademinimaliste',
];

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.kcdev.affirmationspositives';

type Panel = 'menu' | 'notifications' | 'widget' | 'submit' | 'language';

export function SettingsMenu() {
  const { language, setLanguage } = useLanguage();
  const { themeId } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [panel, setPanel]   = useState<Panel>('menu');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const close = () => { setIsOpen(false); setTimeout(() => setPanel('menu'), 300); };

  const isLightTheme = LIGHT_THEMES.includes(themeId);
  const isFr = language === 'fr';

  const btnStyle = isLightTheme
    ? { background: 'rgba(0,0,0,0.07)', border: '1.5px solid rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)' }
    : { background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(12px)' };

  const accent   = '#FF8C69';
  const textMain = '#2D1A12';
  const textSub  = '#B07060';
  const rowHover = 'rgba(255,140,105,0.07)';

  const menuRows = [
    {
      icon: Bell, label: isFr ? 'Notifications' : 'Notifications',
      sub: isFr ? 'Modifier la fréquence et les horaires' : 'Edit frequency and schedule',
      action: () => setPanel('notifications'), badge: false,
    },
    {
      icon: Globe, label: isFr ? 'Langue' : 'Language',
      sub: language === 'fr' ? 'Français' : 'English',
      action: () => setPanel('language'), badge: false,
    },
    {
      icon: LayoutGrid, label: 'Widget',
      sub: isFr ? "Ajouter à l'écran d'accueil" : 'Add to home screen',
      action: () => setPanel('widget'), badge: false,
    },
    {
      icon: PenLine, label: isFr ? 'Ajouter les vôtres' : 'Submit your own',
      sub: isFr ? 'Proposer une citation ou affirmation' : 'Suggest a quote or affirmation',
      action: () => setPanel('submit'), badge: false,
    },
    {
      icon: Star, label: isFr ? 'Laisser un avis' : 'Leave a review',
      sub: isFr ? 'Votre avis compte beaucoup !' : 'Your feedback matters!',
      action: () => { window.open(PLAY_STORE_URL, '_blank'); close(); },
      badge: true,
    },
  ] as const;

  const legalRows = isFr
    ? [
        { label: 'Mentions légales', href: '/mentions-legales-fr.html',          icon: FileText },
        { label: 'Confidentialité',  href: '/politique-confidentialite-fr.html',  icon: Shield  },
      ]
    : [
        { label: 'Legal Notice',    href: '/mentions-legales-en.html',            icon: FileText },
        { label: 'Privacy Policy',  href: '/politique-confidentialite-en.html',   icon: Shield  },
      ];

  // ✅ 78vh + paddingBottom min 40px → fonctionne sur Samsung gesture nav
  const panelMaxHeight = 'calc(78vh - env(safe-area-inset-bottom, 0px))';
  const scrollMaxHeight = 'calc(78vh - env(safe-area-inset-bottom, 0px) - 40px)';

  return (
    <div ref={menuRef} className="relative">

      <motion.button
        onClick={() => { setPanel('menu'); setIsOpen(true); }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Paramètres"
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
        style={btnStyle}
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.25 }}>
          <Settings className="w-4 h-4" style={{ color: isLightTheme ? '#2D1A12' : 'white' }} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.55)' }}
              onClick={close}
            />

            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{
                background: 'rgba(255,250,248,0.98)',
                maxHeight: panelMaxHeight,
                boxShadow: '0 -8px 40px rgba(255,140,105,0.15)',
                // ✅ min 40px garanti pour Samsung sans safe-area
                paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 40px)',
              }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,140,105,0.3)' }} />
              </div>

              <AnimatePresence mode="wait">

                {panel === 'menu' && (
                  <motion.div key="menu"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}
                    className="overflow-y-auto"
                    style={{ maxHeight: scrollMaxHeight }}
                  >
                    <div className="flex items-center justify-between px-6 py-4">
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: textMain }}>
                          {isFr ? 'Paramètres' : 'Settings'}
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: textSub }}>Kc Dev © 2026</p>
                      </div>
                      <button onClick={close}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,140,105,0.1)' }}>
                        <X className="w-4 h-4" style={{ color: accent }} />
                      </button>
                    </div>

                    {/* ✅ pb-16 pour que Confidentialité ne soit pas coupé */}
                    <div className="px-4 pb-16 space-y-1">
                      {menuRows.map(row => {
                        const Icon = row.icon;
                        return (
                          <motion.button key={row.label} onClick={row.action} whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors text-left"
                            style={{ background: rowHover }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,140,105,0.12)')}
                            onMouseLeave={e => (e.currentTarget.style.background = rowHover)}
                          >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{
                                background: row.badge
                                  ? 'linear-gradient(135deg,#FFF3CC,#FFE484)'
                                  : 'linear-gradient(135deg,#FFF0EA,#FFE4D9)',
                              }}>
                              <Icon className="w-5 h-5" style={{ color: row.badge ? '#E8A020' : accent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold" style={{ color: textMain }}>{row.label}</p>
                              <p className="text-xs mt-0.5 truncate" style={{ color: textSub }}>{row.sub}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'rgba(176,112,96,0.4)' }} />
                          </motion.button>
                        );
                      })}

                      <div className="pt-3 pb-1 px-2">
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
                          {isFr ? 'Légal' : 'Legal'}
                        </p>
                      </div>
                      {legalRows.map(({ label, href, icon: Icon }) => (
                        <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                          onClick={close}
                          className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors"
                          style={{ textDecoration: 'none' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = rowHover)}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(255,140,105,0.07)' }}>
                            <Icon className="w-4 h-4" style={{ color: accent }} />
                          </div>
                          <span className="text-sm font-medium flex-1" style={{ color: textMain }}>{label}</span>
                          <ChevronRight className="w-4 h-4" style={{ color: 'rgba(176,112,96,0.4)' }} />
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}

                {panel === 'language' && (
                  <motion.div key="language"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.18 }}
                    className="overflow-y-auto"
                    style={{ maxHeight: scrollMaxHeight }}
                  >
                    <PanelHeader title={isFr ? 'Langue' : 'Language'} onBack={() => setPanel('menu')} onClose={close} accent={accent} textMain={textMain} />
                    <div className="px-4 pb-16 space-y-2">
                      {languages.map(lang => {
                        const isActive = lang.code === language;
                        return (
                          <motion.button key={lang.code}
                            onClick={() => { setLanguage(lang.code); setPanel('menu'); }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all"
                            style={{
                              background: isActive ? 'rgba(255,140,105,0.12)' : rowHover,
                              border: isActive ? '1.5px solid rgba(255,140,105,0.3)' : '1.5px solid transparent',
                            }}
                          >
                            <span className="text-3xl leading-none">{lang.flag}</span>
                            <span className="text-sm font-semibold flex-1 text-left" style={{ color: textMain }}>{lang.name}</span>
                            {isActive && <Check className="w-5 h-5" style={{ color: accent }} />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {panel === 'notifications' && (
                  <motion.div key="notifications"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.18 }}
                    className="overflow-y-auto px-2 pb-4"
                    style={{ maxHeight: scrollMaxHeight }}
                  >
                    <PanelHeader title={isFr ? 'Notifications' : 'Notifications'} onBack={() => setPanel('menu')} onClose={close} accent={accent} textMain={textMain} />
                    <div className="relative pt-2">
                      <NotificationStep
                        onContinue={async data => {
                          notificationService.saveSettings(data);
                          if (data.enabled) await notificationService.start(language as 'fr' | 'en');
                          setPanel('menu');
                        }}
                        onBack={() => setPanel('menu')}
                      />
                    </div>
                  </motion.div>
                )}

                {panel === 'widget' && (
                  <motion.div key="widget"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.18 }}
                    className="overflow-y-auto px-2 pb-4 flex flex-col items-center"
                    style={{ maxHeight: scrollMaxHeight }}
                  >
                    <PanelHeader title="Widget" onBack={() => setPanel('menu')} onClose={close} accent={accent} textMain={textMain} />
                    <div className="relative w-full pt-2">
                      <WidgetStep onContinue={() => setPanel('menu')} onBack={() => setPanel('menu')} />
                    </div>
                  </motion.div>
                )}

                {panel === 'submit' && (
                  <motion.div key="submit"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.18 }}
                    className="overflow-y-auto"
                    style={{ maxHeight: scrollMaxHeight }}
                  >
                    <PanelHeader title={isFr ? 'Ajouter les vôtres' : 'Submit your own'} onBack={() => setPanel('menu')} onClose={close} accent={accent} textMain={textMain} />
                    <SubmitQuotePanel language={language} onClose={() => setPanel('menu')} />
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PanelHeader({ title, onBack, onClose, accent, textMain }: {
  title: string; onBack: () => void; onClose: () => void;
  accent: string; textMain: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <button onClick={onBack}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,140,105,0.1)' }}>
        <ChevronRight className="w-4 h-4 rotate-180" style={{ color: accent }} />
      </button>
      <h2 className="text-lg font-bold flex-1" style={{ color: textMain }}>{title}</h2>
      <button onClick={onClose}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,140,105,0.1)' }}>
        <X className="w-4 h-4" style={{ color: accent }} />
      </button>
    </div>
  );
}

export default SettingsMenu;