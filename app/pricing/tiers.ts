// Tier copy for /pricing (PACKET §2, mockup docs/mockup-week14.jpg).
// Features not built yet (PACKET §8) carry `soon: true` and show "En desarrollo",
// so nothing on the page implies they are live today.

export type TierFeature = { text: string; soon?: boolean; note?: string };

export type Tier = {
  id: "buscador" | "campus" | "programa";
  name: string;
  price: string;
  /** IVA-included price, small text (Rafael, 2026-11-15). */
  priceWithIva?: string;
  tag: string;
  recommended?: boolean;
  features: TierFeature[];
  /** Every card states that checking an offer stays free (PACKET §12d). */
  freeNote: string;
};

export const PRICING_TITLE = "Precios";
export const PRICING_SUBTITLE =
  "Revisar una oferta de empleo siempre es gratis. Las instituciones pagan para cubrir sus bolsas de trabajo.";
export const PRICES_NOTE = "Precios antes de IVA.";
export const NEVER_PAYWALLED = "Revisar ofertas nunca está detrás de un pago, en ningún plan.";
export const SOON_LABEL = "En desarrollo";
/** One sentence a coordinator can paste to their director (persona test, Week 14). */
export const DIRECTOR_LINE =
  "Protege a tus estudiantes de ofertas de trabajo falsas, sin que Sistemas tenga que instalar nada.";
/** The revenue simulator lives on its own page, away from the payer-facing tiers. */
export const SIMULATOR_PATH = "/pricing/simulador";
export const SIMULATOR_LINK = "¿Cómo se sostiene Lupa? Ver el simulador de ingresos";

export const TIERS: Tier[] = [
  {
    id: "buscador",
    name: "Buscador",
    price: "$0 · Gratis para siempre",
    tag: "Sin cuenta",
    features: [
      { text: "Revisa cualquier oferta en 30 segundos" },
      { text: "Semáforo con razones" },
      { text: "Botón para reportar", soon: true },
    ],
    freeNote: "Revisar ofertas es gratis y no pide cuenta.",
  },
  {
    id: "campus",
    name: "Campus",
    price: "$24,000 MXN/año",
    priceWithIva: "$27,840 con IVA",
    tag: "Universidades y municipios",
    recommended: true,
    features: [
      { text: "Lupa en tu bolsa de trabajo", note: "Un botón en tu portal que abre Lupa. No requiere trabajo de Sistemas." },
      { text: "Revisión de las vacantes que publicas, con alerta mensual", soon: true },
      { text: "Reporte mensual de patrones de fraude (solo datos agregados)" },
    ],
    freeNote: "Quien usa tu bolsa revisa ofertas gratis. Nunca recibes datos de una persona.",
  },
  {
    id: "programa",
    name: "Programa",
    price: "$90,000 MXN/año",
    priceWithIva: "$104,400 con IVA",
    tag: "Servicios estatales y fundaciones",
    features: [
      { text: "Todo lo de Campus" },
      { text: "Tablero estatal por estado y canal (solo datos agregados)", soon: true },
      { text: "Varios portales y programas" },
    ],
    freeNote: "Quien busca trabajo revisa gratis. Todo va agregado por estado y canal, nunca datos de una persona.",
  },
];
