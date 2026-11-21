import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { LOCAL_PATTERNS } from "@/lib/patterns";
import { OFFER_1, OFFER_3 } from "@/lib/fixtures/offers";
import SharePage from "./s/[verdict]/[patterns]/page";
import { proxy } from "../proxy";

const params = (verdict: string, patterns: string) => ({ params: Promise.resolve({ verdict, patterns }) });

async function render(verdict: string, patterns: string) {
  return renderToStaticMarkup(await SharePage(params(verdict, patterns)));
}

function rewriteOf(path: string) {
  return proxy(new NextRequest(`https://www.lupaempleo.xyz${path}`)).headers.get("x-middleware-rewrite");
}

describe("/s/[verdict]/[patterns] (PACKET §14b)", () => {
  it("renders signals, sources, next step and the CTA", async () => {
    const html = await render("red", "upfront_payment,personal_documents");
    for (const id of ["upfront_payment", "personal_documents"]) {
      const p = LOCAL_PATTERNS.find((x) => x.id === id)!;
      expect(html).toContain(p.label_es);
      expect(html).toContain(`Fuente: ${p.source}`);
    }
    expect(html).toContain("Riesgo alto");
    expect(html).toContain("Revisa tu oferta");
    expect(html).toContain('href="/?src=wa_share"');
    expect(html).toContain("Este aviso solo muestra señales de alerta. No incluye la oferta original.");
  });

  it("carries no offer text, phone, date or check id", async () => {
    const html = await render("red", "upfront_payment,personal_documents");
    for (const offer of [OFFER_1, OFFER_3]) expect(html).not.toContain(offer.slice(0, 30));
    expect(html).not.toMatch(/\d{3}[\s-]?\d{3}[\s-]?\d{4}/); // phone
    expect(html).not.toMatch(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/); // date
    expect(html).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-/i); // check id (uuid)
  });

  it.each([
    ["green", "upfront_payment"],
    ["red", "fake_id"],
    ["red", LOCAL_PATTERNS.slice(0, 7).map((p) => p.id).join(",")],
  ])("/s/%s/%s → notFound()", async (verdict, patterns) => {
    await expect(SharePage(params(verdict, patterns))).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/);
  });
});

describe("proxy: invalid share links answer a real 404", () => {
  it("lets valid cards and their image through", () => {
    expect(rewriteOf("/s/red/upfront_payment,personal_documents")).toBeNull();
    expect(rewriteOf("/s/yellow/upfront_payment/opengraph-image")).toBeNull();
  });

  it.each([
    "/s/green/upfront_payment",
    "/s/red/fake_id",
    `/s/red/${LOCAL_PATTERNS.slice(0, 7).map((p) => p.id).join(",")}`,
    "/s/green/upfront_payment/opengraph-image",
  ])("rewrites %s to the not-found page", (path) => {
    expect(rewriteOf(path)).toContain("/_aviso-no-encontrado");
  });
});
