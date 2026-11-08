// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scoreSignals } from "@/lib/score";
import { hasCheckedBefore, markChecked } from "@/lib/send-event";
import { COPY_LABEL } from "./copy-reply";
import { INTENT_OPTIONS, INTENT_THANKS, INTENT_TITLE, REPORT_LINE } from "./intent-card";
import ResultView, { type CheckResult } from "./result-view";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ID = "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90";
const red: CheckResult = {
  ...scoreSignals({ asks_for_personal_documents: true, travel_or_housing_bait: true }),
  simulated: false,
  checkId: ID,
};

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

function render(result: CheckResult) {
  act(() => root.render(<ResultView result={result} isExample={false} onReset={() => {}} />));
}
const button = (label: string) => [...container.querySelectorAll("button")].find((b) => b.textContent === label);
const sentBodies = () => fetchMock.mock.calls.map((c) => JSON.parse((c[1] as RequestInit).body as string));

describe("result screen: '¿Qué vas a hacer con esta oferta?' (Week 13 event log)", () => {
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    fetchMock = vi.fn(() => Promise.resolve(new Response("{}")));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it("shows the four fixed answers below the advice, above 'Revisar otra oferta'", () => {
    render(red);
    const html = container.innerHTML;
    expect(html).toContain(INTENT_TITLE);
    for (const o of INTENT_OPTIONS) expect(button(o.label)).toBeTruthy();
    expect(html.indexOf(INTENT_TITLE)).toBeGreaterThan(html.indexOf("Qué hacer ahora"));
    expect(html.indexOf(INTENT_TITLE)).toBeLessThan(html.indexOf("Revisar otra oferta"));
  });

  it("is shown on green too", () => {
    render({ ...scoreSignals({}), simulated: false, checkId: ID });
    expect(container.innerHTML).toContain(INTENT_TITLE);
  });

  it("is hidden when the check wasn't saved (checkId null)", () => {
    render({ ...red, checkId: null });
    expect(container.innerHTML).not.toContain(INTENT_TITLE);
  });

  it("all four buttons share one neutral style (no green 'go' button)", () => {
    render(red);
    const classes = INTENT_OPTIONS.map((o) => button(o.label)!.className);
    expect(new Set(classes).size).toBe(1);
    expect(classes[0]).not.toMatch(/green|red-|blue-/);
  });

  it("sends one intent event and thanks the user", () => {
    render(red);
    act(() => button("No voy a pagar ni mandar documentos")!.click());
    expect(sentBodies()).toEqual([{ checkId: ID, kind: "intent", answer: "no_pay" }]);
    expect(container.innerHTML).toContain(INTENT_THANKS);
    expect(button("Primero voy a verificar la empresa")).toBeUndefined();
  });

  it("shows the 088 line after 'already paid'", () => {
    render(red);
    act(() => button("Ya había pagado o mandado documentos")!.click());
    expect(sentBodies()[0].answer).toBe("already_paid");
    expect(container.innerHTML).toContain(REPORT_LINE);
  });

  it("still thanks the user when the request fails", () => {
    fetchMock.mockImplementation(() => Promise.reject(new Error("offline")));
    render(red);
    act(() => button("Primero voy a verificar la empresa")!.click());
    expect(container.innerHTML).toContain(INTENT_THANKS);
  });

  it("sends one reply_copied event per result, however many copies", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: () => Promise.resolve() } });
    render(red);
    await act(async () => button(COPY_LABEL)!.click());
    await act(async () => button("¡Copiado!")!.click());
    expect(sentBodies().filter((b) => b.kind === "reply_copied")).toEqual([{ checkId: ID, kind: "reply_copied" }]);
  });
});

describe("repeat-visit flag", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("is false in a fresh browser and true after a finished check", () => {
    expect(hasCheckedBefore()).toBe(false);
    markChecked();
    expect(hasCheckedBefore()).toBe(true);
  });

  it("is false when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(hasCheckedBefore()).toBe(false);
  });
});
