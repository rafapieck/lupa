import { createClient } from "@supabase/supabase-js";

const SAVE_TIMEOUT_MS = 3000;

/** What the visitor says they will do with the offer. Fixed list, no free text. */
export const INTENT_ANSWERS = ["no_pay", "verify", "continue", "already_paid"] as const;
export type IntentAnswer = (typeof INTENT_ANSWERS)[number];

export const EVENT_KINDS = ["reply_copied", "intent"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

/** The only shape ever written to `check_events`. */
export type EventRow = { check_id: string; kind: EventKind; answer: IntentAnswer | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type EventValidation = { ok: true; row: EventRow } | { ok: false; error: string };

/** Checks an event body against the fixed lists. Anything unexpected is rejected. */
export function validateEvent(input: unknown): EventValidation {
  if (!input || typeof input !== "object") return { ok: false, error: "invalid body" };
  const { checkId, kind, answer } = input as Record<string, unknown>;

  if (typeof checkId !== "string" || !UUID.test(checkId)) return { ok: false, error: "invalid checkId" };
  if (typeof kind !== "string" || !(EVENT_KINDS as readonly string[]).includes(kind)) {
    return { ok: false, error: "invalid kind" };
  }

  if (kind === "intent") {
    if (typeof answer !== "string" || !(INTENT_ANSWERS as readonly string[]).includes(answer)) {
      return { ok: false, error: "invalid answer" };
    }
    return { ok: true, row: { check_id: checkId.toLowerCase(), kind, answer: answer as IntentAnswer } };
  }

  if (answer !== undefined && answer !== null) return { ok: false, error: "unexpected answer" };
  return { ok: true, row: { check_id: checkId.toLowerCase(), kind: "reply_copied", answer: null } };
}

/** Saves one event. Never throws; logs only "event save failed". */
export async function saveEvent(row: EventRow): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return false;

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase
      .from("check_events")
      .insert(row)
      .abortSignal(AbortSignal.timeout(SAVE_TIMEOUT_MS));
    if (error) throw error;
    return true;
  } catch {
    console.warn("event save failed");
    return false;
  }
}
