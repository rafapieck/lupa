# Implementation prompt: Lupa · Week 14 · Pricing

You are my coding agent, working in Claude Code on the web on `rafapieck/lupa`. Build exactly what `docs/PACKET.md` describes. Read the whole packet before writing any code.

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

## Hard rules (security floor + packet §10)

1. **No secrets in the repo, ever.** Keys live in Vercel environment variables or the Supabase dashboard.
   - Only the Supabase URL and the anon (public) key may reach the browser.
   - The service-role key is never used in client code and never committed.
   - `.gitignore` must include `.env*` (except an optional `.env.example` with names and no values).
   - Before every push, search the diff for `service_role`, `secret`, `sk-`, `AIza` and long base64 strings. Stop if you find anything.
2. **Lupa never says "safe".** No user-facing text may claim an offer is safe: not "segura", "seguro", "confiable" or "legítima". The green result reads "No encontramos señales de alerta".
3. **Checking an offer is never behind a paywall or a sign-in**, in any tier. Google sign-in is only for saving scenarios.
4. **Institutions only get aggregated data.** No UI or copy may suggest that institutions see individual seekers.
5. **A simulated semáforo says so:** "Resultado simulado".
6. **Invented numbers are labeled on screen.** Use "inventado" or "supuesto" next to each default, plus the banner "Datos inventados para simular. No son resultados reales."
7. **RLS stays on** for `scenarios`. A user can only select, insert, update or delete rows where `user_id = auth.uid()`.
8. **Don't touch the existing check logic or `fraud_patterns`**, except for the "Resultado simulado" label in F5.
9. **UI text is in Spanish (Mexico).** Use plain words, big tap targets and a layout that reads well at 390px wide.
10. **I run all SQL myself** in the Supabase SQL editor. Never run a migration against the production project, and never ask me for database credentials.

## Stack

Keep Lupa's current stack: Vercel (deploys from `main`), Supabase project **"semestre"** and GitHub `rafapieck/lupa`. Then add:
- **Supabase Auth with the Google provider.** Use the Supabase client library the repo already uses. If it has none, use `@supabase/supabase-js`, plus `@supabase/ssr` if the framework renders on the server.
- **A `scenarios` table with RLS** (SQL in packet §9, which I run myself, see Manual steps).
- **A test runner.** Use the one the repo has. If it has none, add Vitest.

F0 confirms the framework. Adapt file paths and env-var prefixes to it (for example `NEXT_PUBLIC_` on Next.js, `VITE_` on Vite) and record the choice in `docs/DECISIONS.md`.

---

## Features, acceptance criteria and commits

### F0: Read the repo, prepare docs, then STOP and report

1. Read the whole repo and `docs/PACKET.md`.
2. Report:
   - **Framework and version**, router type, package manager, styling, and whether a test runner exists.
   - **Where the semáforo output comes from.** Name the file and function. Is it a live AI call (which provider, called from the server or the browser?) or simulated? Quote the lines that decide it.
   - **Supabase setup that already exists:** the client file, which env-var *names* are used (never their values), and how `fraud_patterns` is read.
   - **Routes that already exist**, and whether `/pricing` or `/about` already exist.
   - **Anything in the repo that looks like a secret.** Report it to me but don't print it.
3. Rename `docs/MOCKUP.JPG` to `docs/mockup-week14.jpg`. Use `git mv`, and match the exact current filename and case.
4. In `docs/PACKET.md` §4, embed the image right under the heading: `![Mockup /pricing + simulador](mockup-week14.jpg)`. Change nothing else in the packet.
5. Create `docs/DECISIONS.md` if it's missing, with sections "Decisions" and "Session log". Record the F0 findings there.

- ✅ `docs/mockup-week14.jpg` exists, `docs/MOCKUP.JPG` doesn't, and the image renders in PACKET.md on GitHub.
- ✅ The F0 findings are in DECISIONS.md.
- Commit: `docs: F0 repo findings, rename mockup and embed in packet`
- **STOP.** Post the report and wait for my "go" before F1.

