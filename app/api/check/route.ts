import { extractSignals } from "@/lib/extract";
import { loadPatterns } from "@/lib/load-patterns";
import { maskForAI } from "@/lib/mask";
import { saveCheck } from "@/lib/save-check";
import { scoreSignals } from "@/lib/score";
import { EXAMPLE_OFFER } from "@/lib/fixtures/offers";
import { validateOffer } from "@/lib/validate";

// Gemini may take up to GEMINI_TIMEOUT_MS (20 s); give Vercel room to finish.
export const maxDuration = 30;

// Raw body cap before parsing (3000 chars of text plus HTML/JSON overhead).
const MAX_BODY_BYTES = 20_000;

/**
 * POST /api/check  { text: string, repeatVisit?: boolean, source?: string }
 * Nothing the user pastes is stored or logged. Only the verdict, score,
 * matched pattern IDs, the simulated flag and a repeat-visit yes/no are saved
 * (lib/save-check.ts).
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

  const input = body as { text?: unknown; repeatVisit?: unknown; source?: unknown } | null;
  const validation = validateOffer(input?.text);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  // F5: Gemini gets the masked text; the keyword guard keeps the original.
  // The masked text is never stored or logged either.
  const [extraction, { patterns }] = await Promise.all([
    extractSignals(validation.text, { aiText: maskForAI(validation.text) }),
    loadPatterns(),
  ]);
  const { signals, simulated } = extraction;
  // Only the fixed category (quota, timeout…) is returned, so Rafael can see
  // why from his phone. Never the key or the error text, and it isn't saved.
  const simulatedReason = extraction.simulated ? extraction.reason : undefined;
  const result = scoreSignals(signals, patterns);

  // Never throws; a failed save still returns the verdict (checkId: null, so
  // the browser sends no events for a check that doesn't exist).
  // Demo checks (the "Probar con un ejemplo" offer) are saved flagged, so they
  // never count as real users. The text match covers anyone who pastes it.
  const example = validation.text === EXAMPLE_OFFER;
  // source is re-validated against the fixed list inside toCheckRow: anything
  // else is saved as null and the check still works.
  const checkId = await saveCheck(result, simulated, input?.repeatVisit === true, example, input?.source);

  return Response.json(
    { ...result, simulated, ...(simulatedReason ? { simulatedReason } : {}), checkId },
    { headers: { "Cache-Control": "no-store" } },
  );
}
