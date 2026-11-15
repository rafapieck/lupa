// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { rowToRaw, toInsertRow } from "@/lib/pricing/scenario-row";
import { defaultValues, FORMULA_VERSION } from "@/lib/pricing/simulate";
import { __setBrowserSupabaseForTests } from "@/lib/supabase/browser";
import { makeFakeSupabase } from "./fake-supabase";
import { LIST_TITLE, SAVE_ERROR, SAVE_LABEL } from "./scenarios";
import Simulator from "./simulator";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const USER = { user: { id: "user-a", email: "a@example.com" } };
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const buttons = (label: string) => [...container.querySelectorAll("button")].filter((b) => b.textContent === label);
const button = (label: string) => buttons(label)[0];
const input = (name: string) => container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
const text = (id: string) => container.querySelector(`[data-testid="${id}"]`)!.textContent;
function type(name: string, value: string) {
  const el = input(name);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function click(label: string) {
  await act(async () => button(label)!.click());
  await flush();
}
async function submitName(name: string) {
  type("scenario-name", name);
  await act(async () => container.querySelector("form")!.requestSubmit());
  await flush();
}
async function mount(client: unknown) {
  __setBrowserSupabaseForTests(client as SupabaseClient | null);
  act(() => root.render(<Simulator />));
  await flush();
}

const case1Row = (over: Record<string, unknown> = {}) => ({
  id: "row-1",
  name: "Escenario A",
  created_at: "2026-11-15T12:00:00Z",
  formula_version: 1,
  ...toInsertRow("Escenario A", defaultValues()),
  // PostgREST may send numeric columns as strings
  conversion_rate: "20.00",
  cost_per_check: "0.0500",
  ...over,
});

beforeEach(() => {
  sessionStorage.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  __setBrowserSupabaseForTests(undefined);
  vi.restoreAllMocks();
});

describe("scenario row mapping", () => {
  it("inserts inputs only, plus formula_version, and never a user_id", () => {
    const row = toInsertRow("Escenario A", defaultValues());
    expect(row).toEqual({
      name: "Escenario A",
      formula_version: FORMULA_VERSION,
      campus_pipeline: 20,
      programa_pipeline: 5,
      conversion_rate: 20,
      campus_price: 24000,
      programa_price: 90000,
      checks_per_month: 10000,
      report_rate: 2,
      cost_per_check: 0.05,
      review_cost_per_report: 0,
    });
    expect(row).not.toHaveProperty("user_id");
  });
  it("reads numeric columns sent as strings", () => {
    expect(rowToRaw(case1Row() as never).costPerCheck).toBe("0.0500");
  });
});

describe("F7: save, load and delete own scenarios", () => {
  it("signed out: Guardar escenario starts Google sign-in and remembers the save", async () => {
    const fake = makeFakeSupabase();
    await mount(fake.client);
    await click(SAVE_LABEL);
    expect(fake.signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(JSON.parse(sessionStorage.getItem("lupa_pricing_pending")!).wantsSave).toBe(true);
    expect(container.textContent).not.toContain(LIST_TITLE);
  });

  it("back from sign-in after tapping save: the name field is already open", async () => {
    sessionStorage.setItem("lupa_pricing_pending", JSON.stringify({ raw: {}, wantsSave: true }));
    await mount(makeFakeSupabase({ session: USER }).client);
    expect(input("scenario-name")).not.toBeNull();
  });

  it("saves 'Escenario A' with the current inputs and lists it", async () => {
    const fake = makeFakeSupabase({ session: USER });
    await mount(fake.client);
    await click(SAVE_LABEL);
    await submitName("  Escenario A  ");
    expect(fake.calls.insert).toEqual([toInsertRow("Escenario A", defaultValues())]);
    expect(container.textContent).toContain("Escenario guardado.");
    expect(container.querySelectorAll("[data-scenario]").length).toBe(1);
    expect(container.textContent).toContain("Escenario A");
  });

  it("rejects a 61-character or blank name and saves nothing", async () => {
    const fake = makeFakeSupabase({ session: USER });
    await mount(fake.client);
    await click(SAVE_LABEL);
    await submitName("a".repeat(61));
    expect(container.textContent).toContain("Máximo 60 caracteres");
    await submitName("   ");
    expect(container.textContent).toContain("Escribe un nombre");
    expect(fake.calls.insert).toEqual([]);
  });

  it("won't save while a field is invalid", async () => {
    const fake = makeFakeSupabase({ session: USER });
    await mount(fake.client);
    type("conversionRate", "101");
    await click(SAVE_LABEL);
    await submitName("Escenario A");
    expect(fake.calls.insert).toEqual([]);
    expect(container.textContent).toContain("Corrige los campos marcados antes de guardar.");
  });

  it("a DB error shows the message and keeps the inputs", async () => {
    const fake = makeFakeSupabase({ session: USER, insertError: true });
    await mount(fake.client);
    type("checksPerMonth", "50,000");
    await click(SAVE_LABEL);
    await submitName("Escenario A");
    expect(container.textContent).toContain(SAVE_ERROR);
    expect(input("checksPerMonth").value).toBe("50,000");
  });

  it("lists newest first as returned, and Cargar recomputes Case 1 with simulate()", async () => {
    const fake = makeFakeSupabase({ session: USER, rows: [case1Row()] });
    await mount(fake.client);
    type("campusPipeline", "0");
    type("programaPipeline", "0");
    expect(text("revenue")).toBe("$0.00");
    await click("Cargar");
    expect(input("campusPipeline").value).toBe("20");
    expect(text("revenue")).toBe("$15,500.00");
    expect(text("cost")).toBe("$500.00");
    expect(text("margin")).toBe("$15,000.00 (96.8%)");
    expect(text("reports")).toBe("200");
  });

  it("Borrar asks in the page (no window.confirm), then deletes that row only", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    const fake = makeFakeSupabase({ session: USER, rows: [case1Row(), case1Row({ id: "row-2", name: "Escenario B" })] });
    await mount(fake.client);
    await act(async () => buttons("Borrar")[1].click());
    expect(container.textContent).toContain("¿Borrar este escenario?");
    expect(fake.calls.deleteIds).toEqual([]);
    await click("Sí, borrar");
    expect(fake.calls.deleteIds).toEqual(["row-2"]);
    expect(container.querySelectorAll("[data-scenario]").length).toBe(1);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("Cancelar on the delete prompt deletes nothing", async () => {
    const fake = makeFakeSupabase({ session: USER, rows: [case1Row()] });
    await mount(fake.client);
    await click("Borrar");
    await click("Cancelar");
    expect(fake.calls.deleteIds).toEqual([]);
  });

  it("renders scenario names as text, never HTML", async () => {
    const evil = '<img src=x onerror="alert(1)">';
    await mount(makeFakeSupabase({ session: USER, rows: [case1Row({ name: evil })] }).client);
    expect(container.querySelector("li img")).toBeNull();
    expect(container.querySelector("[data-scenario] p")!.textContent).toBe(evil);
  });

  it("signing out removes the list from the screen", async () => {
    const fake = makeFakeSupabase({ session: USER, rows: [case1Row()] });
    await mount(fake.client);
    expect(container.querySelectorAll("[data-scenario]").length).toBe(1);
    await click("Cerrar sesión");
    expect(container.querySelectorAll("[data-scenario]").length).toBe(0);
    expect(container.textContent).not.toContain(LIST_TITLE);
  });
});
