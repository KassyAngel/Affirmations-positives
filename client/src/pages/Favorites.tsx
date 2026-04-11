import { useLocation } from 'wouter';
import { useUserStateContext } from '@/contexts/UserStateContext';
import { useQuotes } from '@/hooks/use-quotes';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

import { Loader2, Heart, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import type { Quote } from '@shared/schema';

// ─── Config catégories ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, {
  accent: string; bgFrom: string; bgTo: string;
  label: { fr: string; en: string };
  gradient: [string, string];
}> = {
  work:         { accent: '#C96A5A', bgFrom: '#FFF3EE', bgTo: '#FFE8DC', label: { fr: 'Carrière',        en: 'Career'          }, gradient: ['#FF8C69', '#FF6B4A'] },
  love:         { accent: '#C4607A', bgFrom: '#FFF0F2', bgTo: '#FFE0E6', label: { fr: 'Amour',            en: 'Love'            }, gradient: ['#E8607A', '#C4456A'] },
  sport:        { accent: '#B87040', bgFrom: '#FFF8EE', bgTo: '#FFECD4', label: { fr: 'Énergie & Sport',  en: 'Energy & Sport'  }, gradient: ['#F0924A', '#D4722A'] },
  confidence:   { accent: '#B8607A', bgFrom: '#FFF0F2', bgTo: '#FFE0E6', label: { fr: 'Confiance en soi', en: 'Self-confidence' }, gradient: ['#D4607A', '#B84565'] },
  support:      { accent: '#A06080', bgFrom: '#FDF0F5', bgTo: '#F5D8E8', label: { fr: 'Stress & Anxiété', en: 'Stress & Anxiety'}, gradient: ['#B06090', '#904070'] },
  breakup:      { accent: '#A05870', bgFrom: '#FDF0F4', bgTo: '#F5D8E4', label: { fr: 'Rupture',          en: 'Heartbreak'      }, gradient: ['#B05870', '#904055'] },
  philosophy:   { accent: '#A07850', bgFrom: '#FFFBF0', bgTo: '#FFF0CC', label: { fr: 'Sagesse',          en: 'Wisdom'          }, gradient: ['#B08050', '#907035'] },
  success:      { accent: '#B86870', bgFrom: '#FFF0F2', bgTo: '#FFE0E6', label: { fr: 'Bonheur',          en: 'Happiness'       }, gradient: ['#C86870', '#A85055'] },
  gratitude:    { accent: '#C47A5A', bgFrom: '#FFF5EE', bgTo: '#FFEADC', label: { fr: 'Gratitude',        en: 'Gratitude'       }, gradient: ['#D07A5A', '#B05A3A'] },
  family:       { accent: '#8A6E9A', bgFrom: '#F8F0FF', bgTo: '#EBD8FF', label: { fr: 'Famille',          en: 'Family'          }, gradient: ['#8A6E9A', '#6A507A'] },
  wellness:     { accent: '#6A9A7A', bgFrom: '#F0FBF5', bgTo: '#D8F3E6', label: { fr: 'Bien-être',        en: 'Wellness'        }, gradient: ['#6A9A7A', '#4A7A5A'] },
  femininity:   { accent: '#C4607A', bgFrom: '#FFF0F2', bgTo: '#FFE0E6', label: { fr: 'Féminité',         en: 'Femininity'      }, gradient: ['#D4607A', '#B44565'] },
  'letting-go': { accent: '#7A90B0', bgFrom: '#F0F5FF', bgTo: '#DAE5FF', label: { fr: 'Lâcher prise',     en: 'Letting Go'      }, gradient: ['#7A90B0', '#5A7090'] },
  default:      { accent: '#FF8C69', bgFrom: '#FFF5F0', bgTo: '#FFE8DC', label: { fr: 'Autre',            en: 'Other'           }, gradient: ['#FF8C69', '#FF6B4A'] },
};

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kcdev.affirmationspositives';

// ─── Génération image canvas (même logique que QuoteCard) ─────────────────────

