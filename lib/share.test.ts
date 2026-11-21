import { describe, expect, it } from "vitest";
import { LOCAL_PATTERNS } from "./patterns";
import { SHARE_MAX_PATTERNS, parseShare, sharePath, shareSources } from "./share";

const ALL_IDS = LOCAL_PATTERNS.map((p) => p.id);

describe("parseShare (PACKET §14b)", () => {
  it("accepts red with two strong signals, strongest first", () => {
    const card = parseShare("red", "personal_documents,upfront_payment");
    expect(card?.verdict).toBe("red");
    expect(card?.patterns.map((p) => p.id)).toEqual(["upfront_payment", "personal_documents"]);
    expect(card?.nextStep).toBe(LOCAL_PATTERNS.find((p) => p.id === "upfront_payment")!.next_step_es);
  });

  it("accepts an encoded comma", () => {
    expect(parseShare("red", "upfront_payment%2Cpersonal_documents")).not.toBeNull();
  });

  it("accepts yellow when the signals add up to yellow", () => {
    expect(parseShare("yellow", "upfront_payment")?.verdict).toBe("yellow");
  });

  it("never shares green", () => {
    expect(parseShare("green", "upfront_payment")).toBeNull();
    expect(parseShare("green", "no_company_name")).toBeNull();
  });

  it("rejects unknown verdicts and ids", () => {
    expect(parseShare("blue", "upfront_payment")).toBeNull();
    expect(parseShare("red", "fake_id")).toBeNull();
    expect(parseShare("red", "upfront_payment,fake_id")).toBeNull();
    expect(parseShare("red", "")).toBeNull();
  });

  it("rejects 7 ids, duplicates and long segments", () => {
    expect(ALL_IDS.length).toBeGreaterThan(SHARE_MAX_PATTERNS);
    expect(parseShare("red", ALL_IDS.slice(0, 7).join(","))).toBeNull();
    expect(parseShare("red", "upfront_payment,upfront_payment")).toBeNull();
    expect(parseShare("red", "a".repeat(201))).toBeNull();
  });

  it("rejects a malformed escape", () => {
    expect(parseShare("red", "upfront_payment%E0%A4%A")).toBeNull();
  });

  it("won't let a link upgrade weak signals", () => {
    expect(parseShare("red", "no_company_name")).toBeNull();
    expect(parseShare("yellow", "upfront_payment,personal_documents")).toBeNull();
  });
});

describe("sharePath / shareSources", () => {
  it("builds a canonical path capped at 6 ids", () => {
    expect(sharePath("red", ALL_IDS)).toBe(`/s/red/${ALL_IDS.slice(0, 6).join(",")}`);
  });

  it("lists each source once", () => {
    const card = parseShare("red", "upfront_payment,personal_documents")!;
    const sources = shareSources(card);
    expect(new Set(sources).size).toBe(sources.length);
  });
});
