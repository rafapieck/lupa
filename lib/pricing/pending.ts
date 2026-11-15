// Keeps the simulator inputs (and whether the user was saving) across the
// Google sign-in redirect. sessionStorage only: this tab, cleared on restore.
// Every access is wrapped: private mode or blocked storage must never break the page.

const KEY = "lupa_pricing_pending";

export type Pending = { raw: Record<string, string>; wantsSave: boolean };

export function savePending(p: Pending): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable: inputs reset to defaults after sign-in */
  }
}

export function takePending(): Pending | null {
  try {
    const text = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!text) return null;
    const p = JSON.parse(text) as Partial<Pending>;
    if (!p || typeof p.raw !== "object" || p.raw === null) return null;
    const raw: Record<string, string> = {};
    for (const [k, v] of Object.entries(p.raw)) if (typeof v === "string") raw[k] = v;
    return { raw, wantsSave: p.wantsSave === true };
  } catch {
    return null;
  }
}