### F1: Simulator logic module + unit tests (no UI)

Create one module (e.g. `lib/pricing/simulate.ts`, adapted to the repo layout) that exports two **pure** functions with no I/O, no React and no Supabase.

**`validateInputs(raw)`**
- Takes raw form values (strings or numbers).
- Trims them and strips thousands separators (`,`).
- Returns `{ ok: true, values }` or `{ ok: false, errors: { field: "mensaje en español" } }`.

| Field | Type | Range | Max decimals |
|---|---|---|---|
| `campusPipeline`, `programaPipeline` | integer | 0–1,000 | 0 |
| `conversionRate` (percent) | number | 0–100 | 2 |
| `campusPrice`, `programaPrice` (MXN/yr) | integer | 0–1,000,000 | 0 |
| `checksPerMonth` | integer | 0–10,000,000 | 0 |
| `reportRate` (percent) | number | 0–100 | 2 |
| `costPerCheck` (MXN) | number | 0–100 | 4 |
| `reviewCostPerReport` (MXN) | number | 0–1,000 | 2 |

- Accept only plain decimals that match `^\d+(\.\d+)?$` after stripping commas, with the decimal limit above.
- Reject empty values, `NaN`, negatives, scientific notation (`1e9`), letters and out-of-range values.
- Error text: "Debe estar entre {min} y {max}", "Debe ser un número entero", or "Escribe un número".

Also export **`validateScenarioName(name)`**: 1–60 characters after trimming. Reject empty or whitespace-only names.

**`simulate(values)`** implements packet §3 exactly:
- `paying = Math.floor((pipeline * Math.round(conversionRate * 100)) / 10000)`. This is integer math, so `floor` never hits float error.
- `annualRevenue = payingCampus × campusPrice + payingPrograma × programaPrice`
- `monthlyRevenue = annualRevenue / 12`
- `reportsPerMonth = checksPerMonth × reportRate / 100`
- `monthlyCost = checksPerMonth × costPerCheck + reportsPerMonth × reviewCostPerReport`
- `annualCost = monthlyCost × 12`
- Margins are revenue minus cost.
- `marginPct = monthlyMargin / monthlyRevenue`, or `null` when revenue is 0.
- Return full precision. Rounding happens only in the UI.

Export `DEFAULTS` with the packet §3 values and labels: `inventado`, `supuesto`, or `precio de lista`.

Export `FORMULA_VERSION = 1`.

**Unit tests (packet §12a–b), all must pass:**

| Test | Inputs | Expected |
|---|---|---|
| Case 1, defaults | 20 / 5 / 20% / 24,000 / 90,000 / 10,000 checks / 2% / 0.05 / 0 | paying 4 and 1 · annual revenue 186,000 · monthly 15,500 · reports 200 · monthly cost 500 · annual cost 6,000 · monthly margin 15,000 · annual 180,000 · marginPct ≈ 0.967742 |
| Case 2, no institutions | 0 / 0 / 20% / list prices / 50,000 / 3% / 0.05 / 0 | paying 0 and 0 · revenue 0 · reports 1,500 · monthly cost 2,500 · annual 30,000 · margins −2,500 and −30,000 · marginPct `null` |
| Case 3, rounding + review cost | 7 / 3 / 15% / Campus 30,000 / 90,000 / 200,000 / 1.5% / 0.05 / 1.00 | paying 1 and 0 · annual revenue 30,000 · monthly 2,500 · reports 3,000 · monthly cost 13,000 · annual 156,000 · margins −10,500 and −126,000 · marginPct −4.2 |
| Validation | conversion `101` · pipeline `2.5` · checks `-1` · cost `abc` · cost `""` · price `1e9` · name of 61 chars · name `"   "` | each rejected with an error on that field |
| Validation passes | defaults as strings, `"24,000"` | `ok: true`, and `"24,000"` parses to 24000 |

