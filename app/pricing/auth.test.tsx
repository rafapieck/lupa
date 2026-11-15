// @vitest-environment jsdom
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { __setBrowserSupabaseForTests } from "@/lib/supabase/browser";
import { makeFakeSupabase } from "./fake-supabase";
import { SIGN_IN_LABEL, SIGN_OUT_LABEL, UNAVAILABLE, redirectTarget } from "./scenarios";
import Simulator from "./simulator";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const button = (label: string) => [...container.querySelectorAll("button")].find((b) => b.textContent === label);
const input = (name: string) => container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
function type(name: string, value: string) {
  const el = input(name);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function mount(client: unknown) {
  __setBrowserSupabaseForTests(client as SupabaseClient | null);
  act(() => root.render(<Simulator />));
  await flush();
}

beforeEach(() => {
  sessionStorage.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  __setBrowserSupabaseForTests(undefined);
});

describe("F6: Google sign-in on /pricing", () => {
  it("redirects back to this origin's /pricing, never the shared Site URL", () => {
    expect(redirectTarget("https://www.lupaempleo.xyz")).toBe("https://www.lupaempleo.xyz/pricing");
  });

  it("signed out: shows the Google button; tapping it keeps the inputs and asks Google to return to /pricing", async () => {
    const fake = makeFakeSupabase();
    await mount(fake.client);
    type("checksPerMonth", "50,000");
    await act(async () => button(SIGN_IN_LABEL)!.click());
    expect(fake.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/pricing` },
    });
    const pending = JSON.parse(sessionStorage.getItem("lupa_pricing_pending")!);
    expect(pending.raw.checksPerMonth).toBe("50,000");
    expect(pending.wantsSave).toBe(false);
  });

  it("restores the inputs after the round trip, and clears the stored copy", async () => {
    sessionStorage.setItem(
      "lupa_pricing_pending",
      JSON.stringify({ raw: { checksPerMonth: "50,000", reportRate: "3" }, wantsSave: false }),
    );
    await mount(makeFakeSupabase({ session: { user: { id: "u1", email: "a@example.com" } } }).client);
    expect(input("checksPerMonth").value).toBe("50,000");
    expect(input("reportRate").value).toBe("3");
    expect(input("campusPrice").value).toBe("24,000");
    expect(sessionStorage.getItem("lupa_pricing_pending")).toBeNull();
  });

  it("ignores a corrupt stored copy", async () => {
    sessionStorage.setItem("lupa_pricing_pending", "{not json");
    await mount(makeFakeSupabase().client);
    expect(input("campusPrice").value).toBe("24,000");
  });

  it("signed in: shows the email and Cerrar sesión; signing out shows the Google button again", async () => {
    const fake = makeFakeSupabase({ session: { user: { id: "u1", email: "a@example.com" } } });
    await mount(fake.client);
    expect(container.querySelector('[data-testid="user-email"]')!.textContent).toBe("a@example.com");
    await act(async () => button(SIGN_OUT_LABEL)!.click());
    await flush();
    expect(fake.signOut).toHaveBeenCalled();
    expect(button(SIGN_IN_LABEL)).toBeDefined();
    expect(container.textContent).not.toContain("a@example.com");
  });

  it("without Supabase env vars the simulator still works and says saving is unavailable", async () => {
    await mount(null);
    expect(container.textContent).toContain(UNAVAILABLE);
    expect(container.querySelector('[data-testid="revenue"]')!.textContent).toBe("$15,500.00");
  });

  it("no source file reachable from the browser mentions service_role", () => {
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((n) => {
        const f = path.join(dir, n);
        return statSync(f).isDirectory() ? files(f) : /\.tsx?$/.test(n) && !/\.test\./.test(n) ? [f] : [];
      });
    for (const f of [...files(path.resolve(__dirname, "..")), ...files(path.resolve(__dirname, "../../lib"))]) {
      expect(readFileSync(f, "utf8"), f).not.toMatch(/service_role|SERVICE_ROLE/);
    }
  });
});
