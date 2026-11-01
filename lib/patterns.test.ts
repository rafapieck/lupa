import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LOCAL_PATTERNS, SIGNALS } from "./patterns";

const seed = readFileSync(path.join(__dirname, "../supabase/seed.sql"), "utf8");
const replySql = readFileSync(path.join(__dirname, "../supabase/reply.sql"), "utf8");
const sql = (s: string) => `'${s.replace(/'/g, "''")}'`;

describe("fraud patterns", () => {
  it("has exactly one pattern per signal", () => {
    expect(LOCAL_PATTERNS.map((p) => p.signal).sort()).toEqual([...SIGNALS].sort());
  });

  it("uses the agreed weights", () => {
    const weights = Object.fromEntries(LOCAL_PATTERNS.map((p) => [p.signal, p.weight]));
    expect(weights).toEqual({
      asks_for_payment: 4,
      asks_for_personal_documents: 4,
      impersonated_brand: 3,
      travel_or_housing_bait: 3,
      easy_task_money: 3,
      chat_only_contact: 2,
      unrealistic_pay: 2,
      immediate_hiring: 2,
      generic_email: 1,
      vague_job_description: 1,
      no_company_name: 1,
    });
  });

  it("every pattern cites a Mexican authority", () => {
    for (const p of LOCAL_PATTERNS) {
      expect(p.source).toMatch(/Policía Cibernética CDMX|SSC CDMX|Guardia Nacional/);
    }
  });

  it("seed.sql matches lib/patterns.ts", () => {
    for (const p of LOCAL_PATTERNS) {
      expect(seed).toContain(`(${sql(p.id)}, ${sql(p.signal)}, ${p.weight},`);
      expect(seed).toContain(sql(p.label_es));
      expect(seed).toContain(sql(p.next_step_es));
    }
  });

  it("seed.sql and reply.sql carry the same reply templates as lib/patterns.ts", () => {
    for (const p of LOCAL_PATTERNS) {
      if (p.reply_es === null) continue;
      expect(seed).toContain(sql(p.reply_es));
      expect(replySql).toContain(`(${sql(p.id)},\n     ${sql(p.reply_es)})`);
    }
  });

  it("reply templates are short, polite questions that accuse no one", () => {
    const withReply = LOCAL_PATTERNS.filter((p) => p.reply_es);
    for (const id of ["personal_documents", "upfront_payment", "travel_housing_bait", "chat_only_contact"]) {
      expect(withReply.map((p) => p.id)).toContain(id);
    }
    for (const p of withReply) {
      const r = p.reply_es!;
      expect(r.length).toBeLessThanOrEqual(160);
      expect(r).toContain("?"); // asks the employer to prove itself
      expect(r).not.toMatch(/fraude|estafa|mentir|falso|ladr|polic|denunc|088|segur[ao]|es real/i);
    }
  });

  it("no reply offers to send documents or money", () => {
    for (const p of LOCAL_PATTERNS) {
      if (!p.reply_es) continue;
      expect(p.reply_es).not.toMatch(/te (mando|envío|paso) (mi|el|la|los)|ahí te va|deposit(o|aré)|transfier/i);
    }
  });
});
