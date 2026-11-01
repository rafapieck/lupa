import { LOCAL_PATTERNS, SIGNALS, type FraudPattern, type Signal } from "./patterns";

export type Signals = Record<Signal, boolean>;
export type Verdict = "green" | "yellow" | "red";

export type MatchedFlag = {
  id: string;
  signal: Signal;
  weight: number;
  label: string;
  nextStep: string;
  source: string;
  reply: string | null;
};

export type ScoreResult = {
  score: number;
  verdict: Verdict;
  verdictLabel: string;
  matches: MatchedFlag[];
  nextStep: string;
  /**
   * Fixed reply template from the highest-weight matched pattern that has one.
   * Only on yellow/red; always null on green. Never written by the AI.
   */
  reply: string | null;
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  green: "No encontramos señales conocidas",
  yellow: "Precaución",
  red: "Riesgo alto",
};

// Green never means "safe" (Charter principle 3): it only means none of the
// known patterns matched, so the tip always tells the user to keep checking.
export const DEFAULT_SAFE_TIP =
  "Eso no garantiza que no sea fraude. Antes de ir, confirma que la empresa existe y que la dirección corresponde a ella. Nunca pagues ni mandes tu INE antes de una entrevista en persona.";

export function emptySignals(): Signals {
  return Object.fromEntries(SIGNALS.map((s) => [s, false])) as Signals;
}

export function verdictFor(score: number): Verdict {
  if (score >= 6) return "red";
  if (score >= 3) return "yellow";
  return "green";
}

/**
 * Deterministic verdict: matches the true signals against the verified
 * patterns and sums their weights. The AI never decides the verdict.
 */
export function scoreSignals(
  signals: Partial<Signals>,
  patterns: FraudPattern[] = LOCAL_PATTERNS,
): ScoreResult {
  const matches: MatchedFlag[] = patterns
    .filter((p) => signals[p.signal] === true)
    .map((p) => ({
      id: p.id,
      signal: p.signal,
      weight: p.weight,
      label: p.label_es,
      nextStep: p.next_step_es,
      source: p.source,
      reply: p.reply_es ?? null,
    }))
    .sort((a, b) => b.weight - a.weight);

  const score = matches.reduce((sum, m) => sum + m.weight, 0);
  const verdict = verdictFor(score);

  return {
    score,
    verdict,
    verdictLabel: VERDICT_LABELS[verdict],
    matches,
    nextStep: verdict === "green" || matches.length === 0 ? DEFAULT_SAFE_TIP : matches[0].nextStep,
    reply: verdict === "green" ? null : (matches.find((m) => m.reply)?.reply ?? null),
  };
}
