import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({ connection: () => Promise.resolve() }));
const getChecksThisWeek = vi.fn();
vi.mock("@/lib/checks-this-week", () => ({ getChecksThisWeek: () => getChecksThisWeek() }));

import AboutPage from "./about/page";
import ChecksThisWeek, { CHECKS_LABEL } from "./about/checks-this-week";
import ProductPage from "./product/page";
import SiteHeader from "./site-header";

afterEach(() => getChecksThisWeek.mockReset());

describe("site header", () => {
  it("links to the checker, Cómo funciona and Nosotros", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    for (const text of ["Lupa", "Revisar oferta", "Cómo funciona", "Nosotros"]) expect(html).toContain(text);
    expect(html).toContain('href="/product"');
    expect(html).toContain('href="/about"');
  });
});

describe("/product", () => {
  it("shows the 3 steps and says the AI only reads", () => {
    const html = renderToStaticMarkup(<ProductPage />);
    expect(html).toContain("Pegas la oferta");
    expect(html).toContain("Buscamos señales de fraude verificadas");
    expect(html).toContain("Te decimos el riesgo, la fuente y qué hacer");
    expect(html).toContain("La IA solo lee");
    expect(html).toContain("alertas oficiales");
  });
});

describe("/about", () => {
  it("states the need, who pays and the 10:1 case", () => {
    const html = renderToStaticMarkup(<AboutPage />);
    expect(html).toContain("Por qué existe Lupa");
    expect(html).toContain("Quien busca trabajo nunca paga");
    expect(html).toContain("nadie puede comprar un resultado");
    expect(html).toContain("decides por corazonada");
    expect(html).toContain("en menos de 30 segundos, gratis");
  });

  it("shows the live North Star number", async () => {
    getChecksThisWeek.mockResolvedValue(1234);
    const html = renderToStaticMarkup(await ChecksThisWeek());
    expect(html).toContain(CHECKS_LABEL);
    expect(html).toContain("1,234");
  });

  it("hides the number (and shows no error) when the call fails", async () => {
    getChecksThisWeek.mockResolvedValue(null);
    expect(await ChecksThisWeek()).toBeNull();
  });
});
