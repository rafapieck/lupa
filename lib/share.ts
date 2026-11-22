import { LOCAL_PATTERNS, type FraudPattern } from "./patterns";
import { VERDICT_LABELS, verdictFor, type ScoreResult, type Verdict } from "./score";

// Shared verdict cards (/s/[verdict]/[patterns], PACKET §4.1, §12.1–2, §13).
// A card is rebuilt only from pattern ids in lib/patterns.ts, so it can't say
// anything Lupa didn't say. No offer text, phone, date or check id ever
// reaches a card.

export type ShareVerdict = Exclude<Verdict, "green">;

export const SHARE_MAX_PATTERNS = 6;
export const SHARE_MAX_SEGMENT = 200;

export type ShareCard = {
  verdict: ShareVerdict;
  verdictLabel: string;
  /** Sorted strongest first (weight desc, then lib/patterns.ts order). */
  patterns: FraudPattern[];
  /** next_step_es of the strongest pattern. */
  nextStep: string;
};

const BY_ID = new Map(LOCAL_PATTERNS.map((p, i) => [p.id, { p, i }]));

function decode(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/**
 * Validates /s/<verdict>/<ids>. Returns null (→ 404) unless:
 * - verdict is "red" or "yellow" (green is never shareable),
 * - the ids segment is ≤ 200 chars, with 1–6 known, distinct ids,
 * - the verdict is the one Lupa's own rules give those patterns, so a link
 *   can't upgrade a weak signal to "Riesgo alto".
 */
export function parseShare(verdictParam: string, patternsParam: string): ShareCard | null {
  if (verdictParam !== "red" && verdictParam !== "yellow") return null;
  if (patternsParam.length > SHARE_MAX_SEGMENT) return null;
  const decoded = decode(patternsParam);
  if (decoded === null || decoded.length > SHARE_MAX_SEGMENT) return null;

  const ids = decoded.split(",");
  if (ids.length < 1 || ids.length > SHARE_MAX_PATTERNS) return null;
  if (new Set(ids).size !== ids.length) return null;

  const found = ids.map((id) => BY_ID.get(id));
  if (found.some((f) => f === undefined)) return null;

  const patterns = (found as { p: FraudPattern; i: number }[])
    .sort((a, b) => b.p.weight - a.p.weight || a.i - b.i)
    .map((f) => f.p);

  const score = patterns.reduce((sum, p) => sum + p.weight, 0);
  if (verdictFor(score) !== verdictParam) return null;

  return {
    verdict: verdictParam,
    verdictLabel: VERDICT_LABELS[verdictParam],
    patterns,
    nextStep: patterns[0].next_step_es,
  };
}

/** Canonical share path for a result's matched pattern ids (strongest first, max 6). */
export function sharePath(verdict: ShareVerdict, ids: string[]): string {
  return `/s/${verdict}/${ids.slice(0, SHARE_MAX_PATTERNS).join(",")}`;
}

/** Distinct sources, in card order. */
export function shareSources(card: ShareCard): string[] {
  return [...new Set(card.patterns.map((p) => p.source))];
}

export const SHARE_CTA = "Revisa tu oferta";
export const SHARE_CTA_HREF = "/?src=wa_share";
export const SHARE_NOTE = "Este aviso solo muestra señales de alerta. No incluye la oferta original.";
export const OG_LABEL = "LA REVISÉ CON LUPA";
export const OG_FOOTER = "Revisa la tuya en lupaempleo.xyz";

// WhatsApp share (F2, PACKET §4.1). The message is fixed text plus the /s/ link:
// nothing from the offer itself.
export const SITE_URL = "https://www.lupaempleo.xyz";
export const WA_BUTTON = "Mandar aviso por WhatsApp";
export const WA_NOTE = "No mandamos el texto de la oferta, solo las señales.";
export const WA_MESSAGE_PREFIX =
  "Revisé una oferta de trabajo en Lupa y tiene señales de fraude. Mira cuáles antes de pagar: ";

/**
 * The /s/ path for a result, or null when it can't be shared: green, no
 * matches, or a match that the card page wouldn't accept (so we never send a
 * link that opens a 404).
 */
export function shareLinkFor(result: Pick<ScoreResult, "verdict" | "matches">): string | null {
  if (result.verdict === "green" || result.matches.length === 0) return null;
  const path = sharePath(result.verdict, result.matches.map((m) => m.id));
  const [, , verdict, patterns] = path.split("/");
  return parseShare(verdict, patterns) ? path : null;
}

export function whatsappMessage(path: string): string {
  return `${WA_MESSAGE_PREFIX}${SITE_URL}${path}`;
}

export function whatsappUrl(path: string): string {
  return `https://wa.me/?text=${encodeURIComponent(whatsappMessage(path))}`;
}
