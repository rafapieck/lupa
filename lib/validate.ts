export const MIN_CHARS = 20;
export const MAX_CHARS = 3000;

export const ERROR_TOO_SHORT = "Pega el texto completo de la oferta";
export const ERROR_TOO_LONG = "El texto es muy largo, máximo 3000 caracteres";

export type ValidationResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

/** Removes HTML tags (and the contents of script/style blocks). */
export function stripHtml(input: string): string {
  return input
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/?[a-z][^>]*>/gi, " ")
    .replace(/[ \t]{2,}/g, " ");
}

/** Cleans and checks the offer text. Used by the form and the API. */
export function validateOffer(input: unknown): ValidationResult {
  if (typeof input !== "string") return { ok: false, error: ERROR_TOO_SHORT };
  const text = stripHtml(input).trim();
  if (text.length < MIN_CHARS) return { ok: false, error: ERROR_TOO_SHORT };
  if (text.length > MAX_CHARS) return { ok: false, error: ERROR_TOO_LONG };
  return { ok: true, text };
}
