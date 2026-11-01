import { createClient } from "@supabase/supabase-js";
import type { ScoreResult } from "./score";

const SAVE_TIMEOUT_MS = 3000;

/**
 * The only shape that is ever written to `checks`. Built field by field on
 * purpose: no offer text, no IP, no user agent, nothing about the user.
 */
export type CheckRow = {
  verdict: ScoreResult["verdict"];
  score: number;
  pattern_ids: string[];
  simulated: boolean;
};

export function toCheckRow(result: ScoreResult, simulated: boolean): CheckRow {
  return {
    verdict: result.verdict,
    score: Math.max(0, Math.min(100, Math.round(result.score))),
    pattern_ids: result.matches.map((m) => m.id),
    simulated,
  };
}

/**
 * Saves one anonymous check (verdict, score, matched pattern IDs, simulated).
 * Never throws and never logs anything but "save failed": saving must never
 * block or change the answer the user gets.
 */
export async function saveCheck(result: ScoreResult, simulated: boolean): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return false;

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase
      .from("checks")
      .insert(toCheckRow(result, simulated))
      .abortSignal(AbortSignal.timeout(SAVE_TIMEOUT_MS));
    if (error) throw error;
    return true;
  } catch {
    console.warn("save failed");
    return false;
  }
}
