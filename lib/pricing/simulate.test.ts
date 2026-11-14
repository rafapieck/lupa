import { describe, expect, it } from "vitest";
import {
  DEFAULTS,
  FIELD_SPECS,
  FORMULA_VERSION,
  defaultValues,
  simulate,
  validateInputs,
  validateScenarioName,
  type SimInputs,
} from "./simulate";

const CASE_1: SimInputs = {
  campusPipeline: 20,
  programaPipeline: 5,
  conversionRate: 20,
  campusPrice: 24_000,
  programaPrice: 90_000,
  checksPerMonth: 10_000,
  reportRate: 2,
  costPerCheck: 0.05,
  reviewCostPerReport: 0,
};
const CASE_2: SimInputs = { ...CASE_1, campusPipeline: 0, programaPipeline: 0, checksPerMonth: 50_000, reportRate: 3 };
const CASE_3: SimInputs = {
  campusPipeline: 7,
  programaPipeline: 3,
  conversionRate: 15,
  campusPrice: 30_000,
  programaPrice: 90_000,
  checksPerMonth: 200_000,
  reportRate: 1.5,
  costPerCheck: 0.05,
  reviewCostPerReport: 1,
};

const asStrings = (v: SimInputs) => Object.fromEntries(Object.entries(v).map(([k, n]) => [k, String(n)]));

describe("simulate (PACKET §12a)", () => {
  it("Case 1: defaults", () => {
    const r = simulate(CASE_1);
    expect(r.payingCampus).toBe(4);
    expect(r.payingPrograma).toBe(1);
    expect(r.annualRevenue).toBeCloseTo(186_000, 2);
    expect(r.monthlyRevenue).toBeCloseTo(15_500, 2);
    expect(r.reportsPerMonth).toBe(200);
    expect(r.monthlyCost).toBeCloseTo(500, 2);
    expect(r.annualCost).toBeCloseTo(6_000, 2);
    expect(r.monthlyMargin).toBeCloseTo(15_000, 2);
    expect(r.annualMargin).toBeCloseTo(180_000, 2);
    expect(r.marginPct).toBeCloseTo(0.967742, 6);
  });

  it("Case 2: no institutions, the free side still costs money", () => {
    const r = simulate(CASE_2);
    expect(r.payingCampus).toBe(0);
    expect(r.payingPrograma).toBe(0);
    expect(r.annualRevenue).toBe(0);
    expect(r.monthlyRevenue).toBe(0);
    expect(r.reportsPerMonth).toBe(1_500);
    expect(r.monthlyCost).toBeCloseTo(2_500, 2);
    expect(r.annualCost).toBeCloseTo(30_000, 2);
    expect(r.monthlyMargin).toBeCloseTo(-2_500, 2);
    expect(r.annualMargin).toBeCloseTo(-30_000, 2);
    expect(r.marginPct).toBeNull();
  });

  it("Case 3: rounds partial institutions down, review cost on, a loss", () => {
    const r = simulate(CASE_3);
    expect(r.payingCampus).toBe(1);
    expect(r.payingPrograma).toBe(0);
    expect(r.annualRevenue).toBeCloseTo(30_000, 2);
    expect(r.monthlyRevenue).toBeCloseTo(2_500, 2);
    expect(r.reportsPerMonth).toBe(3_000);
    expect(r.monthlyCost).toBeCloseTo(13_000, 2);
    expect(r.annualCost).toBeCloseTo(156_000, 2);
    expect(r.monthlyMargin).toBeCloseTo(-10_500, 2);
    expect(r.annualMargin).toBeCloseTo(-126_000, 2);
    expect(r.marginPct).toBeCloseTo(-4.2, 6);
  });

  it("floor never hits float error (e.g. 10 × 7% = 0.7, 100 × 7% = 7)", () => {
    expect(simulate({ ...CASE_1, campusPipeline: 100, conversionRate: 7 }).payingCampus).toBe(7);
    expect(simulate({ ...CASE_1, campusPipeline: 10, conversionRate: 7 }).payingCampus).toBe(0);
    expect(simulate({ ...CASE_1, campusPipeline: 100, conversionRate: 0.29 }).payingCampus).toBe(0);
    expect(simulate({ ...CASE_1, campusPipeline: 1000, conversionRate: 0.29 }).payingCampus).toBe(2);
  });
});

