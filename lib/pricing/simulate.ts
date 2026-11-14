/**
 * Revenue simulator for /pricing (PACKET §3, "Simulator model").
 * Pure functions only: no I/O, no React, no Supabase.
 * All money is MXN before IVA. Results are full precision; the UI rounds.
 */

export const FORMULA_VERSION = 1;

export type FieldName =
  | "campusPipeline"
  | "programaPipeline"
  | "conversionRate"
  | "campusPrice"
  | "programaPrice"
  | "checksPerMonth"
  | "reportRate"
  | "costPerCheck"
  | "reviewCostPerReport";

export type DefaultLabel = "inventado" | "supuesto" | "precio de lista";

export type FieldSpec = {
  name: FieldName;
  /** Inclusive range. */
  min: number;
  max: number;
  /** 0 means integer only. */
  maxDecimals: number;
};

/** Type and range per field (PACKET §11). Order is the on-screen order. */
export const FIELD_SPECS: readonly FieldSpec[] = [
  { name: "campusPipeline", min: 0, max: 1_000, maxDecimals: 0 },
  { name: "programaPipeline", min: 0, max: 1_000, maxDecimals: 0 },
  { name: "conversionRate", min: 0, max: 100, maxDecimals: 2 },
  { name: "campusPrice", min: 0, max: 1_000_000, maxDecimals: 0 },
  { name: "programaPrice", min: 0, max: 1_000_000, maxDecimals: 0 },
  { name: "checksPerMonth", min: 0, max: 10_000_000, maxDecimals: 0 },
  { name: "reportRate", min: 0, max: 100, maxDecimals: 2 },
  { name: "costPerCheck", min: 0, max: 100, maxDecimals: 4 },
  { name: "reviewCostPerReport", min: 0, max: 1_000, maxDecimals: 2 },
];

export type SimInputs = Record<FieldName, number>;
export type RawInputs = Partial<Record<FieldName, string | number | null | undefined>>;

/** PACKET §3 defaults. Every one is labeled on screen. */
export const DEFAULTS: Record<FieldName, { value: number; label: DefaultLabel }> = {
  campusPipeline: { value: 20, label: "inventado" },
  programaPipeline: { value: 5, label: "inventado" },
  conversionRate: { value: 20, label: "inventado" },
  campusPrice: { value: 24_000, label: "precio de lista" },
  programaPrice: { value: 90_000, label: "precio de lista" },
  checksPerMonth: { value: 10_000, label: "inventado" },
  reportRate: { value: 2, label: "inventado" },
  costPerCheck: { value: 0.05, label: "supuesto" },
  reviewCostPerReport: { value: 0, label: "inventado" },
};

export function defaultValues(): SimInputs {
  return Object.fromEntries(FIELD_SPECS.map((f) => [f.name, DEFAULTS[f.name].value])) as SimInputs;
}

export const ERR_NOT_NUMBER = "Escribe un número";
export const ERR_NOT_INTEGER = "Debe ser un número entero";
export const errRange = (min: number, max: number) =>
  `Debe estar entre ${min.toLocaleString("en-US")} y ${max.toLocaleString("en-US")}`;
export const errDecimals = (n: number) => `Usa máximo ${n} decimales`;

const PLAIN_DECIMAL = /^\d+(\.\d+)?$/;
const NEGATIVE_DECIMAL = /^-\d+(\.\d+)?$/;

/** Parses one field; returns the number or the Spanish error message. */
export function parseField(spec: FieldSpec, raw: unknown): { ok: true; value: number } | { ok: false; error: string } {
  if (typeof raw !== "string" && typeof raw !== "number") return { ok: false, error: ERR_NOT_NUMBER };
  if (typeof raw === "number" && !Number.isFinite(raw)) return { ok: false, error: ERR_NOT_NUMBER };
  const text = String(raw).trim().replace(/,/g, "");

  if (NEGATIVE_DECIMAL.test(text)) return { ok: false, error: errRange(spec.min, spec.max) };
  if (!PLAIN_DECIMAL.test(text)) return { ok: false, error: ERR_NOT_NUMBER };

  const decimals = text.includes(".") ? text.split(".")[1].length : 0;
  if (spec.maxDecimals === 0 && decimals > 0) return { ok: false, error: ERR_NOT_INTEGER };
  if (decimals > spec.maxDecimals) return { ok: false, error: errDecimals(spec.maxDecimals) };

  const value = Number(text);
  if (!Number.isFinite(value)) return { ok: false, error: ERR_NOT_NUMBER };
  if (value < spec.min || value > spec.max) return { ok: false, error: errRange(spec.min, spec.max) };
  return { ok: true, value };
}

export type ValidationResult =
  | { ok: true; values: SimInputs }
  | { ok: false; errors: Partial<Record<FieldName, string>> };

/** Validates raw form values (strings or numbers). Strips spaces and thousands commas. */
export function validateInputs(raw: RawInputs): ValidationResult {
  const values = {} as SimInputs;
  const errors: Partial<Record<FieldName, string>> = {};
  for (const spec of FIELD_SPECS) {
    const parsed = parseField(spec, raw?.[spec.name]);
    if (parsed.ok) values[spec.name] = parsed.value;
    else errors[spec.name] = parsed.error;
  }
  return Object.keys(errors).length === 0 ? { ok: true, values } : { ok: false, errors };
}

export const SCENARIO_NAME_MAX = 60;

export function validateScenarioName(name: unknown): { ok: true; name: string } | { ok: false; error: string } {
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (trimmed.length === 0) return { ok: false, error: "Escribe un nombre" };
  if ([...trimmed].length > SCENARIO_NAME_MAX) return { ok: false, error: `Máximo ${SCENARIO_NAME_MAX} caracteres` };
  return { ok: true, name: trimmed };
}

export type SimResult = {
  payingCampus: number;
  payingPrograma: number;
  annualRevenue: number;
  monthlyRevenue: number;
  reportsPerMonth: number;
  monthlyCost: number;
  annualCost: number;
  monthlyMargin: number;
  annualMargin: number;
  /** monthlyMargin ÷ monthlyRevenue; null when revenue is 0. */
  marginPct: number | null;
};

/** Paying institutions: floor(pipeline × rate), in integer basis points so floor never hits float error. */
function paying(pipeline: number, conversionRatePct: number): number {
  return Math.floor((pipeline * Math.round(conversionRatePct * 100)) / 10000);
}

/** PACKET §3, exactly. Expects values that passed validateInputs. */
export function simulate(v: SimInputs): SimResult {
  const payingCampus = paying(v.campusPipeline, v.conversionRate);
  const payingPrograma = paying(v.programaPipeline, v.conversionRate);
  const annualRevenue = payingCampus * v.campusPrice + payingPrograma * v.programaPrice;
  const monthlyRevenue = annualRevenue / 12;
  const reportsPerMonth = (v.checksPerMonth * v.reportRate) / 100;
  const monthlyCost = v.checksPerMonth * v.costPerCheck + reportsPerMonth * v.reviewCostPerReport;
  const annualCost = monthlyCost * 12;
  const monthlyMargin = monthlyRevenue - monthlyCost;
  const annualMargin = annualRevenue - annualCost;
  const marginPct = monthlyRevenue === 0 ? null : monthlyMargin / monthlyRevenue;
  return {
    payingCampus,
    payingPrograma,
    annualRevenue,
    monthlyRevenue,
    reportsPerMonth,
    monthlyCost,
    annualCost,
    monthlyMargin,
    annualMargin,
    marginPct,
  };
}
