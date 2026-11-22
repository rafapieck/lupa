// Where a visit came from (PACKET §4.3, F4). A fixed list: anything else is
// ignored and never echoed. Must match the checks.source constraint (§11 SQL).
export const SOURCES = ["fb_group", "wa_status", "wa_share", "contenido", "direct"] as const;
export type Source = (typeof SOURCES)[number];

export const SOURCE_KEY = "lupa_src";

/** The value only if it's exactly one of SOURCES; otherwise null. */
export function toSource(value: unknown): Source | null {
  return typeof value === "string" && (SOURCES as readonly string[]).includes(value) ? (value as Source) : null;
}

/** Browser: keeps a valid ?src= for this visit (sessionStorage). Invalid values are dropped. */
export function captureSource(search: string): void {
  try {
    const src = toSource(new URLSearchParams(search).get("src"));
    if (src) window.sessionStorage.setItem(SOURCE_KEY, src);
  } catch {
    // storage blocked (private mode): the check still works, source stays null.
  }
}

/** Browser: the source kept for this visit, re-validated, or null. */
export function readSource(): Source | null {
  try {
    return toSource(window.sessionStorage.getItem(SOURCE_KEY));
  } catch {
    return null;
  }
}
