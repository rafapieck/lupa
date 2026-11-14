// Tier copy for /pricing (PACKET §2, mockup docs/mockup-week14.jpg).
// Features not built yet (PACKET §8) carry `soon: true` and show "En desarrollo",
// so nothing on the page implies they are live today.

export type TierFeature = { text: string; soon?: boolean };

export type Tier = {
  id: "buscador" | "campus" | "programa";
  name: string;
  price: string;
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

export const TIERS: Tier[] = [
  {
    id: "buscador",
    name: "Buscador",
    price: "$0 · Gratis para siempre",
    tag: "Sin cuenta",
    features: [
      { text: "Revisa cualquier oferta en 30 segundos" },
      { text: "Semáforo con razones" },
      { text: "Botón para reportar" },
    ],
    freeNote: "Revisar ofertas es gratis y no pide cuenta.",
  },
  {
    id: "campus",
    name: "Campus",
    price: "$24,000 MXN/año",
    tag: "Universidades y municipios",
    recommended: true,
    features: [
      { text: "Lupa en tu bolsa de trabajo" },
      { text: "Revisión de las vacantes que publicas, con alerta mensual", soon: true },
      { text: "Reporte mensual de patrones de fraude (solo datos agregados)" },
    ],
    freeNote: "Quien usa tu bolsa revisa ofertas gratis. Nunca recibes datos de una persona.",
  },
  {
    id: "programa",
    name: "Programa",
    price: "$90,000 MXN/año",
    tag: "Servicios estatales y fundaciones",
    features: [
      { text: "Todo lo de Campus" },
      { text: "Tablero estatal por estado y canal (solo datos agregados)", soon: true },
      { text: "Varios portales y programas" },
    ],
    freeNote: "Quien busca trabajo revisa gratis. Todo va agregado por estado y canal, nunca datos de una persona.",
  },
];
