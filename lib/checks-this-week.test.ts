import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ rpc }) }));

import { getChecksThisWeek } from "./checks-this-week";

const answer = (value: unknown) => ({ abortSignal: () => Promise.resolve(value) });

describe("getChecksThisWeek", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    rpc.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns the number from checks_this_week()", async () => {
    rpc.mockReturnValue(answer({ data: 42, error: null }));
    expect(await getChecksThisWeek()).toBe(42);
    expect(rpc).toHaveBeenCalledWith("checks_this_week");
  });

  it("returns null on an error, a bad value or missing env vars", async () => {
    rpc.mockReturnValue(answer({ data: null, error: { message: "nope" } }));
    expect(await getChecksThisWeek()).toBeNull();
    rpc.mockReturnValue(answer({ data: "abc", error: null }));
    expect(await getChecksThisWeek()).toBeNull();
    rpc.mockImplementation(() => {
      throw new Error("down");
    });
    expect(await getChecksThisWeek()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(await getChecksThisWeek()).toBeNull();
  });
});
