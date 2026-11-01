// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scoreSignals } from "@/lib/score";
import { COPIED_LABEL, COPY_FAILED, COPY_LABEL, REPLY_TITLE } from "./copy-reply";
import ResultView, { type CheckResult } from "./result-view";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function render(result: CheckResult) {
  act(() => root.render(<ResultView result={result} isExample={false} onReset={() => {}} />));
}

const copyButton = () =>
  [...container.querySelectorAll("button")].find((b) => b.textContent === COPY_LABEL || b.textContent === COPIED_LABEL);

// Jorge's offer: travel + housing bait and a request for his INE → red.
const redWithDocs: CheckResult = {
  ...scoreSignals({ asks_for_personal_documents: true, travel_or_housing_bait: true }),
  simulated: false,
};
const DOCS_REPLY =
  "Con gusto. ¿Me pasa el nombre y la dirección de la empresa? Mi INE la llevo en persona el día que me presente.";

describe("result screen: reply to the recruiter (persona test, Jorge)", () => {
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("shows the documents reply on red, below 'Qué hacer ahora'", () => {
    expect(redWithDocs.verdict).toBe("red");
    render(redWithDocs);
    const html = container.innerHTML;
    expect(html).toContain(REPLY_TITLE);
    expect(container.querySelector('[data-testid="reply-text"]')?.textContent).toBe(DOCS_REPLY);
    expect(html.indexOf(REPLY_TITLE)).toBeGreaterThan(html.indexOf("Qué hacer ahora"));
    expect(html.indexOf(REPLY_TITLE)).toBeLessThan(html.indexOf("Revisar otra oferta"));
    expect(copyButton()?.textContent).toBe(COPY_LABEL);
  });

  it("is hidden on green, even if a reply is present", () => {
    const green = scoreSignals({ no_company_name: true });
    expect(green.verdict).toBe("green");
    render({ ...green, reply: "should never show", simulated: false });
    expect(container.innerHTML).not.toContain(REPLY_TITLE);
    expect(copyButton()).toBeUndefined();
  });

  it("copies the exact reply and shows '¡Copiado!'", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(redWithDocs);
    await act(async () => copyButton()!.click());
    expect(writeText).toHaveBeenCalledWith(DOCS_REPLY);
    expect(copyButton()?.textContent).toBe(COPIED_LABEL);
    await act(async () => vi.advanceTimersByTime(3000));
    expect(copyButton()?.textContent).toBe(COPY_LABEL);
  });

  it("falls back to execCommand when the Clipboard API is missing", async () => {
    vi.stubGlobal("navigator", {});
    const exec = vi.fn().mockReturnValue(true);
    document.execCommand = exec;
    render(redWithDocs);
    await act(async () => copyButton()!.click());
    expect(exec).toHaveBeenCalledWith("copy");
    expect(copyButton()?.textContent).toBe(COPIED_LABEL);
  });

  it("tells the user to copy by hand if copying fails", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    document.execCommand = vi.fn().mockReturnValue(false);
    render(redWithDocs);
    await act(async () => copyButton()!.click());
    expect(container.innerHTML).toContain(COPY_FAILED);
    expect(copyButton()?.textContent).toBe(COPY_LABEL);
  });
});