Use `toBeCloseTo` for money (2 decimals) and exact equality for counts.

- ✅ All tests pass, and the test output is pasted in DECISIONS.md (just the summary line).
- Commit: `feat: simulate() and validateInputs() with unit tests`

### F2: `/pricing` tiers page → deploy #1

The page has:
- Title "Precios" and the subtitle "Revisar una oferta de empleo siempre es gratis. Las instituciones pagan para cubrir sus bolsas de trabajo."
- Three cards:
  - **Buscador · $0 · Gratis para siempre**: "Revisa cualquier oferta en 30 segundos", "Semáforo con razones", "Botón para reportar", tag "Sin cuenta".
  - **Campus · $24,000 MXN/año** (recommended outline): "Lupa en tu bolsa de trabajo", "Revisión de las vacantes que publicas, con alerta mensual", "Reporte mensual de patrones de fraude (solo datos agregados)", tag "Universidades y municipios".
  - **Programa · $90,000 MXN/año**: "Todo lo de Campus", "Tablero estatal por estado y canal (solo datos agregados)", "Varios portales y programas", tag "Servicios estatales y fundaciones".
- Under the cards: "Precios antes de IVA." and "Revisar ofertas nunca está detrás de un pago, en ningún plan."
- Nothing on the page says or implies that vacancy checks, alerts or dashboards are live today. They aren't built yet (packet §8).
- A link to `/pricing` from the main navigation or footer.

Match the mockup at `docs/mockup-week14.jpg`.

- ✅ `/pricing` builds and renders at 390px with no horizontal scroll.
- ✅ The offer check still works with no sign-in.
- Commit: `feat: /pricing page with three tiers`
- **Deploy #1:** push, then give me a 3-item checklist to verify the live URL on my iPad.

### F3: Revenue simulator UI on `/pricing`

- **Section "Simulador de ingresos"** with the yellow banner "Datos inventados para simular. No son resultados reales."
- **One input row per field**, using F1's field names. Each row has:
  - a Spanish label
  - `inputmode="decimal"` or `"numeric"`
  - a small tag: "inventado", "supuesto" or "precio de lista"
  - the review-cost field marked "opcional"
- **Results update as the user types**, using `validateInputs` then `simulate`. An invalid field shows its inline error, and the results keep the last valid values.
- **A "Mensual | Anual" toggle** for revenue, cost and margin, plus "Reportes al mes".
- **Number format:** money as `$15,500.00`, margin % with one decimal, and "—" when `marginPct` is `null`.
- **Negative margins** show the minus sign and a distinct color.
- **Notes under the results:** "Instituciones parciales se redondean hacia abajo." and "Sin IVA."

- ✅ With the defaults, the screen shows the Case 1 numbers. Typing the Case 2 and Case 3 inputs by hand shows their results.
- ✅ `101` in conversion shows "Debe estar entre 0 y 100".
- Commit: `feat: revenue simulator on /pricing`

### F4: `/about` 10:1 memo + Ibero record

**`/about`:**
- Translate packet **Appendix A** into Spanish (Mexico) and publish it at `/about`.
- Keep the figures and their sources by name (FTC, Consejo Ciudadano).
- Don't invent URLs. If I haven't given you a source link, write the source name and add "Fuente por verificar" in small text. Add a line to DECISIONS.md asking me for the links.
- The exchange rate is labeled "tipo de cambio supuesto".
- No "segura/seguro" claims.

**Ibero record:**
- Create `docs/conversations/ibero.md` from packet **Appendix B** (the log, what I learned, and the proposal outline), word for word.
- This file is docs only and never rendered on the site.

- ✅ `/about` renders on mobile and is linked from navigation or footer.
- ✅ A copy search on `/about` finds no "segur", "confiable" or "legítim".
- Commit: `feat: /about 10:1 memo and Ibero conversation record`

### F5: "Resultado simulado" label → deploy #2

