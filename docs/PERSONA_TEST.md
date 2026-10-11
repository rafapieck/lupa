# Persona test — Layer 1

## Persona prompt

> You are Karla, 19, from Ecatepec. You lost your call-center job when the company moved to AI agents. You look for work in Facebook groups and WhatsApp. You skim instead of reading, you trust things that look official, and if a page asks too much or confuses you, you give up silently. Nobody will know you left.

## Method

1. Fresh chat with the persona prompt above (no earlier context).
2. Show Karla 3 screenshots in order:
   1. Home screen (paste box)
   2. The offer pasted, before tapping "Revisar oferta"
   3. Result screen (🔴 Riesgo alto, invented offer 1: "…Solo deposita $450 para tu uniforme.")
3. After each screenshot, ask what she sees, what she would do next, and what confuses her. Log every hesitation.

## Result

**Karla would NOT pay the $450.** She trusted the "Fuente: Policía Cibernética CDMX" line and the next step "Ninguna empresa real cobra por contratarte". The core loop works: verdict + official source + one concrete next step.

## Confusion log (worst → least)

| # | Confusion | Status |
|---|---|---|
| 1 | The "⚠️ Resultado simulado" banner at the top read as "fake result", and she almost ignored the whole warning | **FIXED.** The note moved below "Qué hacer ahora", in small grey text, with new wording: "ℹ️ La IA no respondió esta vez (análisis de IA simulado). El resultado viene de nuestras señales de alerta oficiales, que funcionan igual." |
| 2 | Offers that are images/flyers can't be checked | Out of scope (image reading). Backlog |
| 3 | "Riesgo alto" reads as "maybe" | Backlog |
| 4 | No next step besides "Revisar otra oferta" (warn the friend who sent it, report it) | Backlog |
| 5 | The scammer's comeback ("se te reembolsa") isn't anticipated | Backlog |
| 6 | "No dicen el nombre de la empresa" is the easiest flag to explain away | Backlog |
| 7 | The page doesn't say where the pasted text goes | **FIXED.** The footer now says "Lo analiza una IA de Google. Lupa no guarda lo que pegas." |
| 8 | The page doesn't say what to paste | Backlog |
| 9 | The "0/3000" counter means nothing to her | Backlog |
| 10 | The sources are CDMX, but she lives in Edomex | Backlog |
