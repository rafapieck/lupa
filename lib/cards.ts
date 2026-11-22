import { LOCAL_PATTERNS, type FraudPattern } from "./patterns";

// Series cards for /api/card (PACKET §3b–3c, F3). Every word comes from
// lib/patterns.ts or the fixed lines below, so a card can't drift from the
// checker's own data.

/**
 * Bump when a card's look changes. Pages that embed a card add `&v=` so
 * browsers and the CDN don't keep the old PNG for the 1-day cache.
 * v2 (2026-11-22): Inter Bold.
 */
export const CARD_VERSION = "2";

export const CARD_FOOTER = "Pega la oferta en lupaempleo.xyz";

export const SERIES_A = {
  label: "SEÑAL DE LA SEMANA",
  size: { width: 1080, height: 1080 },
} as const;

export const SERIES_C = {
  label: "ANTES DE DEPOSITAR",
  size: { width: 1080, height: 1920 },
  headline: "3 cosas antes de depositar",
  // PACKET §3c, C1.
  lines: [
    "¿Te piden dinero antes de contratarte?",
    "¿La empresa tiene dirección y RFC?",
    "Pega la oferta en Lupa.",
  ],
  // Line 1 is the upfront_payment signal, so the card cites that pattern's source.
  sourcePattern: "upfront_payment",
} as const;

export function cardPattern(id: string | null): FraudPattern | null {
  return LOCAL_PATTERNS.find((p) => p.id === id) ?? null;
}

export type CardRequest = { series: "a"; pattern: FraudPattern } | { series: "c"; source: string };

/** Validates the query. null → 400. */
export function parseCardQuery(params: URLSearchParams): CardRequest | null {
  const series = params.get("series");
  if (series === "a") {
    const pattern = cardPattern(params.get("pattern"));
    return pattern ? { series: "a", pattern } : null;
  }
  if (series === "c") {
    return { series: "c", source: cardPattern(SERIES_C.sourcePattern)!.source };
  }
  return null;
}

/** Headline size from §3b (72–84 px for ≤ 8 words); longer labels step down so they fit. */
export function headlineSize(text: string): number {
  const words = text.trim().split(/\s+/).length;
  if (words <= 6) return 84;
  if (words <= 8) return 76;
  return 64;
}
