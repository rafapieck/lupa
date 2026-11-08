import type { EventKind, IntentAnswer } from "./save-event";

/**
 * Browser helper: fire-and-forget POST /api/event. Never throws and never
 * waits: the UI must look the same whether the event was saved or not.
 */
export function sendEvent(checkId: string | null | undefined, kind: EventKind, answer?: IntentAnswer): void {
  if (!checkId) return;
  try {
    void fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answer ? { checkId, kind, answer } : { checkId, kind }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // fetch unavailable or threw synchronously: nothing to do.
  }
}

const REPEAT_KEY = "lupa_checked_before";

/** True if this browser finished a check before. Only a yes/no; nothing is sent about the browser. */
export function hasCheckedBefore(): boolean {
  try {
    return window.localStorage.getItem(REPEAT_KEY) === "1";
  } catch {
    return false;
  }
}

export function markChecked(): void {
  try {
    window.localStorage.setItem(REPEAT_KEY, "1");
  } catch {
    // private mode or storage blocked: the flag just stays false.
  }
}
