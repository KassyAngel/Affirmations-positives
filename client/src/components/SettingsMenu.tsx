import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme, type ThemeId } from '@/contexts/ThemeContext';
import { languages } from '@/locales';
import { Settings, FileText, Shield, Check } from 'lucide-react';

const LIGHT_THEMES: ThemeId[] = [
  'minimaliste-1', 'minimaliste-2', 'minimaliste-3',
  'minimaliste-5', 'minimaliste-6', 'minimaliste-7',
  'minimaliste-8', 'zen-cascademinimaliste',
];

export function SettingsMenu() {
  const { language, setLanguage } = useLanguage();
  const { themeId } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLightTheme = LIGHT_THEMES.includes(themeId);
  const isFr = language === 'fr';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const legalLinks = isFr
    ? [
        { label: 'Mentions légales', href: '/mentions-legales-fr.html', icon: FileText },
        { label: 'Confidentialité', href: '/politique-confidentialite-fr.html', icon: Shield },
      ]
    : [
        { label: 'Legal Notice', href: '/mentions-legales-en.html', icon: FileText },
        { label: 'Privacy Policy', href: '/politique-confidentialite-en.html', icon: Shield },
      ];

  // Styles adaptatifs clair/sombre
  const btnStyle = isLightTheme
    ? { background: 'rgba(0,0,0,0.07)', border: '1.5px solid rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)' }
    : { background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(12px)' };

  const dropdownStyle = {
    background: isLightTheme ? 'rgba(255,255,255,0.94)' : 'rgba(18,18,28,0.90)',
    border: isLightTheme ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
  };

  const textColor = isLightTheme ? '#2D1B25' : '#f0f0f0';
  const subTextColor = isLightTheme ? 'rgba(45,27,37,0.45)' : 'rgba(240,240,240,0.38)';
  const dividerColor = isLightTheme ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)';
  const hoverBg = isLightTheme ? 'rgba(232,84,122,0.07)' : 'rgba(255,255,255,0.07)';

  return (
    <div ref={menuRef} className="relative">

      {/* ── Bouton déclencheur ── */}
      <motion.button
        onClick={() => setIsOpen((p) => !p)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Paramètres"
        aria-expanded={isOpen}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
        style={btnStyle}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <Settings
            className="w-4 h-4"
            style={{ color: isLightTheme ? '#2D1B25' : 'white' }}
          />
        </motion.div>
      </motion.button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-12 z-50 rounded-2xl overflow-hidden w-56"
            style={dropdownStyle}
          >

            {/* ── Section Langue ── */}
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#E8547A' }}>
                {isFr ? 'Langue' : 'Language'}
              </p>
              <div className="flex flex-col gap-0.5">
                {languages.map((lang) => {
                  const isActive = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-colors"
                      style={{
                        background: isActive
                          ? (isLightTheme ? 'rgba(232,84,122,0.1)' : 'rgba(232,84,122,0.18)')
                          : 'transparent',
                        color: textColor,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.background = hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <span className="text-lg leading-none">{lang.flag}</span>
                      <span className="text-sm font-medium flex-1">{lang.name}</span>
                      {isActive && (
                        <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#E8547A' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="mx-4 my-2" style={{ height: '1px', background: dividerColor }} />

            {/* ── Section Légal ── */}
            <div className="px-4 pb-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#E8547A' }}>
                {isFr ? 'Légal' : 'Legal'}
              </p>
              <div className="flex flex-col gap-0.5">
                {legalLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                    style={{ color: textColor, textDecoration: 'none' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#E8547A' }} />
                    <span className="text-sm font-medium">{label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-2.5 mt-1" style={{ borderTop: `1px solid ${dividerColor}` }}>
              <p className="text-xs text-center" style={{ color: subTextColor }}>
                Kc Dev © 2026
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SettingsMenu;