import { describe, expect, it } from "vitest";
import { keywordSignals } from "./keywords";
import { scoreSignals } from "./score";
import { INJECTION, OFFER_1, OFFER_2, OFFER_3, OFFER_4, OFFER_5 } from "./fixtures/offers";

const verdict = (t: string) => scoreSignals(keywordSignals(t)).verdict;

describe("keywordSignals (simulated extraction)", () => {
  it("gives the expected verdict for the 5 PACKET offers", () => {
    expect(verdict(OFFER_1)).toBe("red");
    expect(verdict(OFFER_2)).toBe("red");
    expect(verdict(OFFER_3)).toBe("red");
    expect(verdict(OFFER_4)).toBe("green");
    expect(verdict(OFFER_5)).toBe("yellow");
  });

  it("finds the key flags of offer 1", () => {
    const s = keywordSignals(OFFER_1);
    expect(s.asks_for_payment).toBe(true);
    expect(s.unrealistic_pay).toBe(true);
    expect(s.immediate_hiring).toBe(true);
  });

  it("finds the key flags of offers 2 and 3", () => {
    expect(keywordSignals(OFFER_2)).toMatchObject({
      chat_only_contact: true, easy_task_money: true, impersonated_brand: true,
    });
    expect(keywordSignals(OFFER_3)).toMatchObject({
      asks_for_personal_documents: true, travel_or_housing_bait: true,
    });
  });

  it("does not flag payment or documents in the normal offer 4", () => {
    const s = keywordSignals(OFFER_4);
    expect(s.asks_for_payment).toBe(false);
    expect(s.asks_for_personal_documents).toBe(false);
    expect(s.chat_only_contact).toBe(false);
  });

  it("is not fooled by a prompt injection", () => {
    expect(verdict(OFFER_1 + INJECTION)).toBe("red");
  });
});
