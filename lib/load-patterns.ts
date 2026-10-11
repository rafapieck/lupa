import { createClient } from "@supabase/supabase-js";
import { LOCAL_PATTERNS, SIGNALS, type FraudPattern } from "./patterns";

const CACHE_MS = 5 * 60 * 1000;
let cache: { patterns: FraudPattern[]; at: number } | null = null;

function isPattern(row: unknown): row is FraudPattern {
  const r = row as Record<string, unknown>;
  return (
    !!r &&
    typeof r.id === "string" &&
    (SIGNALS as readonly string[]).includes(r.signal as string) &&
    typeof r.weight === "number" &&
    typeof r.label_es === "string" &&
    typeof r.next_step_es === "string" &&
    typeof r.source === "string"
  );
}

export type LoadedPatterns = { patterns: FraudPattern[]; from: "supabase" | "local" };

/** Reads fraud_patterns from Supabase; falls back to lib/patterns.ts on any error. */
export async function loadPatterns(): Promise<LoadedPatterns> {
  if (cache && Date.now() - cache.at < CACHE_MS) return { patterns: cache.patterns, from: "supabase" };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { patterns: LOCAL_PATTERNS, from: "local" };

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("fraud_patterns")
      .select("id, signal, weight, label_es, next_step_es, source")
      .abortSignal(AbortSignal.timeout(5000));
    if (error) throw error;
    const patterns = (data ?? []).filter(isPattern);
    if (patterns.length === 0) throw new Error("fraud_patterns is empty");
    cache = { patterns, at: Date.now() };
    return { patterns, from: "supabase" };
  } catch (err) {
    console.warn(`Supabase patterns unavailable (${(err as Error).message}); using local patterns`);
    return { patterns: LOCAL_PATTERNS, from: "local" };
  }
}
