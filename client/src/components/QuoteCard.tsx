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

// ─── Lien Play Store ──────────────────────────────────────────────────────────
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kcdev.affirmationspositives';

// ─── Couleurs par catégorie pour la carte ─────────────────────────────────────
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

// ─── Génération image via Canvas ─────────────────────────────────────────────
async function generateShareImage(
  quoteText: string,
  author: string,
  category: string,
  themeImagePath: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const W = 1080;
    const H = 1080;

    const canvas  = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // ── Charge l'image du thème comme fond ──────────────────────────────────
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 1. Image thème en fond (cover)
      const ratio  = Math.max(W / img.width, H / img.height);
      const iw     = img.width  * ratio;
      const ih     = img.height * ratio;
      const ix     = (W - iw) / 2;
      const iy     = (H - ih) / 2;
      ctx.drawImage(img, ix, iy, iw, ih);

      // 2. Overlay sombre pour lisibilité
      const overlay = ctx.createLinearGradient(0, 0, 0, H);
      overlay.addColorStop(0,   'rgba(0,0,0,0.35)');
      overlay.addColorStop(0.5, 'rgba(0,0,0,0.50)');
      overlay.addColorStop(1,   'rgba(0,0,0,0.65)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, W, H);

      // 3. Carte centrale blanche translucide
      const cardX = 80;
      const cardY = 200;
      const cardW = W - 160;
      const cardH = H - 420;
      const r     = 48;

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

      // 4. Guillemet décoratif
      ctx.font = 'bold 140px Georgia, serif';
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.textAlign = 'left';
      ctx.fillText('"', cardX + 40, cardY + 110);

      // 5. Texte de la citation (avec retour à la ligne auto)
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 12;

      const maxWidth    = cardW - 100;
      const centerX     = W / 2;
      const words       = quoteText.split(' ');
      const lines: string[] = [];
      let currentLine   = '';

      // Adapte la taille de police selon longueur du texte
      const fontSize = quoteText.length > 120 ? 36 : quoteText.length > 80 ? 42 : 48;
      ctx.font = `bold ${fontSize}px -apple-system, 'Helvetica Neue', Arial, sans-serif`;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineH     = fontSize * 1.45;
      const totalTextH = lines.length * lineH;
      const textStartY = cardY + (cardH / 2) - (totalTextH / 2) + 20;

      lines.forEach((line, i) => {
        ctx.fillText(line, centerX, textStartY + i * lineH);
      });

      // 6. Séparateur
      ctx.shadowBlur = 0;
      const sepY = textStartY + lines.length * lineH + 30;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 40, sepY);
      ctx.lineTo(centerX + 40, sepY);
      ctx.stroke();

      // 7. Auteur
      ctx.font = `600 32px -apple-system, 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.90)';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillText(`— ${author}`, centerX, sepY + 55);

      // 8. Bandeau bas — nom app + Play Store
      ctx.shadowBlur = 0;

      // Fond bandeau
      const bannerGrad = ctx.createLinearGradient(0, H - 180, 0, H);
      bannerGrad.addColorStop(0, 'rgba(0,0,0,0)');
      bannerGrad.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.fillStyle = bannerGrad;
      ctx.fillRect(0, H - 180, W, 180);

      // Nom de l'app
      ctx.font = `bold 38px -apple-system, 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.textAlign  = 'center';
      ctx.fillText('✨ Affirmations Positives', centerX, H - 90);

      // Lien Play Store
      ctx.font = `400 26px -apple-system, 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.70)';
      ctx.fillText('Disponible sur Google Play', centerX, H - 48);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => {
      // Fallback si l'image du thème ne charge pas — fond dégradé catégorie
      const [c1, c2] = CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.default;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      img.onload!({} as Event);
    };

    // Charge l'image du thème (chemin relatif → absolu)
    img.src = themeImagePath.startsWith('http')
      ? themeImagePath
      : `${window.location.origin}${themeImagePath}`;
  });
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function QuoteCard({ quote, isFavorite, onToggleFavorite, categoryColors }: QuoteCardProps) {
  const { t, language } = useLanguage();
  const { theme }       = useTheme();
  const device          = useDeviceType();

  const displayContent = language === 'en' && quote.contentEn ? quote.contentEn : quote.content;

  // ── Partage ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const shareText = `✨ "${displayContent}"\n\n— ${quote.author}\n\n📲 Affirmations Positives\n${PLAY_STORE_URL}`;

    if (Capacitor.isNativePlatform()) {
      try {
        const { Share } = await import('@capacitor/share');

        // ── Tentative partage AVEC image ──────────────────────────────────────
        try {
          const base64 = await generateShareImage(
            displayContent,
            quote.author ?? '',
            quote.category,
            theme.imagePath,
          );

          // Convertit base64 → Blob → fichier temporaire via Filesystem
          const { Filesystem, Directory } = await import('@capacitor/filesystem');

          const base64Data = base64.split(',')[1]; // retire le préfixe data:image/jpeg;base64,
          const fileName   = `affirmation_${Date.now()}.jpg`;

          await Filesystem.writeFile({
            path:      fileName,
            data:      base64Data,
            directory: Directory.Cache,
          });

          const fileResult = await Filesystem.getUri({
            path:      fileName,
            directory: Directory.Cache,
          });

          await Share.share({
            title:       '✨ Affirmations Positives',
            text:        shareText,
            url:         fileResult.uri,
            dialogTitle: language === 'fr' ? 'Partager cette citation' : 'Share this quote',
          });

          // Nettoyage fichier temp
          try { await Filesystem.deleteFile({ path: fileName, directory: Directory.Cache }); } catch {}
          return;

        } catch (imgErr) {
          console.warn('[Share] Image échouée, fallback texte:', imgErr);
          // Fallback texte seul si l'image échoue
          await Share.share({
            title:       '✨ Affirmations Positives',
            text:        shareText,
            dialogTitle: language === 'fr' ? 'Partager cette citation' : 'Share this quote',
          });
          return;
        }

      } catch (err: any) {
        if (err?.message?.includes('cancelled') || err?.message?.includes('dismissed')) return;
        console.error('Erreur partage natif:', err);
        // Fallback copie presse-papier
        try {
          await navigator.clipboard.writeText(shareText);
          alert(language === 'fr' ? 'Citation copiée !' : 'Quote copied!');
        } catch {}
        return;
      }
    }

    // ── Web : navigator.share ou copie ───────────────────────────────────────
    if (navigator.share) {
      try {
        await navigator.share({
          title: '✨ Affirmations Positives',
          text:  shareText,
          url:   PLAY_STORE_URL,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert(language === 'fr' ? 'Citation copiée !' : 'Quote copied!');
      } catch {}
    }
  };

  // ── Styles ───────────────────────────────────────────────────────────────────
  const cardStyle = {
    background:     theme.cardClass.includes('bg-white') ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
    backdropFilter: 'blur(20px)',
    border:         '1px solid rgba(255,255,255,0.2)',
  };

  const ActionButtons = ({ size }: { size: 'sm' | 'lg' }) => (
    <div className={`flex justify-center ${size === 'lg' ? 'gap-8' : 'gap-6'}`}>
      <button
        onClick={onToggleFavorite}
        className={`${size === 'lg' ? 'p-4' : 'p-3'} rounded-full transition-all active:scale-95 hover:scale-110 shadow-lg`}
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <Heart className={`${size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'} transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : theme.textClass}`} />
      </button>
      <button
        onClick={handleShare}
        className={`${size === 'lg' ? 'p-4' : 'p-3'} rounded-full transition-all active:scale-95 hover:scale-110 shadow-lg`}
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <Share2 className={`${size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'} ${theme.textClass}`} />
      </button>
    </div>
  );

  // ── Mobile ───────────────────────────────────────────────────────────────────
  if (device === 'mobile') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
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
          <ActionButtons size="sm" />
        </div>
      </motion.div>
    );
  }

  // ── Tablette & Desktop ───────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl"
      style={{
        ...cardStyle,
        width:  device === 'desktop' ? '680px' : '580px',
        height: device === 'desktop' ? '420px' : '380px',
      }}
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
        <ActionButtons size="lg" />
      </div>
    </motion.div>
  );
}