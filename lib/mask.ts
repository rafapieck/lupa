// Week 15 shadow decision (PACKET §4.7, §12.3, F5): personal data in a pasted
// offer doesn't reach Google. Pure function, runs on the server only, before
// the Gemini call. The keyword guard still reads the original text, so every
// unambiguous signal (payment, WhatsApp, Gmail…) survives masking.
// Nothing here is stored or logged.

export const MASK = {
  phone: "[teléfono]",
  email: "[correo]",
  link: "[liga]",
  document: "[documento]",
} as const;

// Emails first, so their domain isn't read as a link.
const EMAIL = /[\p{L}\d._%+-]+@[\p{L}\d-]+(?:\.[\p{L}\d-]+)+/giu;

// Links: with a scheme, starting with www., or a bare domain with a common
// TLD (bit.ly/abc, wa.me/52155…, forms.gle/x). Runs before phones so the
// number inside wa.me/… goes with the link.
const LINK =
  /\b(?:https?:\/\/|www\.)[^\s<>"]+|\b(?:[a-z\d-]+\.)+(?:com|mx|ly|me|gle|net|org|io|co|info|xyz|link|site|online|app|page|to|gl|lat)(?:\.[a-z]{2})?(?:\/[^\s<>"]*)?/gi;

// CURP (18): 4 letters, 6-digit date, H/M/X, 5 letters, 1 letter-or-digit, 1 digit.
const CURP = /\b[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z\d]\d\b/gi;
// INE clave de elector (18): 6 letters, 8 digits, H/M, 3 digits.
const CLAVE_ELECTOR = /\b[A-Z]{6}\d{8}[HM]\d{3}\b/gi;
// RFC (12–13): 3–4 letters, 6-digit date, 3 letters-or-digits.
const RFC = /\b[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}\b/giu;

// Runs of digits with spaces, dots, dashes or parentheses, optionally with "+".
// Classified by how many digits they hold: 10–13 → phone (MX 10 digits, with
// +52 / 1 prefixes), 14+ → ID-shaped (CLABE, card, account). Fewer than 10 is
// left alone so amounts and dates ("$9,500", "15 min", "2026") survive.
const DIGIT_RUN = /\+?\(?\d[\d\s().-]*\d/g;

export function maskForAI(text: string): string {
  return text
    .replace(EMAIL, MASK.email)
    // Sentence punctuation right after a link stays in the text.
    .replace(LINK, (link) => MASK.link + (link.match(/[.,;:!?)]+$/)?.[0] ?? ""))
    .replace(CURP, MASK.document)
    .replace(CLAVE_ELECTOR, MASK.document)
    .replace(RFC, MASK.document)
    .replace(DIGIT_RUN, (run) => {
      const digits = run.replace(/\D/g, "").length;
      if (digits >= 14) return MASK.document;
      if (digits >= 10) return MASK.phone;
      return run;
    });
}
