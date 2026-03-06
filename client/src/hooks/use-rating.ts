/**
 * use-rating.ts
 * Déclenche le popup de notation après 10 citations consultées.
 * - Si l'uti a noté → ne réapparaît jamais
 * - Si l'uti a ignoré → réapparaît après 30 jours
 */

import { useState, useEffect, useRef } from 'react';

const KEY_QUOTES_SEEN  = 'rating_quotes_seen';   // compteur cumulatif
const KEY_RATED        = 'rating_done';           // 'true' si noté
const KEY_DISMISSED_AT = 'rating_dismissed_at';  // timestamp dernier dismiss
const TRIGGER_COUNT    = 10;                      // citations avant 1er popup
const REVISIT_DAYS     = 30;                      // jours avant re-proposition

function getInt(key: string): number {
  return parseInt(localStorage.getItem(key) ?? '0', 10);
}

export function useRating() {
  const [showRating, setShowRating] = useState(false);
  const quotesSeenRef = useRef(getInt(KEY_QUOTES_SEEN));

  // ── Vérifier si on doit afficher ──────────────────────────────
  const shouldShow = (): boolean => {
    // Déjà noté → jamais
    if (localStorage.getItem(KEY_RATED) === 'true') return false;

    const seen = quotesSeenRef.current;
    if (seen < TRIGGER_COUNT) return false;

    // Pas encore dismissé → afficher
    const dismissedAt = getInt(KEY_DISMISSED_AT);
    if (!dismissedAt) return true;

    // Dismissé → vérifier si 30 jours sont passés
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysSince >= REVISIT_DAYS;
  };

  // ── Appelé à chaque nouvelle citation vue ─────────────────────
  const onQuoteSeen = () => {
    quotesSeenRef.current += 1;
    localStorage.setItem(KEY_QUOTES_SEEN, String(quotesSeenRef.current));

    if (quotesSeenRef.current === TRIGGER_COUNT || shouldShow()) {
      if (shouldShow()) setShowRating(true);
    }
  };

  // ── L'uti a cliqué "Noter" ────────────────────────────────────
  const onRated = () => {
    localStorage.setItem(KEY_RATED, 'true');
    setShowRating(false);
  };

  // ── L'uti a fermé sans noter ──────────────────────────────────
  const onDismiss = () => {
    localStorage.setItem(KEY_DISMISSED_AT, String(Date.now()));
    setShowRating(false);
  };

  return { showRating, onQuoteSeen, onRated, onDismiss };
}