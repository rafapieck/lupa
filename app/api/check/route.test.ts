import { beforeEach, describe, expect, it, vi } from "vitest";
import { INJECTION, OFFER_1, OFFER_4, OFFER_5 } from "@/lib/fixtures/offers";
import { POST } from "./route";

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/check (no keys → simulated, local patterns)", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  });

  it("returns red for offer 1 with prompt injection", async () => {
    const res = await post({ text: OFFER_1 + INJECTION });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.verdict).toBe("red");
    expect(json.verdictLabel).toBe("Riesgo alto");
    expect(json.simulated).toBe(true);
    expect(json.matches.length).toBeGreaterThan(0);
    expect(json.matches[0].source).toBeTruthy();
    expect(json.nextStep).toMatch(/No pagues/);
  });

  it("returns green for offer 4 and yellow for offer 5", async () => {
    expect((await (await post({ text: OFFER_4 })).json()).verdict).toBe("green");
    expect((await (await post({ text: OFFER_5 })).json()).verdict).toBe("yellow");
  });

  it("rejects short, long, missing and malformed input", async () => {
    const short = await post({ text: "hola" });
    expect(short.status).toBe(400);
    expect((await short.json()).error).toBe("Pega el texto completo de la oferta");

    const long = await post({ text: "a".repeat(5000) });
    expect(long.status).toBe(400);
    expect((await long.json()).error).toBe("El texto es muy largo, máximo 3000 caracteres");

    expect((await post({})).status).toBe(400);
    expect((await post("not json")).status).toBe(400);
    expect((await post({ text: "a".repeat(50_000) })).status).toBe(413);
  });

  it("does not log the offer text", async () => {
    const spies = (["log", "info", "warn", "error"] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    );
    await post({ text: OFFER_1 });
    for (const spy of spies) {
      for (const args of spy.mock.calls) expect(args.join(" ")).not.toContain("uniforme");
    }
  });
});
