// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { SOURCES, SOURCE_KEY, captureSource, readSource, toSource } from "./source";

afterEach(() => {
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("source capture (PACKET §4.3, §14c)", () => {
  it("matches the §11 constraint list exactly", () => {
    expect([...SOURCES]).toEqual(["fb_group", "wa_status", "wa_share", "contenido", "direct"]);
  });

  it.each(SOURCES.map((s) => [s]))("keeps ?src=%s for the visit", (src) => {
    captureSource(`?src=${src}`);
    expect(window.sessionStorage.getItem(SOURCE_KEY)).toBe(src);
    expect(readSource()).toBe(src);
  });

  it.each(["?src=%3Cscript%3E", "?src=tiktok", "?src=FB_GROUP", "?src=", "", "?other=fb_group"])(
    "ignores %s",
    (search) => {
      captureSource(search);
      expect(window.sessionStorage.getItem(SOURCE_KEY)).toBeNull();
      expect(readSource()).toBeNull();
    },
  );

  it("an invalid ?src= doesn't erase a valid one from earlier in the visit", () => {
    captureSource("?src=fb_group");
    captureSource("?src=<script>");
    expect(readSource()).toBe("fb_group");
  });

  it("re-validates what it reads back", () => {
    window.sessionStorage.setItem(SOURCE_KEY, "<script>");
    expect(readSource()).toBeNull();
  });

  it("works when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => captureSource("?src=fb_group")).not.toThrow();
    expect(readSource()).toBeNull();
  });

  it("toSource only accepts exact list values", () => {
    expect(toSource("wa_share")).toBe("wa_share");
    expect(toSource(" wa_share")).toBeNull();
    expect(toSource(undefined)).toBeNull();
  });
});
