# Implementation prompt: Lupa · Week 15 · Distribution

You are my coding agent, working in Claude Code on the web on `rafapieck/lupa`. Build exactly what `docs/PACKET.md` (Week 15) describes. Read the whole packet before writing any code.

**Working rhythm:**
- Do one feature at a time.
- After each feature: run it, run the tests, check every acceptance criterion (✅), update `docs/DECISIONS.md`, make **one commit** with the message shown, and push to `main`.
- Every push to `main` deploys on Vercel.
- Don't start the next feature until the current one passes. If a criterion can't pass, stop and tell me why. Don't work around it.

**About me:** I'm on an iPad. I have no local terminal and I verify everything in Safari.
- When you need me to do something, give me numbered steps I can follow in a browser. Each step names the dashboard, the exact menu path and the exact text to type or paste.
- Never ask me to run a command.
- Never ask me to paste a key or secret into this chat.

---

## Hard rules (security floor + packet §12)

1. **No secrets in the repo, ever.** Keys live in Vercel environment variables or the Supabase dashboard. Only the Supabase URL and anon key may reach the browser. Before every push, search the diff for `service_role`, `secret`, `sk-`, `AIza` and long base64 strings. Stop if you find anything.
2. **Lupa never says "safe".** No user-facing text, card, OG image or WhatsApp message may say "segura", "seguro", "confiable" or "legítima". Green reads "No encontramos señales de alerta".
3. **Never share green.** No share button on a 🟢 result, and `/s/green/...` returns 404.
4. **A shared card carries signals and sources only.** No offer text, company name, phone, date or check id, in the HTML, the OG image or the WhatsApp message.
5. **No new personal data.** `checks.source` is a fixed enum. No IP, user agent, cookie, name or offer text is stored anywhere.
6. **Mask before the AI.** From F5 on, Gemini never receives raw phones, emails, links or ID-shaped strings.
7. **RLS stays on** for `checks`, `check_events` and `scenarios`. No new select policies.
8. **Don't change scoring, weights, `fraud_patterns` content, pricing or auth.**
9. **UI text is in Spanish (Mexico).** Plain words, big tap targets, reads well at 390px wide.
10. **I run all SQL myself** in the Supabase SQL editor. Never run a migration against production, and never ask me for database credentials.

## Stack

Keep everything as it is: Next.js 16 App Router, Tailwind 4, Vitest, Vercel, Supabase "semestre", Gemini via `GEMINI_MODEL`. Add only `next/og` (`ImageResponse`, built into Next) for card images. No new npm dependencies unless you ask me first and say why.

---

## Features, acceptance criteria and commits

### F0: Read the repo, then STOP and report

