import { CARD_FOOTER, SERIES_A, SERIES_C } from "@/lib/cards";
import { OFFER_3 } from "@/lib/fixtures/offers";
import { keywordSignals } from "@/lib/keywords";
import { LOCAL_PATTERNS } from "@/lib/patterns";
import { scoreSignals } from "@/lib/score";

// /contenido (PACKET §3c, F6). Finished assets are drawn by Lupa itself; the
// sketches are text only. Every label comes from lib/patterns.ts.

export const CONTENT_TITLE = "Contenido de Lupa";
// The promise we won't make (PACKET §2), worded as the prompt gives it.
export const PROMISE_LINE =
  "Lupa no te dice si una oferta es real. Te dice qué señales de alerta encontró y de dónde viene cada una.";
export const CONTENT_CTA = "Revisa una oferta";
export const CONTENT_CTA_HREF = "/?src=contenido";
export const B1_LABEL = "Ejemplo con datos de prueba";

const pattern = (id: string) => LOCAL_PATTERNS.find((p) => p.id === id)!;

// B2: what Lupa's own rules find in the invented Mundial 2026 test offer.
const mundial = scoreSignals(keywordSignals(OFFER_3));

export type Series = {
  id: "a" | "b" | "c";
  title: string;
  purpose: string;
  format: string;
  finished: { name: string; src: string; width: number; height: number; alt: string; note?: string };
  sketch: { name: string; lines: string[] };
};

export const SERIES: Series[] = [
  {
    id: "a",
    title: "A · Señal de la semana",
    purpose: "Una señal de fraude a la vez, con su fuente oficial.",
    format: "Imagen cuadrada para grupos de Facebook",
    finished: {
      name: `A1: ${pattern("upfront_payment").label_es}`,
      src: "/api/card?series=a&pattern=upfront_payment",
      ...SERIES_A.size,
      alt: `Tarjeta ${SERIES_A.label}: ${pattern("upfront_payment").label_es}. Fuente: ${pattern("upfront_payment").source}.`,
    },
    sketch: {
      name: "A2: Te piden tu INE por WhatsApp",
      lines: [`Señal: ${pattern("personal_documents").label_es}.`, `Fuente: ${pattern("personal_documents").source}.`, "Boceto: solo el titular."],
    },
  },
  {
    id: "b",
    title: "B · La revisé con Lupa",
    purpose: "El método a la vista: una oferta entra, Lupa muestra las señales y de dónde viene cada una.",
    format: "Vista previa de liga para WhatsApp y Facebook",
    finished: {
      name: "B1: el aviso compartido",
      src: "/s/red/upfront_payment,personal_documents/opengraph-image",
      width: 1200,
      height: 630,
      alt: `Aviso compartido: Riesgo alto. ${pattern("upfront_payment").label_es}. ${pattern("personal_documents").label_es}.`,
      note: B1_LABEL,
    },
    sketch: {
      name: "B2: Chamba en el Mundial 2026",
      lines: [
        "Un tipo de oferta de temporada que señaló la SSC CDMX en mayo de 2026.",
        `Con la oferta de prueba del Mundial, Lupa encuentra: ${mundial.matches.map((m) => m.label).join("; ")}.`,
      ],
    },
  },
  {
    id: "c",
    title: "C · Antes de depositar",
    purpose: "Una pausa que puedes usar aunque no tengas Lupa a la mano.",
    format: "Imagen vertical para estados de WhatsApp",
    finished: {
      name: `C1: ${SERIES_C.headline}`,
      src: "/api/card?series=c",
      ...SERIES_C.size,
      alt: `Tarjeta ${SERIES_C.label}: ${SERIES_C.lines.map((l, i) => `${i + 1}. ${l}`).join(" ")} ${CARD_FOOTER}.`,
    },
    sketch: {
      name: "C2: Qué contestarle al reclutador",
      lines: ["Usa las respuestas que Lupa ya da en cada resultado. Por ejemplo:", `“${pattern("upfront_payment").reply_es}”`],
    },
  },
];
