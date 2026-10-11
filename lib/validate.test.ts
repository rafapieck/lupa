import { describe, expect, it } from "vitest";
import { ERROR_TOO_LONG, ERROR_TOO_SHORT, validateOffer } from "./validate";

const VALID = "Se solicita cajero, $9,500 mensuales, entrevista presencial.";

describe("validateOffer", () => {
  it("rejects empty text", () => {
    expect(validateOffer("")).toEqual({ ok: false, error: ERROR_TOO_SHORT });
    expect(validateOffer("   \n  ")).toEqual({ ok: false, error: ERROR_TOO_SHORT });
  });

  it("rejects non-string input", () => {
    expect(validateOffer(undefined)).toEqual({ ok: false, error: ERROR_TOO_SHORT });
    expect(validateOffer(42)).toEqual({ ok: false, error: ERROR_TOO_SHORT });
  });

  it("rejects 10 characters", () => {
    expect(validateOffer("abcdefghij")).toEqual({ ok: false, error: ERROR_TOO_SHORT });
  });

  it("rejects 5000 characters", () => {
    expect(validateOffer("a".repeat(5000))).toEqual({ ok: false, error: ERROR_TOO_LONG });
  });

  it("accepts exactly 20 and 3000 characters", () => {
    expect(validateOffer("a".repeat(20)).ok).toBe(true);
    expect(validateOffer("a".repeat(3000)).ok).toBe(true);
    expect(validateOffer("a".repeat(3001)).ok).toBe(false);
  });

  it("trims whitespace", () => {
    expect(validateOffer(`   ${VALID}   `)).toEqual({ ok: true, text: VALID });
  });

  it("strips HTML tags and script contents", () => {
    const result = validateOffer(
      `<p>Se solicita <b>cajero</b></p><script>alert("x")</script><img src=x onerror=alert(1)> en sucursal centro`,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.text).not.toMatch(/[<>]/);
      expect(result.text).not.toContain("alert");
      expect(result.text).toContain("cajero");
    }
  });

  it("rejects text that is only HTML once stripped", () => {
    expect(validateOffer("<div><span></span><br/><br/><br/><br/></div>")).toEqual({
      ok: false,
      error: ERROR_TOO_SHORT,
    });
  });
});
