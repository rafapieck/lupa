import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SiteFooter from "../site-footer";
import PricingPage from "./page";
import { NEVER_PAYWALLED, PRICES_NOTE, PRICING_SUBTITLE, SOON_LABEL, TIERS } from "./tiers";

const html = () => renderToStaticMarkup(<PricingPage />);

describe("/pricing tiers (F2)", () => {
  it("shows the title, subtitle and the three tiers with their prices and tags", () => {
    const page = html();
    expect(page).toContain("Precios");
    expect(page).toContain(PRICING_SUBTITLE);
    for (const text of [
      "Buscador · $0 · Gratis para siempre",
      "Campus · $24,000 MXN/año",
      "Programa · $90,000 MXN/año",
      "Sin cuenta",
      "Universidades y municipios",
      "Servicios estatales y fundaciones",
      "Revisa cualquier oferta en 30 segundos",
      "Semáforo con razones",
      "Botón para reportar",
      "Lupa en tu bolsa de trabajo",
      "Revisión de las vacantes que publicas, con alerta mensual",
      "Reporte mensual de patrones de fraude (solo datos agregados)",
      "Todo lo de Campus",
      "Tablero estatal por estado y canal (solo datos agregados)",
      "Varios portales y programas",
    ]) {
      expect(page).toContain(text);
    }
  });

  it("says prices are before IVA and checks are never paywalled", () => {
    expect(html()).toContain(PRICES_NOTE);
    expect(html()).toContain(NEVER_PAYWALLED);
  });

  it("marks Campus as recommended", () => {
    expect(TIERS.filter((t) => t.recommended).map((t) => t.id)).toEqual(["campus"]);
  });

  it("every tier card says checking an offer is free (PACKET §12d)", () => {
    for (const t of TIERS) expect(t.freeNote).toMatch(/gratis/);
  });

  it("Programa promises aggregated data by state and channel, never individual data", () => {
    const programa = TIERS.find((t) => t.id === "programa")!;
    expect(programa.freeNote).toContain("agregado por estado y canal");
    expect(programa.freeNote).toContain("nunca datos de una persona");
  });

  it("marks unbuilt features (vacancy checks, state dashboard) as in development", () => {
    const soon = TIERS.flatMap((t) => t.features.filter((f) => f.soon).map((f) => f.text));
    expect(soon).toEqual([
      "Revisión de las vacantes que publicas, con alerta mensual",
      "Tablero estatal por estado y canal (solo datos agregados)",
    ]);
    expect(html().split(SOON_LABEL).length - 1).toBeGreaterThanOrEqual(2);
  });

  it("is linked from the footer", () => {
    expect(renderToStaticMarkup(<SiteFooter />)).toContain('href="/pricing"');
  });
});
