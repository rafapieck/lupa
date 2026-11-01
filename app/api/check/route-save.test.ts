import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Supabase mocked: fraud_patterns read fails (→ local patterns), checks insert is spied.
const insert = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) =>
      table === "checks"
        ? { insert }
        : { select: () => ({ abortSignal: () => Promise.resolve({ data: null, error: new Error("down") }) }) },
  }),
}));

import { OFFER_1 } from "@/lib/fixtures/offers";
import { POST } from "./route";

function post(text: string) {
  return POST(
    new Request("http://localhost/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }),
  );
}

describe("POST /api/check saves an anonymous check", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    insert.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("inserts one row with the verdict and matched IDs, never the offer text", async () => {
    insert.mockReturnValue({ abortSignal: () => Promise.resolve({ error: null }) });
    const res = await post(OFFER_1);
    const json = await res.json();
    expect(insert).toHaveBeenCalledTimes(1);
    const row = insert.mock.calls[0][0];
    expect(row).toEqual({
      verdict: json.verdict,
      score: json.score,
      pattern_ids: json.matches.map((m: { id: string }) => m.id),
      simulated: true,
    });
    expect(row).not.toHaveProperty("text");
    expect(JSON.stringify(row)).not.toContain("uniforme");
  });

  it("still returns 200 with the verdict when the insert fails", async () => {
    insert.mockReturnValue({ abortSignal: () => Promise.reject(new Error("insert failed")) });
    const res = await post(OFFER_1);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.verdict).toBe("red");
    expect(json.nextStep).toMatch(/No pagues/);
  });

  it("still returns 200 with the verdict when the insert throws", async () => {
    insert.mockImplementation(() => {
      throw new Error("boom");
    });
    const res = await post(OFFER_1);
    expect(res.status).toBe(200);
    expect((await res.json()).verdict).toBe("red");
  });

  it("does not save rejected input", async () => {
    expect((await post("hola")).status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });
});
