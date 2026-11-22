import { describe, expect, it, vi } from "vitest";

const generateContent = vi.fn();
vi.mock("@google/genai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@google/genai")>()),
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

import { extractSignals } from "./extract";
import { OFFER_1, OFFER_2, OFFER_3, OFFER_4, OFFER_5 } from "./fixtures/offers";
import { keywordSignals } from "./keywords";
import { MASK, maskForAI } from "./mask";
import { scoreSignals } from "./score";

describe("maskForAI (PACKET §14a)", () => {
  it.each(["55 1234 5678", "+52 1 55 1234 5678", "5512345678", "(55) 1234-5678", "55.1234.5678", "+52 55 1234 5678"])(
    "phone %s → [teléfono]",
    (phone) => {
      expect(maskForAI(`Llámame al ${phone} hoy`)).toBe(`Llámame al ${MASK.phone} hoy`);
    },
  );

  it("email → [correo]", () => {
    expect(maskForAI("Manda tu CV a reclutamiento.mx@gmail.com ya")).toBe(`Manda tu CV a ${MASK.email} ya`);
  });

  it.each(["https://bit.ly/abc", "wa.me/5215512345678", "http://ejemplo.com/vacante?id=3", "www.empleos-falsos.mx", "bit.ly/abc"])(
    "link %s → [liga]",
    (link) => {
      expect(maskForAI(`Entra a ${link} ahora`)).toBe(`Entra a ${MASK.link} ahora`);
    },
  );

  it.each(["GOPK010203MDFRRL09", "gopk010203mdfrrl09", "GOPKRL01020309M123", "GOPK010203AB1", "012180001234567891"])(
    "ID-shaped %s → [documento]",
    (doc) => {
      expect(maskForAI(`Mi dato: ${doc}.`)).toBe(`Mi dato: ${MASK.document}.`);
    },
  );

  it.each(["$500 para tu uniforme", "contratación HOY", "$35,000 al mes", "$9,500 mensuales", "15 min al día", "Mundial 2026", "correo de Gmail", "Escríbeme por WhatsApp", "manda foto de tu INE"])(
    "leaves %s unchanged (signals must survive)",
    (text) => {
      expect(maskForAI(text)).toBe(text);
    },
  );

  it("masks several kinds in one offer", () => {
    expect(maskForAI("Escribe a rh@hotmail.com o al 55 1234 5678, info en bit.ly/x. CURP GOPK010203MDFRRL09")).toBe(
      `Escribe a ${MASK.email} o al ${MASK.phone}, info en ${MASK.link}. CURP ${MASK.document}`,
    );
  });

  it("is pure: same input, same output", () => {
    const t = "Llama al 5512345678";
    expect(maskForAI(t)).toBe(maskForAI(t));
  });
});

describe("regression: the 5 PACKET test offers keep their verdict", () => {
  const offers = [OFFER_1, OFFER_2, OFFER_3, OFFER_4, OFFER_5];
  const verdict = (t: string) => scoreSignals(keywordSignals(t)).verdict;

  it.each(offers.map((o, i) => [i + 1, o]))("offer %i: masked text reads the same", (_, offer) => {
    expect(verdict(maskForAI(offer))).toBe(verdict(offer));
  });

  it.each(offers.map((o, i) => [i + 1, o]))(
    "offer %i with a phone, email and link added: same verdict through the AI path",
    async (_, offer) => {
      vi.stubEnv("GEMINI_API_KEY", "test-key");
      // Gemini stand-in: reads whatever text it is sent with the keyword rules.
      generateContent.mockImplementation(async ({ contents }: { contents: string }) => ({
        text: JSON.stringify(keywordSignals(contents)),
      }));
      const withPII = `${offer} Informes: 55 1234 5678, rh.vacantes@empresa.com.mx, https://bit.ly/abc`;
      const before = (await extractSignals(offer)).signals;
      const after = await extractSignals(withPII);
      expect(after.simulated).toBe(false);
      expect(scoreSignals(after.signals).verdict).toBe(scoreSignals(before).verdict);

      const sent = generateContent.mock.calls.at(-1)![0].contents as string;
      expect(sent).not.toMatch(/1234|rh\.vacantes|bit\.ly/);
      expect(sent).toContain(MASK.phone);
      vi.unstubAllEnvs();
    },
  );
});
