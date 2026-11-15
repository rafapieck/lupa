import { FIELD_SPECS, FORMULA_VERSION, type FieldName, type RawInputs, type SimInputs } from "./simulate";

// Maps simulator inputs to the `scenarios` table (PACKET §9) and back.
// Only inputs are stored; outputs are always recomputed with simulate().
// user_id is never sent: the DB default auth.uid() fills it, and RLS checks it.

export const COLUMN: Record<FieldName, string> = {
  campusPipeline: "campus_pipeline",
  programaPipeline: "programa_pipeline",
  conversionRate: "conversion_rate",
  campusPrice: "campus_price",
  programaPrice: "programa_price",
  checksPerMonth: "checks_per_month",
  reportRate: "report_rate",
  costPerCheck: "cost_per_check",
  reviewCostPerReport: "review_cost_per_report",
};

export const SCENARIO_COLUMNS = ["id", "name", "created_at", "formula_version", ...Object.values(COLUMN)].join(", ");

export type ScenarioRow = {
  id: string;
  name: string;
  created_at: string;
  formula_version: number;
} & Record<string, unknown>;

export function toInsertRow(name: string, values: SimInputs): Record<string, string | number> {
  const row: Record<string, string | number> = { name, formula_version: FORMULA_VERSION };
  for (const f of FIELD_SPECS) row[COLUMN[f.name]] = values[f.name];
  return row;
}

/** Row → raw inputs for validateInputs(). numeric columns may arrive as strings or numbers. */
export function rowToRaw(row: ScenarioRow): RawInputs {
  const raw: RawInputs = {};
  for (const f of FIELD_SPECS) {
    const v = row[COLUMN[f.name]];
    raw[f.name] = typeof v === "number" || typeof v === "string" ? v : undefined;
  }
  return raw;
}
