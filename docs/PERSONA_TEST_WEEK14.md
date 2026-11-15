# Persona test · Week 14 · `/pricing` (payer side)

**Run by:** Rafael, 2026-11-15, on the live `/pricing` (tiers + simulator on the same page, before the fix below).
**Type:** synthetic persona (Layer 1). **It does not replace a real coordinator.** Treat every finding as a hypothesis until a real bolsa de trabajo coordinator (Ibero first) reacts to the page or the proposal.

## Persona (invented)

**Lic. Patricia Gómez**, 48, coordinadora de la bolsa de trabajo de una universidad en la CDMX. Invented for this test; not a real person.
- She doesn't buy software herself: she has to justify any expense to her director.
- She cares about her students and about the university's reputation when a fake offer slips through the bolsa.
- She has little time and little patience for startup language.

## Walk-through

1. **The price is visible.** A good first impression: she doesn't have to ask for a quote to know what it costs.
2. **"En desarrollo" + "Hoy no cobramos".** It feels like a project, not a vendor. She wonders whether Lupa will still exist next semester.
3. **The simulator, with "pipeline" and "inventado".** The page stops talking to her. It's written for someone running the business, not for someone buying it. **She'd close the page here.** (Worst confusion.)
4. **"Costo por revisión".** She reads it as a hidden fee she would be charged per check.
5. **"Margen 96.8%".** She feels overcharged: "they keep almost all of it".

## Verdict

She **would not pay $24,000 MXN a year today**. Not because of the price, but because **she doesn't trust it enough yet**.

## What she'd need

- **A sentence she can paste to her director** saying what Lupa does for the students.
- **A plain explanation of "Lupa en tu bolsa de trabajo"**, including whether her IT department (Sistemas) has to do anything.
- **A free pilot for one semester.**
- **Proof that it's real** (who else uses it, results).
- **The price with IVA**, or a PDF she can forward.

## What we fixed (same day)

- **Worst confusion (#3, #4, #5):** the revenue simulator, with save/load scenarios, moved off `/pricing` to its own page, `/pricing/simulador`, written for founders and investors. `/pricing` keeps one small link: "¿Cómo se sostiene Lupa? Ver el simulador de ingresos". The coordinator no longer meets "pipeline", "costo por revisión" or "margen".
- **Director sentence** at the top of `/pricing`: "Protege a tus estudiantes de ofertas de trabajo falsas, sin que Sistemas tenga que instalar nada."
- **Under "Lupa en tu bolsa de trabajo":** "Un botón en tu portal que abre Lupa. No requiere trabajo de Sistemas."
- **IVA-included price** in small text on both paid tiers: Campus "$27,840 con IVA", Programa "$104,400 con IVA". Buscador stays $0.

## Deferred (not fixed in this round)

- **Pilot terms:** the packet's proposal says a 1-month free pilot; she asked for one semester. Decide before the Ibero proposal.
- **PDF proposal:** the one-page proposal (PACKET Appendix B) as a PDF she can forward.
- **Proof from a real customer:** none exists yet. Nothing on the page may suggest otherwise.
- **"Hoy no cobramos" / "En desarrollo"** still read as "project". They stay because they're true; revisit the wording with a real coordinator.
- **Domain:** `.xyz` may read as less institutional than `.mx` or `.org.mx`. Revisit at renewal (see the 2026-11-01 domain entry in DECISIONS.md).
