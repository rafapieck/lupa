# User sessions — Week 13

> Sessions 1–5 are **simulated**: five synthetic job-seekers, written with an AI, used as an extended persona test (Layer 1). Their quotes are invented. Findings are hypotheses to confirm with real users.

**Script used for each simulated session:** their story with suspicious offers → open `www.lupaempleo.xyz` on their own phone and check an offer without help → "¿Qué harías ahora?" → "¿La usarías otra vez? ¿Te puedo escribir en unos días?"

---

## Session log (simulated)

| # | Role (synthetic) | Channel / stranger? | What they tried | Where they struggled | Quote (simulated) | What they did |
|---|---|---|---|---|---|---|
| 1 | Woman, 22, Ecatepec, looking for cashier work; lost $350 to a fake "uniform" fee last year | FB group "Empleos Edomex" · stranger | Her own offer: it arrived as a **flyer image** on WhatsApp | Couldn't paste an image; tried to type the flyer by hand, gave up halfway | "La oferta me llegó en foto, ¿cómo la pego? Nadie va a escribir todo eso." | Used the example offer instead; tapped "No voy a pagar" |
| 2 | Man, 31, Iztapalapa, security guard; offered a job in Monterrey "with housing" | Employment office line · stranger | Pasted the offer text | None; read the red verdict fast | "Ah, o sea que si me piden la INE por WhatsApp ya es para dudar." | **Copied the reply**; answered "Primero voy a verificar la empresa" |
| 3 | Woman, 44, Cuernavaca, mother looking for work from home | FB group "Bolsa de trabajo Cuernavaca" · stranger | Her own offer: "like videos for $300 a day", sent as **screenshots** of a Telegram chat | Same as #1: offer was images; copied only the first message, got 🟡 | "Lo demás venía en otras capturas, no sabía que tenía que pegar todo." | Answered "Voy a seguir con el proceso" after 🟡, then saw the 088 line and hesitated |
| 4 | Man, 19, Tlalpan, first job, studying prepa abierta | Job fair · stranger | Example offer | The headline word "fraude" | "Suena a que me van a regañar por caer." | Answered "No voy a pagar"; said he'd send Lupa to a friend |
| 5 | Woman, 27, Naucalpan, ex call-center agent | WhatsApp group of a former coworker · stranger | Pasted a real-looking offer with a company name | 🟢 "No encontramos señales conocidas" | "¿Entonces sí es real o no? Me lo debería decir." | Didn't answer the card; asked for a "sí o no" |

**Behaviors (simulated):** 1 reply copied (#2) · 4 of 5 answered the card · 1 said she'd forward Lupa (#4) · 2 of 5 couldn't check their own offer because it was an image (#1, #3).

## Pain ranking (3 worst, ordered by threat to the 10:1 case)

The 10:1 case: Lupa is worth funding if people asked for money **pause before paying**. A pain ranks higher the more it stops a job-seeker from getting a verdict at the moment the money request arrives.

| Rank | Pain | Who showed it | Why it threatens the 10:1 | Fix this week? |
|---|---|---|---|---|
| 1 | **Offers arrive as images (flyers, screenshots) and can't be checked** | #1, #3 | If the offer can't get in, there's no verdict at all, at the exact moment of the money request. It's the timing hypothesis from the MONEY brief, in its most concrete form | **Yes → PACKET §13** |
| 2 | Partial paste: offers split across several messages give a weaker verdict (🟡 instead of 🔴) | #3 | A softened verdict on a real scam can let the person continue | Backlog (hint next to the textbox) |
| 3 | 🟢 is read as "it's real" / people want a yes-or-no | #5 | Not a lost verdict, but a trust risk: the shadow clause says Lupa never says "safe" | Backlog (stronger copy under 🟢; never change the rule) |

## Proof of return

*Simulated sessions cannot provide proof of return. Real evidence comes from the event log: `select repeat_visit, count(*) from public.checks group by repeat_visit;`, plus any message from a real user.*
