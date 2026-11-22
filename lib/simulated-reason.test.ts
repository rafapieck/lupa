import { describe, expect, it, vi } from "vitest";

vi.mock("@google/genai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@google/genai")>()),
  GoogleGenAI: class {
    models = { generateContent: vi.fn() };
  },
}));

import { classifyGeminiError, extractSignals } from "./extract";
import { OFFER_1 } from "./fixtures/offers";

const err = (message: string, status?: number, name = "ApiError") => Object.assign(new Error(message), { status, name });

describe("classifyGeminiError: why the reading was simulated", () => {
  it.each([
    ["timeout", new DOMException("This operation was aborted", "AbortError")],
    ["timeout", err("signal timed out", undefined, "TimeoutError")],
    ["quota", err('{"error":{"code":429,"status":"RESOURCE_EXHAUSTED"}}', 429)],
    ["quota", err("You exceeded your current quota")],
    ["not_found", err("models/gemini-x is not found for API version v1beta", 404)],
    ["not_found", err("This model is no longer available to new users", 404)],
    ["overloaded", err("The model is overloaded. Please try again later.", 503)],
    ["overloaded", err('{"status":"UNAVAILABLE","message":"high demand"}')],
    ["auth", err("API key not valid. Please pass a valid API key.", 400)],
    ["auth", err("Permission denied", 403)],
    ["auth", err("unauthenticated", 401)],
    ["other", err("Empty Gemini response", undefined, "Error")],
    ["other", new SyntaxError("Unexpected token e in JSON")],
    ["other", undefined],
  ])("%s ← %s", (expected, error) => {
    expect(classifyGeminiError(error)).toBe(expected);
  });

  it("missing key → missing_key", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const r = await extractSignals(OFFER_1);
    expect(r).toMatchObject({ simulated: true, reason: "missing_key" });
    vi.unstubAllEnvs();
  });
});