async function generateShareImage(
  quoteText: string,
  author: string,
  category: string,
  themeImagePath: string,
): Promise<string> {
  return new Promise((resolve) => {
    const W = 1080, H = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      // Overlay sombre
      const overlay = ctx.createLinearGradient(0, 0, 0, H);
      overlay.addColorStop(0,   'rgba(0,0,0,0.35)');
      overlay.addColorStop(0.5, 'rgba(0,0,0,0.52)');
      overlay.addColorStop(1,   'rgba(0,0,0,0.68)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, W, H);

      // Carte centrale
      const cardX = 80, cardY = 180, cardW = W - 160, cardH = H - 400, r = 48;
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardW - r, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
      ctx.lineTo(cardX + cardW, cardY + cardH - r);
      ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
      ctx.lineTo(cardX + r, cardY + cardH);
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Guillemet
      ctx.font = 'bold 140px Georgia, serif';
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 0;
      ctx.fillText('"', cardX + 40, cardY + 110);

      // Citation (word wrap)
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 14;
      const maxW = cardW - 120, centerX = W / 2;
      const words = quoteText.split(' ');
      const lines: string[] = [];
      let cur = '';
      const fontSize = quoteText.length > 130 ? 34 : quoteText.length > 90 ? 40 : 46;
      ctx.font = `bold ${fontSize}px -apple-system, 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle = 'white';
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
        else cur = test;
      }
      if (cur) lines.push(cur);

      const lineH = fontSize * 1.48;
      const totalH = lines.length * lineH;
      const textStartY = cardY + cardH / 2 - totalH / 2 + 20;
      lines.forEach((line, i) => ctx.fillText(line, centerX, textStartY + i * lineH));

      // Séparateur
      ctx.shadowBlur = 0;
      const sepY = textStartY + lines.length * lineH + 28;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 44, sepY);
      ctx.lineTo(centerX + 44, sepY);
      ctx.stroke();

      // Auteur
      ctx.font = `600 30px -apple-system, 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillText(`— ${author}`, centerX, sepY + 52);

      // Bandeau bas
      ctx.shadowBlur = 0;
      const bannerGrad = ctx.createLinearGradient(0, H - 200, 0, H);
      bannerGrad.addColorStop(0, 'rgba(0,0,0,0)');
      bannerGrad.addColorStop(1, 'rgba(0,0,0,0.80)');
      ctx.fillStyle = bannerGrad;
      ctx.fillRect(0, H - 200, W, 200);
      ctx.font = `bold 36px -apple-system, 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('✨ Affirmations Positives', centerX, H - 95);
      ctx.font = `400 24px -apple-system, 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fillText('Disponible sur Google Play', centerX, H - 52);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ratio = Math.max(W / img.width, H / img.height);
      ctx.drawImage(img, (W - img.width * ratio) / 2, (H - img.height * ratio) / 2, img.width * ratio, img.height * ratio);
      draw();
    };
    img.onerror = () => {
      const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.default;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, cfg.gradient[0]);
      grad.addColorStop(1, cfg.gradient[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      draw();
    };
    img.src = themeImagePath.startsWith('http')
      ? themeImagePath
      : `${window.location.origin}${themeImagePath}`;
  });
}

// ─── Hook partage (extrait de QuoteCard) ─────────────────────────────────────

async function handleShareQuote(
  quoteText: string,
  author: string,
  category: string,
  themeImagePath: string,
  language: string,
) {
  const shareText = `✨ "${quoteText}"\n\n— ${author}\n\n📲 Affirmations Positives\n${PLAY_STORE_URL}`;

  if (Capacitor.isNativePlatform()) {
    try {
      const { Share } = await import('@capacitor/share');
      try {
        const base64 = await generateShareImage(quoteText, author, category, themeImagePath);
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const fileName = `affirmation_${Date.now()}.jpg`;
        await Filesystem.writeFile({ path: fileName, data: base64.split(',')[1], directory: Directory.Cache });
        const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
        await Share.share({
          title: '✨ Affirmations Positives',
          text: shareText,
          url: uri,
          dialogTitle: language === 'fr' ? 'Partager cette citation' : 'Share this quote',
        });
        try { await Filesystem.deleteFile({ path: fileName, directory: Directory.Cache }); } catch {}
        return;
      } catch {
        await Share.share({
          title: '✨ Affirmations Positives',
          text: shareText,
          dialogTitle: language === 'fr' ? 'Partager cette citation' : 'Share this quote',
        });
        return;
      }
    } catch (err: any) {
      if (err?.message?.includes('cancelled') || err?.message?.includes('dismissed')) return;
      try { await navigator.clipboard.writeText(shareText); } catch {}
      return;
    }
  }

  if (navigator.share) {
    try { await navigator.share({ title: '✨ Affirmations Positives', text: shareText }); } catch {}
  } else {
    try {
      await navigator.clipboard.writeText(shareText);
      alert(language === 'fr' ? 'Citation copiée !' : 'Quote copied!');
    } catch {}
  }
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { state, toggleFavorite } = useUserStateContext();
  const { data: allQuotes, isLoading } = useQuotes();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  const favoriteQuotes = allQuotes?.filter(q => state.favorites.includes(q.id)) || [];
  const countLabel = favoriteQuotes.length === 1
    ? `1 ${t.favorites.subtitle}`
    : `${favoriteQuotes.length} ${t.favorites.subtitle}`;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #FFF5F0 0%, #FFF0E8 50%, #FFF8F5 100%)' }}>

      <header className="px-6 pt-10 pb-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold" style={{ color: '#2D1A12' }}>{t.favorites.title}</h1>
            <p className="mt-1 text-sm" style={{ color: '#B07060' }}>{countLabel}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setLocation('/')}
            className="mt-1 w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,140,105,0.12)', border: '1px solid rgba(255,140,105,0.25)' }}
          >
            <X className="w-4 h-4" style={{ color: '#FF8C69' }} />
          </motion.button>
        </motion.div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF8C69' }} />
        </div>
      ) : favoriteQuotes.length > 0 ? (
        <div className="px-4 space-y-4">
          <AnimatePresence>
            {favoriteQuotes.map((quote, index) => {
              const cfg           = CATEGORY_CONFIG[quote.category] ?? CATEGORY_CONFIG.default;
              const categoryLabel = language === 'fr' ? cfg.label.fr : cfg.label.en;
              const quoteText     = language === 'en' ? (quote.contentEn ?? quote.content ?? '') : (quote.content ?? '');
              const authorText    = quote.author ?? '';

              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  transition={{ delay: index * 0.07, type: 'spring', stiffness: 200, damping: 20 }}
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    background: `linear-gradient(145deg, ${cfg.bgFrom} 0%, ${cfg.bgTo} 100%)`,
                    border:     `1.5px solid ${cfg.accent}28`,
                    boxShadow:  `0 4px 20px ${cfg.accent}18`,
                  }}
                >
                  <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}70, transparent)` }} />
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl"
                    style={{ background: `${cfg.accent}18` }} />

                  <div className="relative z-10 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-3xl font-serif leading-none opacity-25" style={{ color: cfg.accent }}>"</span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{ background: `${cfg.accent}18`, color: cfg.accent, border: `1px solid ${cfg.accent}30` }}
                      >
                        {categoryLabel}
                      </span>
                    </div>

                    <p className="text-base font-display font-semibold leading-snug mb-4 text-center px-2"
                      style={{ color: '#2D1A12' }}>
                      {quoteText || (language === 'fr' ? 'Citation non disponible' : 'Quote not available')}
                    </p>

                    <div className="w-10 h-0.5 mx-auto mb-3 rounded-full" style={{ background: `${cfg.accent}50` }} />

                    {authorText && (
                      <p className="text-xs text-center font-medium uppercase tracking-widest mb-5"
                        style={{ color: `${cfg.accent}B0` }}>
                        {authorText}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-3">
                      {/* Retirer des favoris */}
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => toggleFavorite(quote.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                        style={{ background: `${cfg.accent}18`, border: `1px solid ${cfg.accent}35`, color: cfg.accent }}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                        <span>{language === 'fr' ? 'Retirer' : 'Remove'}</span>
                      </motion.button>

                      {/* Partager — même logique que QuoteCard avec image générée */}
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => handleShareQuote(
                          quoteText,
                          authorText,
                          quote.category,
                          theme.imagePath,   // ✅ thème actif comme fond de l'image
                          language,
                        )}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                        style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(0,0,0,0.08)', color: '#7A4030' }}
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{language === 'fr' ? 'Partager' : 'Share'}</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 px-6 text-center"
        >
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, #FFE8DC, #FFCBB8)', boxShadow: '0 8px 24px rgba(255,140,105,0.20)' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="w-9 h-9" style={{ color: '#FF8C69' }} />
          </motion.div>
          <h3 className="text-xl font-display font-bold mb-2" style={{ color: '#2D1A12' }}>{t.favorites.empty}</h3>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#B07060' }}>{t.favorites.emptySubtitle}</p>
        </motion.div>
      )}

      
    </div>
  );
}