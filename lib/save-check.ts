import { createClient } from "@supabase/supabase-js";
import type { ScoreResult } from "./score";

const SAVE_TIMEOUT_MS = 3000;

/**
 * The only shape that is ever written to `checks`. Built field by field on
 * purpose: no offer text, no IP, no user agent, nothing about the user.
 * `repeat_visit` is a yes/no the browser computes ("this browser checked
 * before"); no ID, cookie or fingerprint is ever sent.
 */
export type CheckRow = {
  id: string;
  verdict: ScoreResult["verdict"];
  score: number;
  pattern_ids: string[];
  simulated: boolean;
  repeat_visit: boolean;
  example: boolean;
};

export function toCheckRow(
  result: ScoreResult,
  simulated: boolean,
  repeatVisit: unknown = false,
  id: string = crypto.randomUUID(),
  example: unknown = false,
): CheckRow {
  return {
    id,
    verdict: result.verdict,
    score: Math.max(0, Math.min(100, Math.round(result.score))),
    pattern_ids: result.matches.map((m) => m.id),
    simulated,
    repeat_visit: repeatVisit === true,
    example: example === true,
  };
}

/**
 * Saves one anonymous check. Returns the check id only when the row was
 * saved, so the browser never sends events for a check that doesn't exist.
 * Never throws and never logs anything but "save failed": saving must never
 * block or change the answer the user gets.
 */
export async function saveCheck(
  result: ScoreResult,
  simulated: boolean,
  repeatVisit: unknown = false,
  example: unknown = false,
): Promise<string | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;

    const row = toCheckRow(result, simulated, repeatVisit, undefined, example);
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase
      .from("checks")
      .insert(row)
      .abortSignal(AbortSignal.timeout(SAVE_TIMEOUT_MS));
    if (error) throw error;
    return row.id;
  } catch {
    console.warn("save failed");
    return null;
  }
}
