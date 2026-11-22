# Persona test · Week 15 · share flow (job-seeker side)

> **SIMULACIÓN.** Synthetic persona test (PACKET §14d), run by Rafael in a separate chat on 2026-11-22. Jorge is an invented persona (`docs/PERSONAS.md`), not a real person. Treat every finding as a hypothesis until real job seekers react.

**Persona:** Jorge, 27, Iztapalapa.
**Walk-through (§14d):** sees A1 in a Facebook group → taps the link → checks an offer → shares the 🔴 verdict with his cousin → the cousin opens `/s/...`.

## Jorge's table

**[PENDIENTE: Rafael pega aquí la tabla de Jorge.]** It didn't arrive with the message of 2026-11-22. Nothing here is filled in from memory or invented.

## Worst confusion (reproduces in production)

The gray note under the result read: “La IA no respondió esta vez (análisis de IA simulado)… (motivo: auth)”.
- Jorge read **“simulado” as “falso”**.
- It clashed with the footer “Lo analiza una IA de Google”.
- **“auth”** was jargon.
- **Result: he doubted the “Riesgo alto” and paid.**

It reproduced on the live site because production Gemini calls are failing (expired `GEMINI_API_KEY`, motivo `auth`), so every check showed this note.

## Fix (2026-11-22)

1. The note now reads: **“Esta vez la revisión se hizo sin IA, solo con nuestras señales de alerta oficiales. El resultado siempre lo deciden estas señales.”** It says honestly that no AI was used this time, without the word “simulado”.
2. The reason (`auth`, `quota`…) is **no longer on screen**. It stays in the `/api/check` JSON (`simulatedReason`) and in the note's `data-simulated-reason` attribute, for diagnosis only.
3. Unchanged: the `simulated` flag is still saved in `checks`, and the verdict still comes from the same rules.
4. Tests: the copy audit and `app/screens.test.tsx` check that the visible text has no “simulad”, “motivo” or error code, and that the attribute only carries values from the fixed list.

## Retest

**[PENDIENTE: Rafael runs the retest on the live site and records the result here.]**