1. Read the whole repo, `docs/PACKET.md` and `docs/DECISIONS.md`.
2. Report:
   - Where `/api/check` calls `extractSignals()` and where the check row is saved (file, function).
   - The exact current names of the `check_events` constraints (kind and kind/answer), so the packet §11 SQL drops the right ones. If they differ, give me a corrected SQL block.
   - Where the copy-audit test lives and which routes it covers.
   - Whether anything in the repo looks like a secret (report it, don't print it).
3. Save the Week 15 mockup image I upload as `docs/mockup-week15.png` and embed it under packet §5: `![Mockup share + WhatsApp preview](mockup-week15.png)`. Change nothing else in the packet.

- ✅ F0 findings are in DECISIONS.md.
- Commit: `docs: F0 week 15 findings and mockup`
- **STOP.** Post the report and wait for my "go" before F1.

### F1: Share page `/s/[verdict]/[patterns]` + OG image

- `verdict` ∈ `red` | `yellow`. `patterns` = comma-separated ids, 1–6, each one in `lib/patterns.ts`, no duplicates, segment ≤ 200 chars. Anything else → `notFound()`.
- The page shows: the verdict badge, each signal's `label_es` with "Fuente: <source>", the strongest pattern's `next_step_es`, and a big button **"Revisa tu oferta"** → `/?src=wa_share`. Small gray line: "Este aviso solo muestra señales de alerta. No incluye la oferta original."
- `opengraph-image` (1200×630) uses the brand layout from packet §3b: navy band with the amber label "LA REVISÉ CON LUPA", the verdict badge, up to 3 signals, "Fuente: …", footer "Revisa la tuya en lupaempleo.xyz".
- Tests: packet §14b rows for `/s/...` (200, 404 on green, 404 on unknown id, 404 on 7 ids, no offer text / phone / date in HTML).
- ✅ Tests pass. `/s/red/upfront_payment,personal_documents` renders at 390px with no horizontal scroll.
- Commit: `feat: shareable verdict card`

### F2: "Mandar aviso por WhatsApp" → deploy #1

- On 🔴/🟡 results only, a full-width button **"Mandar aviso por WhatsApp"** opens `https://wa.me/?text=<encoded>` in a new tab. Message: "Revisé una oferta de trabajo en Lupa y tiene señales de fraude. Mira cuáles antes de pagar: <url de /s/...>".
- Under it, small gray text: "No mandamos el texto de la oferta, solo las señales."
- Tapping it sends a `shared` event through the existing `/api/event` route (extend its validation to accept `kind: "shared"` with no answer).
- Not shown on 🟢 and not shown on the example offer.
- Tests: 🔴 shows the button and the event fires once; 🟢 has no button; the message contains no offer text.
- ✅ Tests pass. Manual step M1 (SQL) is done before this push, so `shared` events save in production.
- Commit: `feat: share verdict to WhatsApp`
- Push (deploy #1). Give me the 4 checks to do in Safari.

### F3: Series cards `/api/card`

- `GET /api/card?series=a&pattern=<id>` → 1080×1080 PNG "SEÑAL DE LA SEMANA": headline = `label_es`, body = `next_step_es`, chip "Fuente: <source>", footer "Pega la oferta en lupaempleo.xyz".
- `GET /api/card?series=c` → 1080×1920 PNG "ANTES DE DEPOSITAR" with the three lines from packet §3c (C1).
- Any other `series` or an unknown `pattern` → 400. Cache headers: public, 1 day.
- Each PNG under 150 KB (test it). No web fonts.
- ✅ Tests pass. Both cards open in Safari and match packet §3b's 5 layout slots.
- Commit: `feat: series cards rendered from patterns`

### F4: Count checks by source

- On any page, if `?src=` is one of `fb_group`, `wa_status`, `wa_share`, `contenido`, `direct`, keep it in `sessionStorage` for the visit. Anything else is ignored and never echoed on the page.
- `/api/check` accepts an optional `source`, validates it against the same list on the server, and saves it in `checks.source`. Invalid → saved as `null`, the check still works.
- Tests: packet §14c.
- ✅ Tests pass (M1 is done, so the column exists).
- Commit: `feat: count checks by source`

### F5: Mask personal data before the AI call

- `lib/mask.ts` exports a pure `maskForAI(text)`: phones → `[teléfono]`, emails → `[correo]`, URLs and `wa.me` links → `[liga]`, CURP/INE-shaped strings → `[documento]`.
- In `/api/check`, the keyword guard still runs on the original text; only the Gemini call gets the masked text. Nothing new is stored.
- Tests: packet §14a, including the regression that all 5 PACKET test offers keep the same verdict.
- ✅ Tests pass. DECISIONS.md records what is masked and why (shadow decision, Week 15 brief).
- Commit: `feat: mask personal data before the AI call`

### F6: `/contenido` + new description → deploy #2

- `/contenido`: title "Contenido de Lupa", the line "Lupa no te dice si una oferta es real. Te dice qué señales de alerta encontró y de dónde viene cada una." Then the three series, each with its finished asset embedded (A1 = `/api/card?series=a&pattern=upfront_payment`, B1 = the OG image of `/s/red/upfront_payment,personal_documents` labeled "Ejemplo con datos de prueba", C1 = `/api/card?series=c`) and its sketch as text (A2, B2, C2 from packet §3c). A button "Revisa una oferta" → `/?src=contenido`.
- Header gets a "Contenido" link. Site `description` becomes the rewritten line from packet §3b.
- Extend the copy-audit test to `/s/...`, `/contenido`, card text and the WhatsApp message.
- ✅ Tests pass. `/contenido` reads well at 390px; images load lazily.
- Commit: `feat: launch content page`
- Push (deploy #2).

### F7: Content docs + final checks

- Create `docs/content/CONCEPTS.md` (6 concepts, status finished/sketch), `docs/content/METHOD.md` (the 6 roles from packet §3d as a table, plus the B1 walk-through: input → masked → signals → verdict → card) and `docs/content/APPROVALS.md` (an empty table: date · asset · aprobado por Rafael). Leave packet §3f "[TO FILL]" cells as they are: I fill them with the real numbers.
- Run the full suite and paste the summary line into DECISIONS.md.
- Walk through packet §12 and §13; mark each ✅ or ❌ with a one-line reason in DECISIONS.md.
- Give me the founder SQL query from packet §11 so I can read the counts after the test.
- ✅ Every item in packet §4 is checked off, or the gap is named (items 9–10 depend on me).
- Commit: `docs: launch playbook evidence`

---

## MANUAL steps for Rafael (iPad, in this order)

**M1. Source column + `shared` event** (Supabase, before the F2 push)
1. supabase.com → project **semestre** → **SQL Editor** → **New query**.
2. Open `docs/PACKET.md` on GitHub → §11 → copy the whole SQL block (use F0's corrected block if the agent gave one).
3. Paste, tap **Run**. Expect "Success. No rows returned".
4. **Table Editor** → `checks`: a `source` column exists. RLS shield still says enabled.

**M2. Mockup** (before F0 finishes)
1. Paste packet §5's prompt into your image generator, save the result, and upload it in this chat so the agent saves it as `docs/mockup-week15.png`.

**M3. Content method** (after F3)
1. For A1, B1 and C1, run roles 1–6 from packet §3d in separate chats. Save each chat's link.
2. Add one line per asset to `docs/content/APPROVALS.md` with the date and "aprobado".

**M4. Distribution test** (after deploy #2)
1. Message one Facebook job-group admin asking permission to post a free anti-fraud tool. Log the date and yes/no, no names.
2. If yes: post A1 with `https://www.lupaempleo.xyz/?src=fb_group`, and B1 as the `/s/...` link. If nobody answers by Wednesday: post both to your WhatsApp status with `?src=wa_status`.
3. After 72 h: run the founder query and copy the numbers Facebook shows (views, reactions, comments, shares) into packet §3f. Zero is a result.

**M5. Persona test** (fresh chat)
1. Run packet §14d with the Jorge persona. Save the full chat. Bring me the worst confusion; I fix it if it reproduces live, and retest.

---

## Session Close (end of every session, no exceptions)

1. Update `docs/DECISIONS.md` → "Session log" with: the date; features done (F-numbers and commit hashes); decisions and why; what failed or was skipped; which M-steps are done or pending; **"Tomorrow's first move:"** one concrete action.
2. Commit: `docs: session close YYYY-MM-DD`
3. Push to `main` and confirm the push succeeded.
4. Tell me in 3 lines what shipped, what's next, and whether I owe you a manual step.
