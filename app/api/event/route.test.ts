import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ from: () => ({ insert }) }),
}));

import { validateEvent } from "@/lib/save-event";
import { POST } from "./route";

const ID = "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90";

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("validateEvent", () => {
  it("accepts an intent with a known answer", () => {
    expect(validateEvent({ checkId: ID, kind: "intent", answer: "no_pay" })).toEqual({
      ok: true,
      row: { check_id: ID, kind: "intent", answer: "no_pay" },
    });
  });

  it("accepts reply_copied with no answer", () => {
    expect(validateEvent({ checkId: ID, kind: "reply_copied" })).toEqual({
      ok: true,
      row: { check_id: ID, kind: "reply_copied", answer: null },
    });
  });

  it.each([
    ["not an object", "hola"],
    ["missing checkId", { kind: "intent", answer: "no_pay" }],
    ["checkId not a uuid", { checkId: "123", kind: "intent", answer: "no_pay" }],
    ["unknown kind", { checkId: ID, kind: "visit" }],
    ["intent without answer", { checkId: ID, kind: "intent" }],
    ["intent with free text", { checkId: ID, kind: "intent", answer: "Me pidieron $500" }],
    ["reply_copied with an answer", { checkId: ID, kind: "reply_copied", answer: "no_pay" }],
  ])("rejects %s", (_, body) => {
    expect(validateEvent(body).ok).toBe(false);
  });
});

describe("POST /api/event", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    insert.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("saves exactly check_id, kind and answer", async () => {
    insert.mockReturnValue({ abortSignal: () => Promise.resolve({ error: null }) });
    const res = await post({ checkId: ID, kind: "intent", answer: "verify", extra: "ignored" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({ check_id: ID, kind: "intent", answer: "verify" });
  });

  it("returns 400 and saves nothing on invalid input", async () => {
    for (const body of [{ checkId: ID, kind: "intent", answer: "x" }, "{not json", { checkId: "nope", kind: "reply_copied" }]) {
      expect((await post(body)).status).toBe(400);
    }
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects a body over 1 KB", async () => {
    const res = await post({ checkId: ID, kind: "reply_copied", pad: "x".repeat(2000) });
    expect(res.status).toBe(413);
    expect(insert).not.toHaveBeenCalled();
  });

  it("still answers 200 when the database fails", async () => {
    insert.mockReturnValue({ abortSignal: () => Promise.reject(new Error("down")) });
    const res = await post({ checkId: ID, kind: "reply_copied" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: false });
  });
});