**If F0 found that the semáforo output is simulated:**
- Add a visible label "Resultado simulado" next to the semáforo on every result (red, yellow, green).
- Make it impossible to remove by accident: put the flag in the same place that decides the output is simulated.
- If it's a live call, don't add the label. Record that in DECISIONS.md and make this commit only the copy-audit part below.

**In the same feature, a copy audit:**
- Search all user-facing strings for `safe`, `segur`, `confiable` and `legítim`.
- Fix any claim about an offer. "Seguro" meaning insurance is fine only if clearly unrelated; list any such hits in DECISIONS.md.
- Make sure green reads "No encontramos señales de alerta".

- ✅ Each semáforo color shows the label (when simulated).
- ✅ The audit finds zero claims about an offer.
- ✅ The F1 tests still pass.
- Commit: `feat: label simulated results and copy audit`
- **Deploy #2:** push, then give me a checklist to verify on my iPad: `/pricing`, the simulator with Case 1, `/about`, and one offer check showing the label.

**⏸ Before F6:** confirm with me that Manual steps M1–M5 are done. If they aren't, stop here, close the session (see Session Close) and say which M-step is next.

### F6: Google sign-in (Supabase Auth)

- **"Inicia sesión con Google para guardar"** button on `/pricing`, below the simulator. Signed in, show the user's email (small) and "Cerrar sesión".
- **The OAuth redirect returns to `/pricing`**, and the simulator inputs survive the round trip: keep them in `sessionStorage` before redirecting, and restore after.
- **The Supabase client reads its URL and anon key from env vars**, never hard-coded. Use the existing client if the repo has one.
- **Sign-in is never required** for the offer check, `/pricing`, the simulator or `/about`.

- ✅ On the deployed preview or production: sign in with Google, return to `/pricing` with the inputs intact, sign out.
- ✅ The offer check works signed out.
- Commit: `feat: Google sign-in for saving scenarios`

### F7: Save, load and delete scenarios → deploy #3

**Saving:**
- "Guardar escenario" opens a name field (`validateScenarioName`).
- Saving runs `validateInputs` again, then inserts **inputs only** plus `formula_version`. `user_id` comes from the DB default or `auth.uid()`; never send another user's id.
- Signed out, "Guardar escenario" starts Google sign-in instead.

**"Mis escenarios" list:**
- Shows name and date for each of the signed-in user's scenarios, newest first.
- **Cargar** fills the simulator, and outputs are recomputed with `simulate()`, never read from the DB.
- **Borrar** deletes one scenario after an in-page confirmation. Don't use `window.confirm`.
- Scenario names render as plain text, never as HTML.

**Errors:** a DB error shows "No se pudo guardar. Tus datos siguen en pantalla." and the inputs are not lost.

- ✅ Save "Escenario A" with defaults, reload, Cargar: the Case 1 numbers appear.
- ✅ I run RLS checks 5–10 from packet §12c with a second Google account (see M5). You give me the exact steps, and I report the results back.
- ✅ The client bundle has no `service_role` string.
- Commit: `feat: save, load and delete own scenarios`
- **Deploy #3.**

### F8: Final checks + Session Close for the module

- Run the full test suite and paste the summary line into DECISIONS.md.
- Walk through every box in packet §11 (security floor) and §12d (design rules). Mark each one ✅ or ❌ with a one-line reason in DECISIONS.md.
- Search the repo for secrets one last time (Hard rule 1).
- Update `docs/DECISIONS.md` with what shipped, what didn't (packet §8 stays out), the open items (source links for `/about`, the Ibero one-page proposal to send), and tomorrow's first move.

