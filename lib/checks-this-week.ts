import { createClient } from "@supabase/supabase-js";

/**
 * North Star: number of checks in the last 7 days, from the
 * checks_this_week() SQL function. Returns null on any failure, so the
 * page can hide the number instead of showing an error.
 */
export async function getChecksThisWeek(): Promise<number | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .rpc("checks_this_week")
      .abortSignal(AbortSignal.timeout(3000));
    if (error) throw error;
    const n = Number(data);
    return Number.isSafeInteger(n) && n >= 0 ? n : null;
  } catch {
    console.warn("checks_this_week failed");
    return null;
  }
}
