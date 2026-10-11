import { describe, expect, it } from "vitest";
import { DEFAULT_SAFE_TIP, scoreSignals, verdictFor, type Signals } from "./score";
import { LOCAL_PATTERNS } from "./patterns";

// Signal sets for the 5 invented test offers in docs/PACKET.md section 10.
const OFFERS: Record<string, Partial<Signals>> = {
  // "Vacante en tienda, $35,000 al mes, sin experiencia, contratación HOY. Solo deposita $450 para tu uniforme."
  offer1: { asks_for_payment: true, unrealistic_pay: true, immediate_hiring: true, no_company_name: true },
  // "Hola, soy reclutadora de YouTube. Gana $1,500 por dar likes a videos, 15 min al día. Escríbeme por WhatsApp."
  offer2: { chat_only_contact: true, easy_task_money: true, impersonated_brand: true },
  // "Trabajo para el Mundial 2026, hospedaje y transporte incluidos, viaja mañana, manda foto de tu INE."
  offer3: { asks_for_personal_documents: true, travel_or_housing_bait: true },
  // "Se solicita cajero, $9,500 mensuales, entrevista presencial en sucursal [dirección], traer solicitud elaborada."
  offer4: {},
  // "Auxiliar administrativo, buen sueldo, envía tu CV a este correo de Gmail."
  offer5: { generic_email: true, vague_job_description: true, no_company_name: true },
};

describe("verdictFor", () => {
  it("uses the 0-2 / 3-5 / 6+ bands", () => {
    expect([0, 2, 3, 5, 6, 20].map(verdictFor)).toEqual([
      "green", "green", "yellow", "yellow", "red", "red",
    ]);
  });
});

describe("scoreSignals — PACKET test offers", () => {
  it("offer 1 → red, main step: don't pay", () => {
    const r = scoreSignals(OFFERS.offer1);
    expect(r.verdict).toBe("red");
    expect(r.verdictLabel).toBe("Riesgo alto");
    expect(r.matches[0].signal).toBe("asks_for_payment");
    expect(r.nextStep).toMatch(/No pagues nada/);
  });

  it("offer 2 → red", () => {
    const r = scoreSignals(OFFERS.offer2);
    expect(r.verdict).toBe("red");
    expect(r.matches.map((m) => m.signal)).toEqual(
      expect.arrayContaining(["chat_only_contact", "easy_task_money", "impersonated_brand"]),
    );
  });

  it("offer 3 → red, main step about documents", () => {
    const r = scoreSignals(OFFERS.offer3);
    expect(r.verdict).toBe("red");
    expect(r.matches[0].signal).toBe("asks_for_personal_documents");
  });

  it("offer 4 → green with default safe tip", () => {
    const r = scoreSignals(OFFERS.offer4);
    expect(r.verdict).toBe("green");
    expect(r.verdictLabel).toBe("Riesgo bajo");
    expect(r.matches).toEqual([]);
    expect(r.nextStep).toBe(DEFAULT_SAFE_TIP);
  });

  it("offer 5 → yellow", () => {
    const r = scoreSignals(OFFERS.offer5);
    expect(r.verdict).toBe("yellow");
    expect(r.verdictLabel).toBe("Precaución");
    expect(r.score).toBe(3);
  });
});

describe("scoreSignals — details", () => {
  it("every matched flag carries label, next step and source", () => {
    for (const m of scoreSignals(OFFERS.offer1).matches) {
      expect(m.label).toBeTruthy();
      expect(m.nextStep).toBeTruthy();
      expect(m.source).toBeTruthy();
    }
  });

  it("sorts matches by weight, highest first", () => {
    const weights = scoreSignals(OFFERS.offer1).matches.map((m) => m.weight);
    expect(weights).toEqual([...weights].sort((a, b) => b - a));
  });

  it("green with a minor flag still gets the default tip", () => {
    const r = scoreSignals({ no_company_name: true });
    expect(r.verdict).toBe("green");
    expect(r.matches).toHaveLength(1);
    expect(r.nextStep).toBe(DEFAULT_SAFE_TIP);
  });

  it("ignores non-true values", () => {
    const r = scoreSignals({ asks_for_payment: "yes" as unknown as boolean });
    expect(r.score).toBe(0);
  });

  it("uses the patterns it is given (e.g. from Supabase)", () => {
    const patterns = LOCAL_PATTERNS.map((p) => ({ ...p, weight: 10 }));
    expect(scoreSignals({ no_company_name: true }, patterns).verdict).toBe("red");
  });
});
