import { memo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Quote as QuoteIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDeviceType } from '@/hooks/use-device-type';
import { Capacitor } from '@capacitor/core';
import type { Quote } from '@shared/schema';

interface QuoteCardProps {
  quote: Quote;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  categoryColors: string;
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kcdev.affirmationspositives';

const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  work:         ['#FF8C69', '#FF6B4A'],
  love:         ['#E8607A', '#C4456A'],
  sport:        ['#F0924A', '#D4722A'],
  confidence:   ['#D4607A', '#B84565'],
  support:      ['#B06090', '#904070'],
  breakup:      ['#B05870', '#904055'],
  philosophy:   ['#B08050', '#907035'],
  success:      ['#C86870', '#A85055'],
  gratitude:    ['#D07A5A', '#B05A3A'],
  family:       ['#8A6E9A', '#6A507A'],
  wellness:     ['#6A9A7A', '#4A7A5A'],
  femininity:   ['#D4607A', '#B44565'],
  'letting-go': ['#7A90B0', '#5A7090'],
  default:      ['#FF8C69', '#FF6B4A'],
};

// ─── Génération image canvas ──────────────────────────────────────────────────
async function generateShareImage(
  quoteText: string,
  author: string,
  category: string,
  themeImagePath: string,
): Promise<string> {
  return new Promise((resolve) => {
    const W = 1080;
    const H = 1080;
    const canvas  = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      const overlay = ctx.createLinearGradient(0, 0, 0, H);
      overlay.addColorStop(0,   'rgba(0,0,0,0.35)');
      overlay.addColorStop(0.5, 'rgba(0,0,0,0.52)');
      overlay.addColorStop(1,   'rgba(0,0,0,0.68)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, W, H);

      const cardX = 80; const cardY = 180;
      const cardW = W - 160; const cardH = H - 400;
      const r = 48;
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

      ctx.font = 'bold 140px Georgia, serif';
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 0;
      ctx.fillText('"', cardX + 40, cardY + 110);

      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 14;
      const maxW    = cardW - 120;
      const centerX = W / 2;
      const words   = quoteText.split(' ');
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

      const lineH      = fontSize * 1.48;
      const totalH     = lines.length * lineH;
      const textStartY = cardY + (cardH / 2) - (totalH / 2) + 20;
      lines.forEach((line, i) => ctx.fillText(line, centerX, textStartY + i * lineH));

      ctx.shadowBlur = 0;
      const sepY = textStartY + lines.length * lineH + 28;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 44, sepY);
      ctx.lineTo(centerX + 44, sepY);
      ctx.stroke();

      ctx.font = `600 30px -apple-system, 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillText(`— ${author}`, centerX, sepY + 52);

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
      const iw = img.width * ratio;
      const ih = img.height * ratio;
      ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      draw();
    };
    img.onerror = () => {
      const [c1, c2] = CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.default;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      draw();
    };
    img.src = themeImagePath.startsWith('http')
      ? themeImagePath
      : `${window.location.origin}${themeImagePath}`;
  });
}

// ─── ActionButtons — mémoïsé pour éviter les remounts sur re-render parent ───
interface ActionButtonsProps {
  size: 'sm' | 'lg';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  textClass: string;
}

const ActionButtons = memo(({ size, isFavorite, onToggleFavorite, onShare, textClass }: ActionButtonsProps) => (
  <div className={`flex justify-center ${size === 'lg' ? 'gap-8' : 'gap-6'}`}>
    <button
      onClick={onToggleFavorite}
      className={`${size === 'lg' ? 'p-4' : 'p-3'} rounded-full transition-colors active:scale-95 hover:scale-110 shadow-lg`}
      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
    >
      <Heart className={`${size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'} transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : textClass}`} />
    </button>
    <button
      onClick={onShare}
      className={`${size === 'lg' ? 'p-4' : 'p-3'} rounded-full transition-colors active:scale-95 hover:scale-110 shadow-lg`}
      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
    >
      <Share2 className={`${size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'} ${textClass}`} />
    </button>
  </div>
));
ActionButtons.displayName = 'ActionButtons';

// ─── Composant principal — mémoïsé ───────────────────────────────────────────
// ✅ FIX PERF : memo() → ne re-render que si quote, isFavorite ou callbacks changent
// ✅ FIX PERF : key={currentQuote.id} retiré du parent (Home.tsx) →
//              AnimatePresence gère la transition sans démonter/remonter le composant

export const QuoteCard = memo(function QuoteCard({
  quote, isFavorite, onToggleFavorite, categoryColors,
}: QuoteCardProps) {
  const { t, language } = useLanguage();
  const { theme }       = useTheme();
  const device          = useDeviceType();

  const displayContent = language === 'en' && quote.contentEn ? quote.contentEn : quote.content;

  const handleShare = async () => {
    const shareText = `✨ "${displayContent}"\n\n— ${quote.author}\n\n📲 Affirmations Positives\n${PLAY_STORE_URL}`;

    if (Capacitor.isNativePlatform()) {
      try {
        const { Share } = await import('@capacitor/share');
        try {
          const base64 = await generateShareImage(
            displayContent,
            quote.author ?? '',
            quote.category,
            theme.imagePath,
          );
          const { Filesystem, Directory } = await import('@capacitor/filesystem');
          const base64Data = base64.split(',')[1];
          const fileName   = `affirmation_${Date.now()}.jpg`;
          await Filesystem.writeFile({ path: fileName, data: base64Data, directory: Directory.Cache });
          const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
          await Share.share({
            title: '✨ Affirmations Positives',
            text: shareText,
            url: uri,
            dialogTitle: language === 'fr' ? 'Partager cette citation' : 'Share this quote',
          });
          try { await Filesystem.deleteFile({ path: fileName, directory: Directory.Cache }); } catch {}
          return;
        } catch (imgErr) {
          console.warn('[Share] Image échouée, fallback texte pur:', imgErr);
          await Share.share({
            title: '✨ Affirmations Positives',
            text: shareText,
            dialogTitle: language === 'fr' ? 'Partager cette citation' : 'Share this quote',
          });
          return;
        }
      } catch (err: any) {
        if (err?.message?.includes('cancelled') || err?.message?.includes('dismissed')) return;
        console.error('[Share] Erreur:', err);
        try {
          await navigator.clipboard.writeText(shareText);
          alert(language === 'fr' ? 'Citation copiée !' : 'Quote copied!');
        } catch {}
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
  };

  // ✅ FIX PERF : backdropFilter uniquement sur la carte, pas sur les boutons imbriqués
  const cardStyle = {
    background:     theme.cardClass.includes('bg-white') ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
    backdropFilter: 'blur(20px)',
    border:         '1px solid rgba(255,255,255,0.2)',
  };

  if (device === 'mobile') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl"
        style={{ ...cardStyle, aspectRatio: '4/5' }}
      >
        {quote.backgroundImage && (
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${quote.backgroundImage})` }} />
        )}
        <div className="relative h-full flex flex-col justify-between p-7 z-10">
          <div className="flex justify-between items-start">
            <QuoteIcon className={`w-9 h-9 ${theme.textClass} opacity-40`} />
            <span
              className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
              style={{ background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', backdropFilter: 'blur(12px)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
            >
              {t.categories[quote.category as keyof typeof t.categories] || quote.category}
            </span>
          </div>
          <div className="space-y-4 text-center my-auto">
            <h2 className={`font-display font-bold text-xl leading-tight drop-shadow-lg ${theme.textClass}`}>
              "{displayContent}"
            </h2>
            <div className="w-10 h-1 mx-auto rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
            <p className={`font-sans font-medium text-sm ${theme.textClass} opacity-90 uppercase tracking-wide`}>
              {quote.author}
            </p>
          </div>
          <ActionButtons
            size="sm"
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onShare={handleShare}
            textClass={theme.textClass}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl"
      style={{ ...cardStyle, width: device === 'desktop' ? '680px' : '580px', height: device === 'desktop' ? '420px' : '380px' }}
    >
      {quote.backgroundImage && (
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${quote.backgroundImage})` }} />
      )}
      <div className="relative h-full flex flex-col justify-between p-10 z-10">
        <div className="flex justify-between items-start">
          <QuoteIcon className={`w-12 h-12 ${theme.textClass} opacity-40`} />
          <span
            className="px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg"
            style={{ background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', backdropFilter: 'blur(12px)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
          >
            {t.categories[quote.category as keyof typeof t.categories] || quote.category}
          </span>
        </div>
        <div className="space-y-5 text-center my-auto px-4">
          <h2 className={`font-display font-bold text-3xl leading-snug drop-shadow-lg ${theme.textClass}`}>
            "{displayContent}"
          </h2>
          <div className="w-14 h-1 mx-auto rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <p className={`font-sans font-medium text-lg ${theme.textClass} opacity-90 uppercase tracking-widest`}>
            {quote.author}
          </p>
        </div>
        <ActionButtons
          size="lg"
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onShare={handleShare}
          textClass={theme.textClass}
        />
      </div>
    </motion.div>
  );
});