import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { scoreSignals } from "@/lib/score";
import CheckForm from "./check-form";
import SiteFooter, { FOOTER_NOTE } from "./site-footer";
import ResultView, { SIMULATED_NOTE, reasonAttr, type CheckResult } from "./result-view";

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

  it("keeps the reason off the screen, only in a data- attribute for diagnosis", () => {
    const html = renderToStaticMarkup(
      <ResultView result={{ ...red, simulated: true, simulatedReason: "auth" }} isExample={false} onReset={() => {}} />,
    );
    expect(html).toContain('data-simulated-reason="auth"');
    // Visible text: strip tags and attributes.
    const visible = html.replace(/<[^>]*>/g, " ");
    expect(visible).not.toMatch(/motivo|auth/);
  });

  it("never echoes an unknown reason, even in the attribute", () => {
    expect(reasonAttr("quota")).toBe("quota");
    expect(reasonAttr("<script>")).toBeNull();
    expect(reasonAttr(undefined)).toBeNull();
    const html = renderToStaticMarkup(
      <ResultView result={{ ...red, simulated: true, simulatedReason: "x" as never }} isExample={false} onReset={() => {}} />,
    );
    expect(html).not.toContain("data-simulated-reason");
  });

  it("says plainly that no AI was used this time, without 'simulado' (persona test Week 15, Jorge)", () => {
    expect(SIMULATED_NOTE).toBe(
      "Esta vez la revisión se hizo sin IA, solo con nuestras señales de alerta oficiales. El resultado siempre lo deciden estas señales.",
    );
    const visible = renderResult(true).replace(/<[^>]*>/g, " ");
    expect(visible).toContain("sin IA");
    expect(visible).not.toMatch(/simulad|Resultado simulado|falso/i);
  });
});

describe("home screen footer (persona test, confusion #7)", () => {
  it("says a Google AI reads the text and Lupa does not store it", () => {
    expect(FOOTER_NOTE).toBe("Lo analiza una IA de Google. Lupa no guarda lo que pegas.");
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain(FOOTER_NOTE);
    expect(html).toContain("Lupa no guarda lo que pegas.");
    // The footer now lives in the shared layout; the form must not repeat it.
    expect(renderToStaticMarkup(<CheckForm />)).not.toContain(FOOTER_NOTE);
    expect(html).not.toContain("No guardamos lo que pegas.");
  });
});
