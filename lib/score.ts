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
};

export type ScoreResult = {
  score: number;
  verdict: Verdict;
  verdictLabel: string;
  matches: MatchedFlag[];
  nextStep: string;
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  green: "Riesgo bajo",
  yellow: "Precaución",
  red: "Riesgo alto",
};

export const DEFAULT_SAFE_TIP =
  "Se ve normal, pero antes de ir confirma que la empresa existe y la dirección es real. Nunca pagues ni mandes tu INE antes de una entrevista en persona.";

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
  };
}
