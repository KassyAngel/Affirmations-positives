import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Quote, Sparkles, Trash2, BookOpen } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type QuoteType = 'affirmation' | 'citation';

export interface UserQuote {
  id: string;
  type: QuoteType;
  text: string;
  author?: string;
  createdAt: string;
}

// ─── Stockage local ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'user_custom_quotes';

function loadQuotes(): UserQuote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQuotes(quotes: UserQuote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// ─── EmailJS ──────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_hueitfe';
const EMAILJS_TEMPLATE_ID = 'template_i3lfbeb';
const EMAILJS_PUBLIC_KEY  = 'Wxc9O_SndQPNDFeCD';

async function submitByEmail(q: UserQuote) {
  // Import dynamique pour éviter les erreurs SSR
  const emailjs = await import('@emailjs/browser');
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      quote_type:   q.type,
      quote_text:   q.text,
      quote_author: q.author ?? 'Non précisé',
      date:         new Date(q.createdAt).toLocaleString('fr-FR'),
    },
    EMAILJS_PUBLIC_KEY,
  );
}

// ─── Composant ────────────────────────────────────────────────────────────────
interface Props {
  language: string;
  onClose: () => void;
}

export function SubmitQuotePanel({ language, onClose }: Props) {
  const isFr = language === 'fr';
  const [tab, setTab]       = useState<'form' | 'list'>('form');
  const [type, setType]     = useState<QuoteType>('affirmation');
  const [text, setText]     = useState('');
  const [author, setAuthor] = useState('');
  const [done, setDone]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [quotes, setQuotes] = useState<UserQuote[]>(loadQuotes);

  const accent   = '#FF8C69';
  const textMain = '#2D1A12';
  const textSub  = '#B07060';
  const minLen   = 15;
  const maxLen   = 200;

  // ── Soumettre ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (text.trim().length < minLen) {
      setError(isFr ? `Minimum ${minLen} caractères` : `Minimum ${minLen} characters`);
      return;
    }
    setError('');
    setLoading(true);
    const newQuote: UserQuote = {
      id:        Date.now().toString(),
      type,
      text:      text.trim(),
      author:    author.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    try {
      const updated = [newQuote, ...quotes];
      saveQuotes(updated);
      setQuotes(updated);
      // Envoi par EmailJS — silencieux si réseau absent
      await submitByEmail(newQuote).catch((err) => {
        console.warn('EmailJS error:', err);
      });
      setText('');
      setAuthor('');
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    const updated = quotes.filter(q => q.id !== id);
    saveQuotes(updated);
    setQuotes(updated);
  };

  // ── Confirmation ───────────────────────────────────────────────────────────
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center px-8 py-12 text-center gap-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FFF0EA, #FFE4D9)' }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: accent }} />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold" style={{ color: textMain }}>
            {isFr ? 'Merci pour votre contribution ! 🎉' : 'Thank you! 🎉'}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: textSub }}>
            {isFr
              ? 'Votre citation est sauvegardée ici et envoyée pour examen. Si elle est retenue, elle apparaîtra dans l\'app pour inspirer des milliers de personnes ✨'
              : 'Your quote is saved here and sent for review. If selected, it will appear in the app to inspire thousands ✨'}
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <motion.button
            onClick={() => { setDone(false); setTab('list'); }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-full font-semibold text-sm"
            style={{ background: 'rgba(255,140,105,0.1)', color: accent }}
          >
            {isFr ? 'Voir mes citations' : 'See my quotes'}
          </motion.button>
          <motion.button
            onClick={() => setDone(false)}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-full text-white font-semibold text-sm"
            style={{ background: `linear-gradient(to right, ${accent}, #FFA882)` }}
          >
            {isFr ? 'En ajouter une autre' : 'Add another'}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="pb-8">

      {/* Onglets Proposer / Mes citations */}
      <div className="flex mx-5 mb-5 rounded-2xl overflow-hidden p-1"
        style={{ background: 'rgba(255,140,105,0.08)', border: '1px solid rgba(255,140,105,0.15)' }}>
        {(['form', 'list'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 rounded-xl transition-all"
            style={{
              background: tab === t ? `linear-gradient(to right, ${accent}, #FFA882)` : 'transparent',
              color: tab === t ? 'white' : textSub,
            }}
          >
            {t === 'form'
              ? <><Send className="w-3.5 h-3.5" /> {isFr ? 'Proposer' : 'Submit'}</>
              : <><BookOpen className="w-3.5 h-3.5" /> {isFr ? `Mes citations (${quotes.length})` : `My quotes (${quotes.length})`}</>}
          </button>
        ))}
      </div>

      {/* ══ FORMULAIRE ══ */}
      {tab === 'form' && (
        <div className="px-5 space-y-4">

          <div className="rounded-2xl p-4 flex gap-3 items-start"
            style={{ background: 'linear-gradient(135deg,#FFF5F0,#FFF0EA)', border: '1px solid #FFE4D9' }}>
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} />
            <p className="text-xs leading-relaxed" style={{ color: '#7A4030' }}>
              {isFr
                ? 'Proposez une citation ou affirmation. Si elle est retenue, elle inspirera des milliers de personnes ✨'
                : 'Submit a quote or affirmation. If selected, it will inspire thousands of people ✨'}
            </p>
          </div>

          {/* Type */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>
              {isFr ? 'Type' : 'Type'}
            </p>
            <div className="flex gap-2">
              {(['affirmation', 'citation'] as QuoteType[]).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
                  style={{
                    background: type === t ? `linear-gradient(to right,${accent},#FFA882)` : 'rgba(255,140,105,0.08)',
                    color: type === t ? 'white' : textSub,
                    border: type === t ? 'none' : '1.5px solid rgba(255,140,105,0.2)',
                  }}>
                  {t === 'affirmation' ? '✨ Affirmation' : (isFr ? '💬 Citation' : '💬 Quote')}
                </button>
              ))}
            </div>
          </div>

          {/* Texte */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
                {type === 'affirmation' ? (isFr ? 'Votre affirmation' : 'Your affirmation') : (isFr ? 'Votre citation' : 'Your quote')}
              </p>
              <span className="text-xs" style={{ color: text.length > maxLen - 20 ? '#ef4444' : textSub }}>
                {text.length}/{maxLen}
              </span>
            </div>
            <div className="relative">
              <Quote className="absolute top-3 left-3 w-4 h-4 opacity-25" style={{ color: accent }} />
              <textarea
                value={text}
                onChange={e => { if (e.target.value.length <= maxLen) setText(e.target.value); if (error) setError(''); }}
                placeholder={type === 'affirmation'
                  ? (isFr ? 'Je suis capable de réaliser mes rêves...' : 'I am capable of achieving my dreams...')
                  : (isFr ? '"La vie est belle malgré tout..."' : '"Life is beautiful despite everything..."')}
                rows={4}
                className="w-full rounded-2xl px-4 pt-3 pb-3 pl-9 text-sm resize-none focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: `1.5px solid ${error ? '#ef4444' : 'rgba(255,140,105,0.25)'}`,
                  color: textMain, lineHeight: '1.6',
                }}
              />
            </div>
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs mt-1 ml-1" style={{ color: '#ef4444' }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Auteur */}
          <AnimatePresence>
            {type === 'citation' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>
                  {isFr ? 'Auteur (optionnel)' : 'Author (optional)'}
                </p>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                  placeholder={isFr ? 'ex: Albert Einstein' : 'e.g. Albert Einstein'}
                  className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(255,140,105,0.25)', color: textMain }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading || text.trim().length < minLen}
            whileHover={{ scale: text.trim().length >= minLen ? 1.02 : 1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-full text-white font-semibold text-base flex items-center justify-center gap-2"
            style={{
              background: text.trim().length >= minLen ? `linear-gradient(to right,${accent},#FFA882)` : 'rgba(255,140,105,0.3)',
              boxShadow: text.trim().length >= minLen ? '0 6px 20px rgba(255,140,105,0.35)' : 'none',
            }}>
            {loading
              ? <span className="animate-pulse">{isFr ? 'Envoi...' : 'Sending...'}</span>
              : <><Send className="w-4 h-4" /> {isFr ? 'Envoyer ma contribution' : 'Send my contribution'}</>}
          </motion.button>

          <p className="text-xs text-center" style={{ color: textSub }}>
            {isFr ? 'Toutes les soumissions sont relues avant publication.' : 'All submissions are reviewed before publication.'}
          </p>
        </div>
      )}

      {/* ══ MES CITATIONS ══ */}
      {tab === 'list' && (
        <div className="px-5 space-y-3">
          {quotes.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,140,105,0.1)' }}>
                <BookOpen className="w-8 h-8" style={{ color: 'rgba(255,140,105,0.4)' }} />
              </div>
              <p className="text-sm text-center" style={{ color: textSub }}>
                {isFr ? 'Aucune citation pour le moment.\nProposez la vôtre !' : 'No quotes yet.\nSubmit your first one!'}
              </p>
            </div>
          ) : quotes.map(q => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,140,105,0.2)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: q.type === 'affirmation' ? 'rgba(255,140,105,0.12)' : 'rgba(255,200,50,0.15)',
                    color: q.type === 'affirmation' ? accent : '#C8820A',
                  }}>
                  {q.type === 'affirmation' ? '✨ Affirmation' : (isFr ? '💬 Citation' : '💬 Quote')}
                </span>
                <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg shrink-0" style={{ color: 'rgba(176,112,96,0.5)' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: textMain }}>{q.text}</p>
              {q.author && <p className="text-xs mt-1" style={{ color: textSub }}>— {q.author}</p>}
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs" style={{ color: 'rgba(176,112,96,0.5)' }}>
                  {new Date(q.createdAt).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                  {isFr ? '✓ Envoyée' : '✓ Submitted'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}