// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { formatCount, formatMoney, formatPct } from "@/lib/pricing/format";
import Simulator, { NOTE_FLOOR, NOTE_TAX, SIM_BANNER } from "./simulator";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const input = (name: string) => container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
const out = (id: string) => container.querySelector(`[data-testid="${id}"]`)!;
const text = (id: string) => out(id).textContent;

/** Types like a user would: React listens to the native value setter + input event. */
function type(name: string, value: string) {
  const el = input(name);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function fill(values: Record<string, string>) {
  for (const [k, v] of Object.entries(values)) type(k, v);
}
function clickPeriod(label: "Mensual" | "Anual") {
  const btn = [...container.querySelectorAll("button")].find((b) => b.textContent === label)!;
  act(() => btn.click());
}

describe("format helpers", () => {
  it("formats money, percent and counts for display", () => {
    expect(formatMoney(15500)).toBe("$15,500.00");
    expect(formatMoney(-2500)).toBe("−$2,500.00");
    expect(formatMoney(0)).toBe("$0.00");
    expect(formatMoney(-0.001)).toBe("$0.00");
    expect(formatPct(0.967742)).toBe("96.8%");
    expect(formatPct(-4.2)).toBe("−420.0%");
    expect(formatPct(null)).toBe("—");
    expect(formatCount(1500)).toBe("1,500");
  });
});

describe("/pricing simulator (F3)", () => {
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<Simulator />));
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("shows the banner, labels on every default, and the notes", () => {
    const t = container.textContent!;
    expect(t).toContain(SIM_BANNER);
    expect(t).toContain(NOTE_FLOOR);
    expect(t).toContain(NOTE_TAX);
    expect(t).toContain("opcional");
    const rows = container.querySelectorAll("[data-field]");
    expect(rows.length).toBe(9);
    for (const row of rows) expect(row.textContent).toMatch(/inventado|supuesto|precio de lista/);
  });

  it("uses numeric keyboards", () => {
    expect(input("campusPipeline").getAttribute("inputmode")).toBe("numeric");
    expect(input("conversionRate").getAttribute("inputmode")).toBe("decimal");
    expect(input("costPerCheck").getAttribute("inputmode")).toBe("decimal");
  });

  it("Case 1: defaults, monthly and annual", () => {
    expect(input("campusPrice").value).toBe("24,000");
    expect(text("revenue")).toBe("$15,500.00");
    expect(text("cost")).toBe("$500.00");
    expect(text("margin")).toBe("$15,000.00 (96.8%)");
    expect(text("reports")).toBe("200");
    clickPeriod("Anual");
    expect(text("revenue")).toBe("$186,000.00");
    expect(text("cost")).toBe("$6,000.00");
    expect(text("margin")).toBe("$180,000.00 (96.8%)");
    expect(text("reports")).toBe("200");
  });

  it("Case 2: typed by hand, revenue 0 shows — and a red negative margin", () => {
    fill({ campusPipeline: "0", programaPipeline: "0", checksPerMonth: "50,000", reportRate: "3" });
    expect(text("revenue")).toBe("$0.00");
    expect(text("cost")).toBe("$2,500.00");
    expect(text("margin")).toBe("−$2,500.00 (—)");
    expect(out("margin").className).toContain("text-red-700");
    expect(text("reports")).toBe("1,500");
    clickPeriod("Anual");
    expect(text("cost")).toBe("$30,000.00");
    expect(text("margin")).toBe("−$30,000.00 (—)");
  });

  it("Case 3: typed by hand, rounds partial institutions down", () => {
    fill({
      campusPipeline: "7",
      programaPipeline: "3",
      conversionRate: "15",
      campusPrice: "30000",
      checksPerMonth: "200000",
      reportRate: "1.5",
      reviewCostPerReport: "1.00",
    });
    expect(text("paying")).toContain("1 Campus · 0 Programa");
    expect(text("revenue")).toBe("$2,500.00");
    expect(text("cost")).toBe("$13,000.00");
    expect(text("margin")).toBe("−$10,500.00 (−420.0%)");
    expect(text("reports")).toBe("3,000");
    clickPeriod("Anual");
    expect(text("revenue")).toBe("$30,000.00");
    expect(text("cost")).toBe("$156,000.00");
    expect(text("margin")).toBe("−$126,000.00 (−420.0%)");
  });

  it("101 in conversion shows the inline error and keeps the last valid results", () => {
    type("conversionRate", "101");
    expect(container.textContent).toContain("Debe estar entre 0 y 100");
    expect(input("conversionRate").getAttribute("aria-invalid")).toBe("true");
    expect(text("revenue")).toBe("$15,500.00");
    type("conversionRate", "40");
    expect(container.textContent).not.toContain("Debe estar entre 0 y 100");
    expect(text("revenue")).toBe("$31,000.00");
  });

  it("keeps results from the last valid state, not the defaults", () => {
    type("checksPerMonth", "20000");
    type("costPerCheck", "abc");
    expect(container.textContent).toContain("Escribe un número");
    expect(text("cost")).toBe("$1,000.00");
  });
});
