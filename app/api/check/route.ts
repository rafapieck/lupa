import { extractSignals } from "@/lib/extract";
import { loadPatterns } from "@/lib/load-patterns";
import { scoreSignals } from "@/lib/score";
import { validateOffer } from "@/lib/validate";

// Gemini may take up to GEMINI_TIMEOUT_MS (20 s); give Vercel room to finish.
export const maxDuration = 30;

// Raw body cap before parsing (3000 chars of text plus HTML/JSON overhead).
const MAX_BODY_BYTES = 20_000;

/**
 * POST /api/check  { text: string }
 * Nothing the user pastes is stored or logged.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: "El texto es muy largo, máximo 3000 caracteres" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Pega el texto completo de la oferta" }, { status: 400 });
  }

  const validation = validateOffer((body as { text?: unknown } | null)?.text);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const [{ signals, simulated }, { patterns }] = await Promise.all([
    extractSignals(validation.text),
    loadPatterns(),
  ]);
  const result = scoreSignals(signals, patterns);

  return Response.json(
    { ...result, simulated },
    { headers: { "Cache-Control": "no-store" } },
  );
}
