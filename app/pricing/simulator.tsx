"use client";

import { useState } from "react";
import { formatCount, formatInput, formatMoney, formatPct, isNegative } from "@/lib/pricing/format";
import {
  DEFAULTS,
  FIELD_SPECS,
  defaultValues,
  simulate,
  validateInputs,
  type FieldName,
  type SimInputs,
} from "@/lib/pricing/simulate";

export const SIM_TITLE = "Simulador de ingresos";
export const SIM_BANNER = "Datos inventados para simular. No son resultados reales.";
export const NOTE_FLOOR = "Instituciones parciales se redondean hacia abajo.";
export const NOTE_TAX = "Sin IVA.";

type FieldUi = { label: string; prefix?: string; suffix?: string; optional?: boolean };

export const FIELD_UI: Record<FieldName, FieldUi> = {
  campusPipeline: { label: "Instituciones Campus en pipeline" },
  programaPipeline: { label: "Instituciones Programa en pipeline" },
  conversionRate: { label: "Tasa de conversión", suffix: "%" },
  campusPrice: { label: "Precio Campus", prefix: "$", suffix: "MXN/año" },
  programaPrice: { label: "Precio Programa", prefix: "$", suffix: "MXN/año" },
  checksPerMonth: { label: "Revisiones al mes" },
  reportRate: { label: "Tasa de reportes", suffix: "%" },
  costPerCheck: { label: "Costo por revisión", prefix: "$", suffix: "MXN" },
  reviewCostPerReport: { label: "Costo de revisar cada reporte", prefix: "$", suffix: "MXN", optional: true },
};

type RawState = Record<FieldName, string>;
type Period = "monthly" | "annual";

const initialRaw = (): RawState =>
  Object.fromEntries(FIELD_SPECS.map((f) => [f.name, formatInput(DEFAULTS[f.name].value)])) as RawState;

export default function Simulator() {
  const [raw, setRaw] = useState<RawState>(initialRaw);
  const [lastValid, setLastValid] = useState<SimInputs>(defaultValues);
  const [period, setPeriod] = useState<Period>("monthly");

  const validation = validateInputs(raw);
  const errors = validation.ok ? {} : validation.errors;
  const result = simulate(validation.ok ? validation.values : lastValid);

  function onChange(name: FieldName, value: string) {
    const next = { ...raw, [name]: value };
    setRaw(next);
    const v = validateInputs(next);
    if (v.ok) setLastValid(v.values);
  }

  const monthly = period === "monthly";
  const revenue = monthly ? result.monthlyRevenue : result.annualRevenue;
  const cost = monthly ? result.monthlyCost : result.annualCost;
  const margin = monthly ? result.monthlyMargin : result.annualMargin;

  return (
    <section aria-labelledby="sim-title" className="flex flex-col gap-4">
      <h2 id="sim-title" className="text-3xl font-bold tracking-tight">
        {SIM_TITLE}
      </h2>
      <p role="note" className="rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-lg leading-snug text-amber-950">
        <span aria-hidden="true">⚠️ </span>
        {SIM_BANNER}
      </p>

      <div className="flex flex-col gap-4">
        {FIELD_SPECS.map((spec) => {
          const ui = FIELD_UI[spec.name];
          const id = `sim-${spec.name}`;
          const error = errors[spec.name];
          return (
            <div key={spec.name} className="flex flex-col gap-1" data-field={spec.name}>
              <label htmlFor={id} className="flex flex-wrap items-center gap-2 text-lg font-medium text-gray-900">
                {ui.label}
                <span className="rounded bg-gray-200 px-2 text-sm font-normal text-gray-700">
                  {DEFAULTS[spec.name].label}
                </span>
                {ui.optional && <span className="text-sm font-normal text-gray-600">opcional</span>}
              </label>
              <div
                className={`flex items-center rounded-xl border-2 bg-white px-3 ${
                  error ? "border-red-600" : "border-gray-300 focus-within:border-blue-700"
                }`}
              >
                {ui.prefix && <span className="pr-1 text-lg text-gray-600">{ui.prefix}</span>}
                <input
                  id={id}
                  name={spec.name}
                  type="text"
                  inputMode={spec.maxDecimals === 0 ? "numeric" : "decimal"}
                  autoComplete="off"
                  value={raw[spec.name]}
                  onChange={(e) => onChange(spec.name, e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className="min-w-0 flex-1 bg-transparent py-3 text-lg outline-none"
                />
                {ui.suffix && <span className="pl-1 text-base whitespace-nowrap text-gray-600">{ui.suffix}</span>}
              </div>
              {error && (
                <p id={`${id}-error`} className="text-base font-medium text-red-700">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5" aria-live="polite">
        <div role="group" aria-label="Periodo" className="grid grid-cols-2 rounded-full bg-gray-100 p-1">
          {(["monthly", "annual"] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={`rounded-full py-2 text-lg font-semibold ${
                period === p ? "bg-white text-gray-900 shadow" : "text-gray-600"
              }`}
            >
              {p === "monthly" ? "Mensual" : "Anual"}
            </button>
          ))}
        </div>

        <dl className="mt-4 flex flex-col gap-2 text-lg">
          <Row label="Ingresos" value={formatMoney(revenue)} negative={isNegative(revenue)} testId="revenue" />
          <Row label="Costos" value={formatMoney(cost)} negative={false} testId="cost" />
          <Row
            label="Margen"
            value={`${formatMoney(margin)} (${formatPct(result.marginPct)})`}
            negative={isNegative(margin)}
            testId="margin"
          />
          <Row label="Reportes al mes" value={formatCount(result.reportsPerMonth)} negative={false} testId="reports" />
        </dl>
        <p className="mt-3 text-base leading-snug text-gray-600" data-testid="paying">
          Instituciones que pagan: {result.payingCampus} Campus · {result.payingPrograma} Programa
        </p>
      </div>

      <div className="text-base leading-snug text-gray-600">
        <p>{NOTE_FLOOR}</p>
        <p>{NOTE_TAX}</p>
      </div>
    </section>
  );
}

function Row({ label, value, negative, testId }: { label: string; value: string; negative: boolean; testId: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
      <dt className="text-gray-700">{label}</dt>
      <dd data-testid={testId} className={`font-semibold tabular-nums ${negative ? "text-red-700" : "text-gray-900"}`}>
        {value}
      </dd>
    </div>
  );
}
