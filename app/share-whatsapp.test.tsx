// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scoreSignals } from "@/lib/score";
import { OFFER_1, OFFER_2, OFFER_3, OFFER_4, OFFER_5 } from "@/lib/fixtures/offers";
import { WA_BUTTON, WA_NOTE, parseShare, shareLinkFor, whatsappMessage } from "@/lib/share";
import ResultView, { type CheckResult } from "./result-view";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const CHECK_ID = "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e";
const red: CheckResult = {
  ...scoreSignals({ asks_for_payment: true, asks_for_personal_documents: true }),
  simulated: false,
  checkId: CHECK_ID,
};
const yellow: CheckResult = { ...scoreSignals({ asks_for_payment: true }), simulated: false, checkId: CHECK_ID };
const green: CheckResult = { ...scoreSignals({ no_company_name: true }), simulated: false, checkId: CHECK_ID };

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

function render(result: CheckResult, isExample = false) {
  act(() => root.render(<ResultView result={result} isExample={isExample} onReset={() => {}} />));
}
const shareLink = () => container.querySelector<HTMLAnchorElement>('[data-testid="share-whatsapp"]');

describe("Mandar aviso por WhatsApp (PACKET §14b)", () => {
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

  it("🔴 shows the button, opens wa.me in a new tab and logs `shared` once", () => {
    expect(red.verdict).toBe("red");
    render(red);
    const link = shareLink()!;
    expect(link.textContent).toContain(WA_BUTTON);
    expect(container.textContent).toContain(WA_NOTE);
    expect(link.target).toBe("_blank");
    const url = new URL(link.href);
    expect(url.origin + url.pathname).toBe("https://wa.me/");
    const text = url.searchParams.get("text")!;
    expect(text).toBe(
      "Revisé una oferta de trabajo en Lupa y tiene señales de fraude. Mira cuáles antes de pagar: " +
        "https://www.lupaempleo.xyz/s/red/upfront_payment,personal_documents",
    );

    // jsdom can't open tabs; stop navigation and just check the event.
    link.addEventListener("click", (e) => e.preventDefault());
    act(() => link.click());
    act(() => link.click());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [path, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/api/event");
    expect(JSON.parse(init.body as string)).toEqual({ checkId: CHECK_ID, kind: "shared" });
  });

  it("🟡 shows the button too", () => {
    expect(yellow.verdict).toBe("yellow");
    render(yellow);
    expect(shareLink()?.href).toContain(encodeURIComponent("/s/yellow/upfront_payment"));
  });

  it("🟢 has no button", () => {
    expect(green.verdict).toBe("green");
    render(green);
    expect(shareLink()).toBeNull();
    expect(container.textContent).not.toContain(WA_BUTTON);
    expect(shareLinkFor(green)).toBeNull();
  });

  it("the example offer has no button", () => {
    render(red, true);
    expect(shareLink()).toBeNull();
  });

  it("still shares when the check wasn't saved, but sends no event", () => {
    render({ ...red, checkId: null });
    const link = shareLink()!;
    link.addEventListener("click", (e) => e.preventDefault());
    act(() => link.click());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("every link it builds opens a valid card", () => {
    for (const r of [red, yellow]) {
      const [, , v, p] = shareLinkFor(r)!.split("/");
      expect(parseShare(v, p)).not.toBeNull();
    }
  });

  it("the message contains no offer text", () => {
    const msg = whatsappMessage(shareLinkFor(red)!);
    // Fixed text + link, nothing else.
    expect(msg).toMatch(/^Revisé una oferta de trabajo en Lupa y tiene señales de fraude\. Mira cuáles antes de pagar: https:\/\/www\.lupaempleo\.xyz\/s\/red\/[a-z_,]+$/);
    // No 12-character stretch of any test offer appears in it.
    for (const offer of [OFFER_1, OFFER_2, OFFER_3, OFFER_4, OFFER_5]) {
      for (let i = 0; i + 12 <= offer.length; i++) expect(msg).not.toContain(offer.slice(i, i + 12));
    }
    expect(msg).not.toMatch(/\d|\$|@/); // no amounts, phones, dates or emails
    expect(msg).not.toMatch(/segur[ao]|confiable|leg[ií]tim/i);
  });
});
