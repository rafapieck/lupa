import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ from: () => ({ insert }) }),
}));

import { OFFER_1 } from "./fixtures/offers";
import { saveCheck, toCheckRow } from "./save-check";
import { scoreSignals } from "./score";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const red = scoreSignals({ asks_for_payment: true, unrealistic_pay: true, immediate_hiring: true });

describe("saveCheck", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    insert.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("inserts only id, verdict, score, pattern_ids, simulated and repeat_visit (no text field)", async () => {
    insert.mockReturnValue({ abortSignal: () => Promise.resolve({ error: null }) });
    const id = await saveCheck(red, true, true);
    expect(id).toMatch(UUID);
    expect(insert).toHaveBeenCalledTimes(1);
    const row = insert.mock.calls[0][0];
    expect(Object.keys(row).sort()).toEqual(["id", "pattern_ids", "repeat_visit", "score", "simulated", "verdict"]);
    expect(row).toEqual({
      id,
      verdict: "red",
      score: red.score,
      pattern_ids: red.matches.map((m) => m.id),
      simulated: true,
      repeat_visit: true,
    });
  });

  it("saves repeat_visit as false for anything that isn't exactly true", () => {
    for (const v of [undefined, "true", 1, "yes", null]) {
      expect(toCheckRow(red, false, v).repeat_visit).toBe(false);
    }
  });

  it("gives every check a new id", () => {
    expect(toCheckRow(red, false).id).not.toBe(toCheckRow(red, false).id);
  });

  it("returns false and logs only 'save failed' when the insert errors", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    insert.mockReturnValue({ abortSignal: () => Promise.resolve({ error: { message: OFFER_1 } }) });
    expect(await saveCheck(red, false)).toBeNull();
    expect(warn).toHaveBeenCalledWith("save failed");
    for (const args of warn.mock.calls) expect(args.join(" ")).not.toContain("uniforme");
  });

  it("never throws, even if the client itself throws", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    insert.mockImplementation(() => {
      throw new Error("network down");
    });
    await expect(saveCheck(red, false)).resolves.toBeNull();
  });

  it("does nothing without Supabase env vars", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(await saveCheck(red, false)).toBeNull();
    expect(insert).not.toHaveBeenCalled();
  });

  it("keeps the score inside the table's 0–100 check", () => {
    expect(toCheckRow({ ...red, score: 250 }, false).score).toBe(100);
    expect(toCheckRow({ ...red, score: -3 }, false).score).toBe(0);
  });
});
