import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({ connection: () => Promise.resolve() }));
vi.mock("@/lib/checks-this-week", () => ({ getChecksThisWeek: () => Promise.resolve(null) }));

import AboutPage from "./page";
import { FX_LABEL, MEMO_TITLE, SOURCE_PENDING } from "./memo";

const html = renderToStaticMarkup(<AboutPage />);

describe("/about 10:1 memo (F4)", () => {
  it("is on /about with its title and the free-forever promise", () => {
    expect(html).toContain(MEMO_TITLE);
    expect(html).toContain("revisar una oferta es gratis, en todos los planes, para siempre");
    expect(html).toContain('href="/pricing"');
  });

  it("keeps the figures and names their sources, marked pending, with no invented links", () => {
    expect(html).toContain("US$2,000");
    expect(html).toContain("$36,000 MXN");
    expect(html).toContain("30%");
    expect(html).toContain("FTC");
    expect(html).toContain("Consejo Ciudadano");
    expect(html.split(SOURCE_PENDING).length - 1).toBeGreaterThanOrEqual(2);
    expect(html).toContain(FX_LABEL);
    const memoSource = readFileSync(path.resolve(__dirname, "memo.tsx"), "utf8");
    expect(memoSource).not.toMatch(/https?:\/\//);
  });

  it("promises aggregated data only", () => {
    expect(html).toContain("patrones agregados");
    expect(html).toContain("Nunca reciben los datos de ninguna persona");
  });

  it("has no 'segur', 'confiable' or 'legítim' anywhere on the page", () => {
    expect(html).not.toMatch(/segur|confiable|leg[ií]tim/i);
  });
});
