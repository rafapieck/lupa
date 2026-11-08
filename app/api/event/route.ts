import { saveEvent, validateEvent } from "@/lib/save-event";

const MAX_BODY_BYTES = 1_000;

/**
 * POST /api/event  { checkId: uuid, kind: "reply_copied" | "intent", answer?: ... }
 * Anonymous: only the check id, the kind and a fixed answer are saved.
 * A failed save still answers 200 so the UI never breaks.
 */
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: "body too large" }, { status: 413, headers });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400, headers });
  }

  const validation = validateEvent(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400, headers });
  }

  const ok = await saveEvent(validation.row);
  return Response.json({ ok }, { headers });
}
