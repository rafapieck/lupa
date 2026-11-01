import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_SAFE_TIP, VERDICT_LABELS, scoreSignals } from "@/lib/score";
import { OFFER_4 } from "@/lib/fixtures/offers";
import { keywordSignals } from "@/lib/keywords";
import ResultView, { GREEN_DETAILS_TITLE } from "./result-view";

// Charter principle 3: Lupa never says an offer is safe or real.
const FORBIDDEN = /segur[ao]s?|es real/i;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

describe("copy audit: green never claims an offer is safe", () => {
  // User-facing strings live in app/ plus the labels and tips in these lib files.
  const files = [
    ...sourceFiles(path.resolve(__dirname)),
    ...["score.ts", "patterns.ts", "validate.ts"].map((f) => path.resolve(__dirname, "../lib", f)),
  ];

  it.each(files.map((f) => [path.relative(path.resolve(__dirname, ".."), f), f]))(
    '%s has no "segura" or "es real"',
    (_rel, file) => {
      expect(readFileSync(file, "utf8")).not.toMatch(FORBIDDEN);
    },
  );

  it("labels green as 'No encontramos señales conocidas'", () => {
    expect(VERDICT_LABELS.green).toBe("No encontramos señales conocidas");
  });

  it("always shows the safe tip with a green verdict", () => {
    const result = scoreSignals(keywordSignals(OFFER_4));
    expect(result.verdict).toBe("green");
    const html = renderToStaticMarkup(
      <ResultView result={{ ...result, simulated: false }} isExample={false} onReset={() => {}} />,
    );
    expect(html).toContain("No encontramos señales conocidas");
    expect(html).toContain(DEFAULT_SAFE_TIP);
    expect(html).not.toMatch(FORBIDDEN);
  });

  it("does not call minor green matches 'señales de alerta encontradas'", () => {
    const result = scoreSignals({ no_company_name: true });
    expect(result.verdict).toBe("green");
    expect(result.matches.length).toBe(1);
    const html = renderToStaticMarkup(
      <ResultView result={{ ...result, simulated: false }} isExample={false} onReset={() => {}} />,
    );
    expect(html).toContain(GREEN_DETAILS_TITLE);
    expect(html).not.toContain("Señales de alerta encontradas");
    expect(html).toContain("Fuente:");
  });
});
