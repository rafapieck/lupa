import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { scoreSignals } from "@/lib/score";
import { REPLY_TITLE } from "./copy-reply";
import ResultView, { type CheckResult } from "./result-view";
import { VERIFY_STEPS, VERIFY_TITLE } from "./verify-steps";

function html(result: CheckResult) {
  return renderToStaticMarkup(<ResultView result={result} isExample={false} onReset={() => {}} />);
}

const red: CheckResult = { ...scoreSignals({ asks_for_payment: true, unrealistic_pay: true, immediate_hiring: true }), simulated: false };
const green: CheckResult = { ...scoreSignals({}), simulated: false };

describe("result screen: how to verify the company (Week 13, real users #1 and #3)", () => {
  it("shows the 3 steps on red, right below 'Qué hacer ahora' and above the reply", () => {
    const page = html(red);
    expect(page).toContain(VERIFY_TITLE);
    for (const step of VERIFY_STEPS) expect(page).toContain(step);
    expect(page.indexOf(VERIFY_TITLE)).toBeGreaterThan(page.indexOf("Qué hacer ahora"));
    expect(page.indexOf(VERIFY_TITLE)).toBeLessThan(page.indexOf(REPLY_TITLE));
  });

  it("shows them on yellow", () => {
    const yellow = { ...scoreSignals({ chat_only_contact: true, vague_job_description: true }), simulated: false };
    expect(yellow.verdict).toBe("yellow");
    expect(html(yellow)).toContain(VERIFY_TITLE);
  });

  it("hides them on green", () => {
    expect(green.verdict).toBe("green");
    expect(html(green)).not.toContain(VERIFY_TITLE);
  });

  it("never tells people to use the contact the recruiter sent", () => {
    expect(VERIFY_STEPS.join(" ")).toMatch(/No uses el número ni el link que te mandaron/);
  });
});
