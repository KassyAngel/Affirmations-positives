import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme, type ThemeId } from '@/contexts/ThemeContext';
import { Scale, FileText, Shield, X } from 'lucide-react';

// Thèmes à fond CLAIR — le bouton doit être sombre pour contraster
const LIGHT_THEMES: ThemeId[] = [
  'minimaliste-1',
  'minimaliste-2',
  'minimaliste-3',
  'minimaliste-5',
  'minimaliste-6',
  'minimaliste-7',
  'minimaliste-8',
  'zen-cascademinimaliste',
];

export function LegalMenu() {
  const { language } = useLanguage();
  const { themeId, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLightTheme = LIGHT_THEMES.includes(themeId);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isFr = language === 'fr';

  const links = isFr
    ? [
        {
          label: 'Mentions légales',
          href: '/mentions-legales-fr.html',
          icon: FileText,
        },
        {
          label: 'Politique de confidentialité',
          href: '/politique-confidentialite-fr.html',
          icon: Shield,
        },
      ]
    : [
        {
          label: 'Legal Notice',
          href: '/mentions-legales-en.html',
          icon: FileText,
        },
        {
          label: 'Privacy Policy',
          href: '/politique-confidentialite-en.html',
          icon: Shield,
        },
      ];

  const buttonStyleLight = {
    background: 'rgba(0, 0, 0, 0.07)',
    border: '1.5px solid rgba(0, 0, 0, 0.15)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    backdropFilter: 'blur(8px)',
  };

  const buttonStyleDark = {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1.5px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(12px)',
  };

  const dropdownStyle = {
    background: isLightTheme
      ? 'rgba(255, 255, 255, 0.92)'
      : 'rgba(20, 20, 30, 0.88)',
    border: isLightTheme
      ? '1px solid rgba(0,0,0,0.12)'
      : '1px solid rgba(255,255,255,0.15)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  };

  const itemTextColor = isLightTheme ? '#2D1B25' : '#f0f0f0';
  const itemHoverBg = isLightTheme ? 'rgba(232,84,122,0.08)' : 'rgba(255,255,255,0.08)';

  return (
    <div ref={menuRef} className="relative">
      {/* Bouton déclencheur */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
        style={isLightTheme ? buttonStyleLight : buttonStyleDark}
        title={isFr ? 'Mentions légales & Confidentialité' : 'Legal & Privacy'}
        aria-label={isFr ? 'Mentions légales' : 'Legal'}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X
                className="w-4 h-4"
                style={{ color: isLightTheme ? '#2D1B25' : 'white' }}
              />
            </motion.span>
          ) : (
            <motion.span
              key="scale"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Scale
                className="w-4 h-4"
                style={{ color: isLightTheme ? '#2D1B25' : 'white' }}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-12 z-50 rounded-2xl overflow-hidden min-w-[210px]"
            style={dropdownStyle}
          >
            {/* En-tête du menu */}
            <div
              className="px-4 py-2.5 border-b"
              style={{
                borderColor: isLightTheme
                  ? 'rgba(0,0,0,0.08)'
                  : 'rgba(255,255,255,0.08)',
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: '#E8547A' }}
              >
                {isFr ? 'Légal' : 'Legal'}
              </p>
            </div>

            {/* Liens */}
            {links.map(({ label, href, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 transition-colors group"
                style={{ color: itemTextColor }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = itemHoverBg;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: '#E8547A' }}
                />
                <span className="text-sm font-medium">{label}</span>
              </a>
            ))}

            {/* Footer discret */}
            <div
              className="px-4 py-2 border-t"
              style={{
                borderColor: isLightTheme
                  ? 'rgba(0,0,0,0.06)'
                  : 'rgba(255,255,255,0.06)',
              }}
            >
              <p
                className="text-xs text-center"
                style={{
                  color: isLightTheme
                    ? 'rgba(45,27,37,0.4)'
                    : 'rgba(240,240,240,0.35)',
                }}
              >
                Kc Dev © 2026
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LegalMenu;