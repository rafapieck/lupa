import { readFile } from "node:fs/promises";
import path from "node:path";

// Inter Regular + Bold (SIL Open Font License, assets/fonts/OFL.txt), latin
// subset, kept in the repo. Only the server reads them to draw PNGs; phones
// download no font (PACKET §3b: no web fonts on the cards).

type CardFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

let cached: Promise<CardFont[]> | null = null;

async function load(file: string): Promise<ArrayBuffer> {
  const buf = await readFile(path.join(process.cwd(), "assets/fonts", file));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export function cardFonts(): Promise<CardFont[]> {
  cached ??= Promise.all([load("Inter-Regular.woff"), load("Inter-Bold.woff")]).then(([regular, bold]) => [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: bold, weight: 700, style: "normal" },
  ]);
  return cached;
}
