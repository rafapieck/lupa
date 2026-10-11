import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { scoreSignals } from "@/lib/score";
import CheckForm, { FOOTER_NOTE } from "./check-form";
import ResultView, { SIMULATED_NOTE, type CheckResult } from "./result-view";

const red = scoreSignals({ asks_for_payment: true, unrealistic_pay: true, immediate_hiring: true });

function renderResult(simulated: boolean) {
  const result: CheckResult = { ...red, simulated };
  return renderToStaticMarkup(<ResultView result={result} isExample={false} onReset={() => {}} />);
}

describe("result screen — simulated note (persona test, confusion #1)", () => {
  it("is visible whenever simulated is true", () => {
    expect(renderResult(true)).toContain(SIMULATED_NOTE);
  });

  it("is hidden when the AI answered", () => {
    expect(renderResult(false)).not.toContain(SIMULATED_NOTE);
  });

  it("sits below 'Qué hacer ahora', never above the verdict", () => {
    const html = renderResult(true);
    const note = html.indexOf(SIMULATED_NOTE);
    expect(note).toBeGreaterThan(html.indexOf("Riesgo alto"));
    expect(note).toBeGreaterThan(html.indexOf(red.nextStep));
    expect(note).toBeLessThan(html.indexOf("Revisar otra oferta"));
  });

  it("uses the new wording, not the old 'Resultado simulado' banner", () => {
    expect(SIMULATED_NOTE).toBe(
      "ℹ️ La IA no respondió esta vez (análisis de IA simulado). El resultado viene de nuestras señales de alerta oficiales, que funcionan igual.",
    );
    expect(renderResult(true)).not.toContain("Resultado simulado");
  });
});

describe("home screen footer (persona test, confusion #7)", () => {
  it("says a Google AI reads the text and Lupa does not store it", () => {
    expect(FOOTER_NOTE).toBe("Lo analiza una IA de Google. Lupa no guarda lo que pegas.");
    const html = renderToStaticMarkup(<CheckForm />);
    expect(html).toContain(FOOTER_NOTE);
    expect(html).not.toContain("No guardamos lo que pegas.");
  });
});
