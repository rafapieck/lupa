import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SiteFooter from "../site-footer";
import PricingPage from "./page";
import SimuladorPage, { SIMULADOR_TITLE } from "./simulador/page";
import { DIRECTOR_LINE, NEVER_PAYWALLED, PRICES_NOTE, PRICING_SUBTITLE, SIMULATOR_PATH, SOON_LABEL, TIERS } from "./tiers";

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

  it("marks unbuilt features (report button, vacancy checks, state dashboard) as in development", () => {
    const soon = TIERS.flatMap((t) => t.features.filter((f) => f.soon).map((f) => f.text));
    expect(soon).toEqual([
      "Botón para reportar",
      "Revisión de las vacantes que publicas, con alerta mensual",
      "Tablero estatal por estado y canal (solo datos agregados)",
    ]);
    expect(html().split(SOON_LABEL).length - 1).toBeGreaterThanOrEqual(3);
  });

  it("persona fixes: director line, no-IT note, IVA prices, simulator moved to its own page", () => {
    const page = html();
    expect(page).toContain(DIRECTOR_LINE);
    expect(DIRECTOR_LINE).toBe("Protege a tus estudiantes de ofertas de trabajo falsas, sin que Sistemas tenga que instalar nada.");
    expect(page).toContain("Un botón en tu portal que abre Lupa. No requiere trabajo de Sistemas.");
    expect(page).toContain("$27,840 con IVA");
    expect(page).toContain("$104,400 con IVA");
    expect(TIERS.find((t) => t.id === "buscador")!.priceWithIva).toBeUndefined();
    expect(page).toContain(`href="${SIMULATOR_PATH}"`);
    expect(page).toContain("¿Cómo se sostiene Lupa? Ver el simulador de ingresos");
    // The coordinator no longer meets the founder vocabulary on /pricing.
    for (const word of ["pipeline", "Costo por revisión", "Margen", "Simulador de ingresos</h2>"]) expect(page).not.toContain(word);
  });

  it("the simulator page has the simulator and a way back", () => {
    const page = renderToStaticMarkup(<SimuladorPage />);
    expect(page).toContain(SIMULADOR_TITLE);
    expect(page).toContain("Simulador de ingresos");
    expect(page).toContain("Datos inventados para simular. No son resultados reales.");
    expect(page).toContain('href="/pricing"');
  });

  it("is linked from the footer", () => {
    expect(renderToStaticMarkup(<SiteFooter />)).toContain('href="/pricing"');
  });
});
