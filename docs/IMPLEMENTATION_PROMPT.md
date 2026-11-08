# Implementation prompt — Lupa · Week 13

*Generated from `docs/PACKET.md` (Week 13) for the coding agent. Read `AGENTS.md`, `docs/CHARTER.md` and `DECISIONS.md` first. Read the relevant guide in `node_modules/next/dist/docs/` before touching routes.*

## Context

Lupa is a Next.js app (App Router, Tailwind, Vitest) that checks pasted job offers. `POST /api/check` validates the text, has Gemini extract yes/no signals, scores them with fixed rules (`lib/score.ts`) and saves one anonymous row in Supabase `checks` (`lib/save-check.ts`). Nothing the user pastes is ever stored.

This week we add an **anonymous event log** so the founder can see what real people do after a verdict. Charter rules that cannot break:
1. The AI never decides; the verdict logic is untouched.
2. No offer text, IP, user agent, cookie, fingerprint or personal data is stored anywhere.
3. No user-facing text says "segura" or "es real" (`app/copy-audit.test.tsx`).
4. Saving never blocks or changes what the user sees.

## Features (build in this order, one commit each)

### F1 — SQL: check ids, `returning`, and `check_events` (`supabase/events.sql`, idempotent)
- `checks`: add `returning boolean not null default false`. Grant anon insert on `id` and `returning` in addition to the current columns (`created_at` stays default-only).
- New table `check_events`: `id uuid pk default gen_random_uuid()`, `created_at timestamptz not null default now()`, `check_id uuid not null references checks(id) on delete cascade`, `kind text not null check (kind in ('reply_copied','intent'))`, `answer text null check (answer is null or answer in ('no_pay','verify','continue','already_paid'))`, plus a check constraint: `kind = 'intent'` requires an answer, `kind = 'reply_copied'` requires `answer is null`.
- RLS ON, one policy: anon can `insert`. `revoke all` from anon/authenticated, then `grant insert (check_id, kind, answer)`. No select, update or delete.
- The FK must not let anon read `checks`: the insert-only grant is enough because FK checks run as the table owner.

**Acceptance:** running the file twice gives no error; anon cannot select either table; an event with an unknown check id fails; an `intent` without an answer fails.

### F2 — Server: return a check id and save `returning`
- `lib/save-check.ts`: generate the id with `crypto.randomUUID()` on the server, insert it with the row, and return `{ saved: boolean, checkId: string }`. The id is returned even if the save fails, but then the client must not send events for it (send `checkId: null`).
- `toCheckRow(result, simulated, returning)`: adds `returning` (boolean only; anything else → false).
- `/api/check`: read an optional boolean `returning` from the body (default false), pass it through, and respond with `{ ...result, simulated, checkId }`.

**Acceptance (tests):** response includes a uuid `checkId` when saved and `null` when not; the inserted row has exactly the keys `id, verdict, score, pattern_ids, simulated, returning`; a non-boolean `returning` is saved as false.

### F3 — Server: `POST /api/event` + `lib/save-event.ts`
- Body: `{ checkId: string, kind: 'reply_copied' | 'intent', answer?: 'no_pay' | 'verify' | 'continue' | 'already_paid' }`. Raw body cap 1 KB.
- Validate: `checkId` is a uuid; `kind` in the list; `intent` requires a valid `answer`; `reply_copied` must have no answer. Invalid → 400 `{ error }`, nothing saved.
- Valid → insert one row (3 s timeout), respond `{ ok: true }` or `{ ok: false }` with 200 (never surface DB errors). `Cache-Control: no-store`.

**Acceptance (tests):** each invalid case returns 400 and calls no insert; a valid intent inserts exactly `{ check_id, kind, answer }`; a DB failure still returns 200.

### F4 — Client: `returning` flag
- In `app/check-form.tsx`, before posting, read `localStorage['lupa_checked_before']` (inside try/catch). Send `returning: true` if it is `'1'`. After a successful verdict, set it to `'1'`. Nothing else is stored or sent.

**Acceptance:** first check in a clean browser sends `returning: false`, the second sends `true`; a throwing `localStorage` sends `false` and still works.

### F5 — Client: answer card + reply-copied event
- New `app/intent-card.tsx`, rendered at the bottom of `ResultView` on **every** verdict when `checkId` is not null. Title: "¿Qué vas a hacer con esta oferta?". Four stacked, full-width buttons **with the same neutral style** (no green "go" button: the design must not reward continuing). Labels: "No voy a pagar ni mandar documentos", "Primero voy a verificar la empresa", "Voy a seguir con el proceso", "Ya había pagado o mandado documentos".
- On tap: fire-and-forget `POST /api/event`; immediately replace the buttons with a thank-you line. If the answer is `continue` or `already_paid`, also show the existing next step plus "Si ya pagaste o mandaste documentos, repórtalo al 088 o a la Policía Cibernética." Answering is optional; ignoring the card saves nothing.
- In `app/copy-reply.tsx`, after a successful copy, send `{ checkId, kind: 'reply_copied' }` once per result.

**Acceptance (tests):** card hidden when `checkId` is null; tapping sends the right body and shows the thank-you line even when fetch rejects; `already_paid` shows the 088 line; copy sends one `reply_copied` event; copy audit passes.

### F6 — Docs and session close
- `README.md`: new env-free setup step for `supabase/events.sql` and the founder's SQL queries (pause rate, copies per red/yellow check, returning share).
- `DECISIONS.md`: entry for the event log (why fixed answers, why neutral buttons, why `returning` instead of an ID) and tomorrow's first move.
- `docs/USER_SESSIONS.md`: template for the 5 real-user sessions.

## Commit plan

1. `docs: Week 13 PACKET` ✅
2. `docs: Week 13 mockup` ✅
3. `feat(db): check ids, returning flag and check_events (insert-only)` (F1)
4. `feat(api): return check id, save returning, add /api/event` (F2 + F3)
5. `feat(ui): answer card, reply-copied event, returning flag` (F4 + F5)
6. `docs: README, DECISIONS, USER_SESSIONS template` (F6) → **deploy 1**
7. `docs: PACKET §13 — #1 real-user pain` (after sessions)
8. `fix: <#1 pain>` → **deploy 2**
9. `fix: <bug from mechanical pass>` → redeploy

## Deploy order

Run `supabase/events.sql` **before** merging. If code ships first, the insert with `id`/`returning` fails, `saveCheck` returns `checkId: null`, the card stays hidden and the verdict still shows: no user ever sees a broken screen.
