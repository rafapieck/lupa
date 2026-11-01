import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const rows = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ abortSignal: () => Promise.resolve(rows()) }) }),
  }),
}));

import { LOCAL_PATTERNS } from "./patterns";

// Rows as an older table returns them (no reply_es column).
const base = LOCAL_PATTERNS.map((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== "reply_es")));

describe("loadPatterns: reply_es from Supabase", () => {
  beforeEach(() => {
    vi.resetModules(); // clear the 5-minute cache between tests
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("keeps the database reply and turns blanks into null", async () => {
    rows.mockReturnValue({
      data: base.map((p) => ({ ...p, reply_es: p.id === "personal_documents" ? "Desde la base" : "  " })),
      error: null,
    });
    const { loadPatterns } = await import("./load-patterns");
    const { patterns, from } = await loadPatterns();
    expect(from).toBe("supabase");
    expect(patterns.find((p) => p.id === "personal_documents")?.reply_es).toBe("Desde la base");
    expect(patterns.find((p) => p.id === "upfront_payment")?.reply_es).toBeNull();
  });

  it("falls back to local patterns (with replies) if the column is missing", async () => {
    rows.mockReturnValue({ data: null, error: { message: "column fraud_patterns.reply_es does not exist" } });
    const { loadPatterns } = await import("./load-patterns");
    const { patterns, from } = await loadPatterns();
    expect(from).toBe("local");
    expect(patterns.find((p) => p.id === "personal_documents")?.reply_es).toMatch(/INE la llevo en persona/);
  });
});
