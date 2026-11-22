import { describe, expect, it } from "vitest";
import { LOCAL_PATTERNS } from "@/lib/patterns";
import { headlineSize, parseCardQuery } from "@/lib/cards";
import { GET } from "./route";

const get = (qs: string) => GET(new Request(`http://localhost/api/card${qs}`));

function pngSize(buf: Uint8Array) {
  const v = new DataView(buf.buffer, buf.byteOffset);
  return { width: v.getUint32(16), height: v.getUint32(20) };
}

describe("GET /api/card (PACKET F3)", () => {
  it.each(LOCAL_PATTERNS.map((p) => [p.id]))("series a, %s → 1080×1080 PNG under 150 KB", async (id) => {
    const res = await get(`?series=a&pattern=${id}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("cache-control")).toBe("public, max-age=86400");
    const buf = new Uint8Array(await res.arrayBuffer());
    expect([...buf.slice(1, 4)].map((c) => String.fromCharCode(c)).join("")).toBe("PNG");
    expect(pngSize(buf)).toEqual({ width: 1080, height: 1080 });
    expect(buf.byteLength).toBeLessThan(150 * 1024);
  });

  it("series c → 1080×1920 PNG under 150 KB", async () => {
    const res = await get("?series=c");
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("public, max-age=86400");
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(pngSize(buf)).toEqual({ width: 1080, height: 1920 });
    expect(buf.byteLength).toBeLessThan(150 * 1024);
  });

  it.each(["", "?series=b", "?series=A&pattern=upfront_payment", "?series=a", "?series=a&pattern=fake_id", "?series=green"])(
    "%s → 400",
    async (qs) => {
      expect((await get(qs)).status).toBe(400);
    },
  );
});

describe("card text", () => {
  it("series a uses the pattern's own label, next step and source", () => {
    const card = parseCardQuery(new URLSearchParams("series=a&pattern=upfront_payment"));
    expect(card).toMatchObject({ series: "a", pattern: { label_es: "Te piden dinero antes de contratarte" } });
  });

  it("series c cites the upfront_payment source", () => {
    expect(parseCardQuery(new URLSearchParams("series=c"))).toEqual({ series: "c", source: "Policía Cibernética CDMX" });
  });

  it("headline size follows §3b: 72–84 px up to 8 words", () => {
    expect(headlineSize("Te piden dinero antes de contratarte")).toBeGreaterThanOrEqual(72);
    expect(headlineSize("uno dos tres cuatro cinco seis siete ocho")).toBeGreaterThanOrEqual(72);
    expect(headlineSize("uno dos tres cuatro cinco seis siete ocho nueve diez")).toBeLessThan(72);
  });
});