describe("DEFAULTS and FORMULA_VERSION", () => {
  it("match PACKET §3 Case 1, with a label on every field", () => {
    expect(defaultValues()).toEqual(CASE_1);
    for (const f of FIELD_SPECS) expect(["inventado", "supuesto", "precio de lista"]).toContain(DEFAULTS[f.name].label);
    expect(DEFAULTS.costPerCheck.label).toBe("supuesto");
    expect(DEFAULTS.campusPrice.label).toBe("precio de lista");
    expect(FORMULA_VERSION).toBe(1);
  });
});

describe("validateInputs (PACKET §12b)", () => {
  const base = asStrings(CASE_1);
  const errorOn = (field: string, value: string) => {
    const r = validateInputs({ ...base, [field]: value });
    expect(r.ok).toBe(false);
    return r.ok ? undefined : r.errors[field as keyof typeof r.errors];
  };

  it("rejects conversion 101 with the range message", () => {
    expect(errorOn("conversionRate", "101")).toBe("Debe estar entre 0 y 100");
  });
  it("rejects a fractional pipeline", () => {
    expect(errorOn("campusPipeline", "2.5")).toBe("Debe ser un número entero");
  });
  it("rejects negative checks", () => {
    expect(errorOn("checksPerMonth", "-1")).toBe("Debe estar entre 0 y 10,000,000");
  });
  it("rejects letters and empty values", () => {
    expect(errorOn("costPerCheck", "abc")).toBe("Escribe un número");
    expect(errorOn("costPerCheck", "")).toBe("Escribe un número");
    expect(errorOn("costPerCheck", "   ")).toBe("Escribe un número");
  });
  it("rejects scientific notation", () => {
    expect(errorOn("campusPrice", "1e9")).toBe("Escribe un número");
  });
  it("rejects out-of-range and too many decimals", () => {
    expect(errorOn("campusPrice", "1000001")).toBe("Debe estar entre 0 y 1,000,000");
    expect(errorOn("costPerCheck", "0.00001")).toBe("Usa máximo 4 decimales");
    expect(errorOn("reportRate", "2.555")).toBe("Usa máximo 2 decimales");
  });
  it("rejects NaN, Infinity, missing fields and odd formats", () => {
    expect(validateInputs({ ...base, conversionRate: Number.NaN }).ok).toBe(false);
    expect(validateInputs({ ...base, checksPerMonth: Number.POSITIVE_INFINITY }).ok).toBe(false);
    expect(validateInputs({ ...base, campusPrice: undefined }).ok).toBe(false);
    for (const bad of ["1.", ".5", "+5", "0x10", "1 000", "5%", "$5"]) expect(errorOn("campusPipeline", bad)).toBeDefined();
  });
  it("marks only the bad field", () => {
    const r = validateInputs({ ...base, conversionRate: "101" });
    expect(r.ok ? {} : r.errors).toEqual({ conversionRate: "Debe estar entre 0 y 100" });
  });

  it("passes the defaults as strings and strips thousands commas", () => {
    const r = validateInputs({ ...base, campusPrice: "24,000", checksPerMonth: " 10,000 " });
    expect(r).toEqual({ ok: true, values: CASE_1 });
  });
  it("accepts numbers and the range limits", () => {
    expect(validateInputs(CASE_1)).toEqual({ ok: true, values: CASE_1 });
    expect(validateInputs({ ...base, conversionRate: "100", campusPipeline: "0", costPerCheck: "0.0001" }).ok).toBe(true);
  });
});

describe("validateScenarioName", () => {
  it("rejects 61 characters and whitespace-only names", () => {
    expect(validateScenarioName("a".repeat(61)).ok).toBe(false);
    expect(validateScenarioName("   ").ok).toBe(false);
    expect(validateScenarioName("").ok).toBe(false);
  });
  it("accepts 1–60 characters and trims", () => {
    expect(validateScenarioName("  Escenario A  ")).toEqual({ ok: true, name: "Escenario A" });
    expect(validateScenarioName("a".repeat(60)).ok).toBe(true);
  });
});
