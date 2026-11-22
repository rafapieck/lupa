import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_SAFE_TIP, VERDICT_LABELS, scoreSignals } from "@/lib/score";
import { OFFER_4 } from "@/lib/fixtures/offers";
import { keywordSignals } from "@/lib/keywords";
import ResultView, { GREEN_DETAILS_TITLE } from "./result-view";
import { LOCAL_PATTERNS } from "@/lib/patterns";
import { CARD_FOOTER, SERIES_A, SERIES_C } from "@/lib/cards";
import { OG_FOOTER, OG_LABEL, SHARE_CTA, SHARE_NOTE, WA_BUTTON, WA_NOTE, sharePath, whatsappMessage } from "@/lib/share";
import { PROMISE_LINE } from "./contenido/content";
import ContenidoPage from "./contenido/page";
import SharePage from "./s/[verdict]/[patterns]/page";

// Charter principle 3 + PACKET §10.1: Lupa never says an offer is safe, real,
// trustworthy or legitimate.
const FORBIDDEN = /segur[ao]s?|es real|confiable|leg[ií]tim/i;

// The one allowed mention: /contenido states the promise Lupa will NOT make
// (PACKET §2, prompt F6). Only this exact negated sentence is removed before
// scanning; any other "es real" still fails.
const withoutPromise = (text: string) => text.split(PROMISE_LINE).join("");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

describe("copy audit: green never claims an offer is safe", () => {
  // User-facing strings live in app/ plus the labels and tips in these lib files.
  const files = [
    ...sourceFiles(path.resolve(__dirname)),
    ...["score.ts", "patterns.ts", "validate.ts", "share.ts", "cards.ts"].map((f) => path.resolve(__dirname, "../lib", f)),
  ];

  it.each(files.map((f) => [path.relative(path.resolve(__dirname, ".."), f), f]))(
    '%s has no "segura", "es real", "confiable" or "legítima"',
    (_rel, file) => {
      expect(withoutPromise(readFileSync(file, "utf8"))).not.toMatch(FORBIDDEN);
    },
  );

  it("labels green as 'No encontramos señales de alerta'", () => {
    expect(VERDICT_LABELS.green).toBe("No encontramos señales de alerta");
  });

  it("always shows the safe tip with a green verdict", () => {
    const result = scoreSignals(keywordSignals(OFFER_4));
    expect(result.verdict).toBe("green");
    const html = renderToStaticMarkup(
      <ResultView result={{ ...result, simulated: false }} isExample={false} onReset={() => {}} />,
    );
    expect(html).toContain("No encontramos señales de alerta");
    expect(html).toContain(DEFAULT_SAFE_TIP);
    expect(html).not.toMatch(FORBIDDEN);
  });

  it("does not call minor green matches 'señales de alerta encontradas'", () => {
    const result = scoreSignals({ no_company_name: true });
    expect(result.verdict).toBe("green");
    expect(result.matches.length).toBe(1);
    const html = renderToStaticMarkup(
      <ResultView result={{ ...result, simulated: false }} isExample={false} onReset={() => {}} />,
    );
    expect(html).toContain(GREEN_DETAILS_TITLE);
    expect(html).not.toContain("Señales de alerta encontradas");
    expect(html).toContain("Fuente:");
  });
});

describe("copy audit: Week 15 shared and content surfaces (PACKET §14e)", () => {
  it("the promise line is the negated one, and only it mentions 'es real'", () => {
    expect(PROMISE_LINE.startsWith("Lupa no te dice si una oferta es real.")).toBe(true);
    expect(withoutPromise(PROMISE_LINE)).toBe("");
  });

  it("/contenido rendered HTML", () => {
    const html = renderToStaticMarkup(<ContenidoPage />);
    expect(html).toContain("Contenido de Lupa");
    expect(html).toContain('href="/?src=contenido"');
    expect(html).toContain("Ejemplo con datos de prueba");
    expect(html.match(/loading="lazy"/g)?.length).toBe(3);
    expect(withoutPromise(html.replaceAll("&quot;", '"'))).not.toMatch(FORBIDDEN);
  });

  it.each([
    ["red", "upfront_payment,personal_documents"],
    ["yellow", "upfront_payment"],
    ["red", LOCAL_PATTERNS.slice(0, 6).map((p) => p.id).join(",")],
  ])("/s/%s/%s rendered HTML", async (verdict, patterns) => {
    const html = renderToStaticMarkup(await SharePage({ params: Promise.resolve({ verdict, patterns }) }));
    expect(html).not.toMatch(FORBIDDEN);
  });

  it("card and OG image text", () => {
    const text = [
      SERIES_A.label,
      SERIES_C.label,
      SERIES_C.headline,
      ...SERIES_C.lines,
      CARD_FOOTER,
      OG_LABEL,
      OG_FOOTER,
      ...LOCAL_PATTERNS.flatMap((p) => [p.label_es, p.next_step_es, `Fuente: ${p.source}`]),
    ].join("\n");
    expect(text).not.toMatch(FORBIDDEN);
  });

  it("the WhatsApp message and share buttons", () => {
    const ids = LOCAL_PATTERNS.map((p) => p.id);
    for (const msg of [whatsappMessage(sharePath("red", ids)), whatsappMessage(sharePath("yellow", ids.slice(0, 1)))]) {
      expect(msg).not.toMatch(FORBIDDEN);
    }
    expect([WA_BUTTON, WA_NOTE, SHARE_CTA, SHARE_NOTE].join(" ")).not.toMatch(FORBIDDEN);
  });
});
