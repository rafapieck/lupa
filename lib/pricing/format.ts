// Display rounding for the simulator. simulate() returns full precision; only these round.

const MINUS = "−"; // U+2212, easier to see than a hyphen

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const count = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/** 15500 → "$15,500.00"; -2500 → "−$2,500.00". */
export function formatMoney(n: number): string {
  const text = money.format(Math.abs(n));
  return text === "0.00" || n >= 0 ? `$${text}` : `${MINUS}$${text}`;
}

/** 0.967742 → "96.8%"; -4.2 → "−420.0%"; null → "—". */
export function formatPct(ratio: number | null): string {
  if (ratio === null || !Number.isFinite(ratio)) return "—";
  const text = Math.abs(ratio * 100).toFixed(1);
  return ratio < 0 && text !== "0.0" ? `${MINUS}${text}%` : `${text}%`;
}

/** 200 → "200"; 1500 → "1,500"; 4.995 → "5". */
export function formatCount(n: number): string {
  return count.format(n);
}

/** Default values as typed text in the inputs: 24000 → "24,000", 0.05 → "0.05". */
export function formatInput(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n);
}

/** True when the value shows as negative, so the UI can color it. */
export function isNegative(n: number | null): boolean {
  return n !== null && n < 0 && money.format(Math.abs(n)) !== "0.00";
}