- ✅ Everything in packet §3 "Success definition" is checked off, or the gap is named.
- Commit: `chore: final checks and decisions log`
- Push (deploy #4).

---

## MANUAL steps for Rafael (iPad, in this order)

Do these yourself in the browser. None of them involve pasting anything into chat. Keep each dashboard in its own Safari tab. Wherever a step shows `<…>`, F0 or the agent gives you the exact value.

**M1. Create the scenarios table + RLS** (Supabase, any time before F7)
1. Open supabase.com → your project **semestre** → left menu **SQL Editor** → **New query**.
2. Open `docs/PACKET.md` on GitHub, go to §9, and copy the whole SQL block (from `create table public.scenarios` to the last `create policy`). On iPad: tap and hold → Select → drag to the end → Copy.
3. Paste it into the SQL editor, then tap **Run**. You should see "Success. No rows returned".
4. Left menu **Table Editor** → `scenarios`. You should see the columns and the shield "RLS enabled".
5. Left menu **Authentication** → **Policies** → `scenarios`. You should see 4 policies (select, insert, update, delete).

**M2. Google Cloud OAuth client** (before F6)
1. Open console.cloud.google.com and pick or create a project (e.g. "Lupa").
2. Menu → **APIs & Services** → **OAuth consent screen**:
   - User type **External**, app name "Lupa", your support email, authorized domain `lupaempleo.xyz`.
   - Save. Leave it in **Testing** mode and add your two Google accounts as **Test users** (you need two for the RLS check).
3. Menu → **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID** → type **Web application**, name "Lupa web".
4. **Authorized JavaScript origins:** `https://lupaempleo.xyz` and your Vercel URL (`https://<project>.vercel.app`).
5. **Authorized redirect URIs:** `https://<your-project-ref>.supabase.co/auth/v1/callback`. You can copy it from Supabase in M3 step 2.
6. Tap **Create**. Keep this tab open: you'll copy the **Client ID** and **Client secret** in M3. Don't paste them anywhere else.

**M3. Turn on Google in Supabase** (before F6)
1. Supabase → **semestre** → **Authentication** → **Sign In / Providers** → **Google**.
2. Turn it on. Copy the **Callback URL** shown there into M2 step 5 if you haven't yet.
3. Paste the Client ID and Client secret from the Google tab, then **Save**. The secret lives only in Supabase.
4. **Authentication** → **URL Configuration**:
   - **Site URL** `https://lupaempleo.xyz`
   - **Redirect URLs:** add `https://lupaempleo.xyz/**` and `https://*-rafapieck.vercel.app/**`. The agent confirms the exact preview pattern in F0.
   - Save.

**M4. Vercel environment variables** (before F6)
1. vercel.com → project **lupa** → **Settings** → **Environment Variables**.
2. Check whether the Supabase URL and anon key already exist, under the names F0 reported. If they do, skip to step 4.
3. Add them if they're missing. Get the values from Supabase → **Project Settings** → **API**: Project URL, and the `anon` `public` key. Use the exact variable names the agent gives you (e.g. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Tick **Production** and **Preview**. **Never add the `service_role` key.**
4. **Deployments** → latest → **⋯** → **Redeploy**, so the variables take effect.

**M5. RLS check with two accounts** (during F7)
1. In Safari, sign in on `/pricing` with account A and save "Escenario A".
2. Open a **Private** tab, sign in with account B, and open "Mis escenarios". "Escenario A" must not appear.
3. B saves "Escenario B". Back in A's tab, reload: only "Escenario A" is listed.
4. Supabase → **Table Editor** → `scenarios`: both rows exist, with different `user_id`.
5. Tell the agent the result of each step: pass or fail.

---

## Session Close (end of every session, no exceptions)

1. Update `docs/DECISIONS.md` → "Session log" with:
   - the date
   - features done (F-numbers and commit hashes)
   - decisions made, and why
   - anything that failed or was skipped
   - which manual M-steps are done or pending
   - **"Tomorrow's first move:"** one concrete action
2. Commit: `docs: session close YYYY-MM-DD`
3. Push to `main` and confirm the push succeeded.
4. Tell me in 3 lines what shipped, what's next, and whether I owe you a manual step.
