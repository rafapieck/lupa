# Persona test · Week 15 · Distribution flow (seeker side)

**Run by:** Rafael, 2026-11-22, on the live site (www.lupaempleo.xyz), after F1–F6 were deployed and before the fix below. **Type:** synthetic persona, **SIMULATION**. It does not replace real seekers. Every finding is a hypothesis until a real job seeker uses Lupa from a shared link. **Full original conversation:** [TO FILL: share link of the persona chat]

## Persona (invented, research-grounded)

**Jorge**, 27, Iztapalapa (CDMX). Invented for this test; not a real person. It is the same Jorge as Persona 2 in `docs/PERSONAS.md`.
- Has been looking for work for months. Mid-range Android on limited data.
- Finds jobs in Facebook groups and WhatsApp forwards. Reads fast, dislikes long text, distrusts pages he doesn’t know.
- Today a “recruiter” on WhatsApp offers him $2,800 a day and asks for $500 for a uniform and a photo of his INE, **today**.

**Research base:** in the 5 real Week 13 sessions, 5 of 5 seekers had been asked for money before working ($250–$1,000 MXN), and none came through a university job board. Consejo Ciudadano CDMX reports that fake offers arrive mostly by direct messages, WhatsApp and Facebook.

## Walk-through (the Week 15 distribution loop)

1. **The WhatsApp status (C1 card) → Lupa.** He opens the link *because someone he knows posted it*. From an unknown number he wouldn’t. The `.xyz` domain looks like the pages scammers use. On the home page he sees “Precios” in the menu and wonders if he’ll be charged at the end, “como el reclutador”. The card promised “3 cosas antes de depositar” and the home page doesn’t show them. He doesn’t know how to paste several messages or a photo.
2. **The result.** “Riesgo alto” matches his suspicion. The “Fuente:” lines make him trust it more, and he copies the reply for the recruiter. **Then the gray note “análisis de IA simulado (motivo: auth)” makes him doubt everything:** *“¿Simulado? ¿Entonces es de mentiras? Arriba decía que lo analizaba Google. Y ‘auth’ no sé qué es.”* Because he needs the job, he talks himself into “a lo mejor no es para tanto”. He also asks what to do if he already sent his INE. **(Worst confusion.)**
3. **“Mandar aviso por WhatsApp”.** For a second he thinks it reports the recruiter. The message itself is short and clear. He wonders whether his cousin will see the recruiter’s number or his data.
4. **The cousin opens `/s/...`.** It reads as a warning, not an ad. Coming from Jorge, he opens it even on `.xyz`. He’d like a neutral summary of what offer it was. “Revisa tu oferta” doesn’t apply to him but doesn’t get in the way.

## Findings (the persona’s table, out of character)

| Step | Confusion | Severity | Suggested fix |
|---|---|---|---|
| 1 | “Precios” in the menu of a “free” tool reads as a later charge, the scam’s own pattern | Medium | Hide or rename it for `src=wa_status` visitors; “Gratis, sin registro” next to the button |
| 1 | `.xyz` domain looks untrustworthy | Medium | A .mx / .com domain; who is behind Lupa visible on the home page |
| 1 | The card promises “3 cosas antes de depositar”; the home page doesn’t show them | Medium | For `src=wa_status`, show the 3 things above the box |
| 1 | Doesn’t know how to paste several messages or a photo | Medium | Help text: “Copia todos los mensajes del reclutador, uno tras otro”; screenshot upload later |
| 2 | “análisis de IA simulado (motivo: auth)”: “simulado” reads as “fake”, contradicts “Lo analiza una IA de Google”, “auth” is jargon | **High** | Fix the API key; when falling back, say “sin IA esta vez” in plain words and never show technical codes |
| 2 | “Riesgo alto” doesn’t answer “¿voy o no?” | Low | One direct line: “No pagues nada ni mandes tu INE” |
| 2 | Nothing for someone who already paid or sent the INE | Medium | A “¿Ya pagaste o mandaste tu INE?” block (Consejo Ciudadano, bank) |
| 3 | “Mandar aviso” can read as reporting the recruiter | Medium | “Avisarle a alguien por WhatsApp” / “Compartir con un familiar” |
| 3 | “Lupa no guarda lo que pegas” vs. a link that shows the signals | Low | “Se comparten solo las señales, no tu mensaje ni tus datos” |
| 4 | The cousin doesn’t know which offer it was | Low | Neutral summary with no personal data. **Not adopted:** it would put offer details on the shared card, against packet §12 rule 2 |
| 4 | The rest is clear | — | No change |

**Worst confusion:** the “análisis de IA simulado (motivo: auth)” note in step 2. It appears at the exact moment Jorge decides whether to pay, and in his own words tells him the result “is simulated”. Someone who needs the job gets an excuse to ignore “Riesgo alto” and deposit the $500. It cancels the rest of the flow.

## Does it reproduce on the live site?

**Yes.** On 2026-11-22, every check Rafael ran in production showed the note, ending in “(motivo: auth)”. The cause is an expired Gemini API key (logged in DECISIONS.md as a known open item). The verdict is unaffected, because the rules with official sources always decide it. But the wording made a correct result look fake.

## What we fixed (same day)

- **Fallback copy:** the note now reads *“Esta vez la revisión se hizo sin IA, solo con nuestras señales de alerta oficiales. El resultado siempre lo deciden estas señales.”* The word “simulado” and the technical reason no longer appear on screen.
- **Diagnosis kept off-screen:** the reason (`auth`, `quota`, …) stays only in the `/api/check` JSON response and a `data-` attribute, for debugging.
- **Still honest:** the screen still says this check ran without AI, and `checks.simulated` is still saved.

**Commit:** `245f1f7` (fix: plain no-AI note after persona test)

## Retest (same offer, live site, after the fix)

**Done by Rafael in Safari, 2026-11-22, same offer, live site.** The note now reads: *“Esta vez la revisión se hizo sin IA, solo con nuestras señales de alerta oficiales. El resultado siempre lo deciden estas señales.”* Neither “simulado” nor the reason appears on screen. **Jorge’s worst confusion is resolved.** Screenshot: in the DEMO.

## Deferred (not fixed in this round)

- **“Precios” in the seeker’s menu.** Real tension: the payer page has to exist. Revisit with a seeker-only menu for `src` visitors.
- **`.xyz` domain.** Already logged for renewal (DECISIONS.md, 2026-11-01).
- **“3 cosas” missing on the landing page** for `src=wa_status` visitors.
- **Help text for pasting several messages;** screenshot input stays out of scope (packet §10).
- **“Mandar aviso” label:** consider “Avisarle a alguien por WhatsApp”.
- **“¿Ya pagaste o mandaste tu INE?” block** with Consejo Ciudadano and bank steps.
- **The root cause:** renew the Gemini API key in Vercel so the fallback is rare.
