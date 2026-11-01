# CHARTER — Lupa

**Founder:** Rafael Pieck Guerra · **Venture:** Weeks 12–17 · **Origin:** Week 9 ship, "The Job Savior" (ADVERSARY)
**Method:** *Proof Before Verdict* (see METHOD_RafaelPieck.pdf). Step 3 of the Method, "the AI reads; something verifiable decides", is Lupa's engine.

> Written before the rebuild. This charter is the referee for every scope fight from Week 12 to Week 17, including the ones with myself.

---

## Vision (3 years)

Lupa is the trust layer of informal job searching in Mexico. Anyone can forward a suspicious job offer and, before paying or handing over their INE, get a verdict in seconds that is built from verified fraud patterns and shows its official source. Every check (anonymized, with no text stored) feeds a living map of active scams by city and platform, which Lupa shares with job seekers, schools and the Policía Cibernética so the warning arrives before the scam spreads.

## Users

Job seekers aged 18–30 looking for entry-level work in Facebook groups and WhatsApp forwards. They use an Android phone on limited data, trust offers that "look official", have never heard of job-scam patterns, and would pay $300–$500 MXN up front for a "uniform" or "training" if a stable job were promised. See `docs/PERSONAS.md`.

## Principles (Lupa never breaks these)

1. **The AI reads; the rules decide.** The AI only extracts signals. The verdict comes from verified patterns and fixed rules, never from the AI's opinion.
2. **Every flag shows its source.** No red flag appears without the official alert that backs it.
3. **We never say "it's safe."** 🟢 means "we found no known signals", nothing more.
4. **Every verdict ends in one concrete next step.**
5. **We never store the pasted text or who pasted it.** A saved check keeps only signals, verdict and date.

## Non-goals (Lupa will NEVER)

- Publish job listings, run a job board, or build CVs.
- Charge the job seeker.
- Take money from employers to "approve" their offers, or let any payer change a verdict.
- Accuse a named company or person.
- Replace the police. Lupa points to 088 and the Policía Cibernética; it doesn't investigate.
- Add features beyond the core loop during Weeks 12–17 (my blind spot is over-scoping).

## North Star

**Checks per week:** the number of offers checked on Lupa in a week.

*Guardrail metric:* the share of 🔴 / 🟡 verdicts. If checks grow while almost everything comes back 🟢, either the patterns are missing real scams or the traffic isn't the people we serve. A rising North Star with a collapsing guardrail is a warning, not a win.

## Core concepts (the nouns of Lupa)

| Concept | Definition |
|---|---|
| **Offer** (Oferta) | The text of a job offer that the user pastes. Never stored. |
| **Signal** (Señal) | A trait the AI extracts from an offer, e.g. "asks for payment" or "interview only by chat". |
| **Pattern** (Patrón) | A verified fraud signal with a weight, a label, a next step and a source. |
| **Source** (Fuente) | The official alert (Policía Cibernética, Guardia Nacional, SSC) that backs a pattern. |
| **Verdict** (Veredicto) | 🟢 low / 🟡 caution / 🔴 high, computed by fixed rules from matched patterns. |
| **Next step** (Siguiente paso) | The one concrete action shown with the verdict. |
| **Check** (Revisión) | The saved record of one verdict: matched pattern IDs, verdict, score and date. No offer text, no user data. |

*If a feature doesn't speak these nouns, it doesn't belong in Lupa.*
