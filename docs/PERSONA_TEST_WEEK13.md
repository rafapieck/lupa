# Persona test — Layer 1 · Week 13 (five synthetic job-seekers)

Five synthetic users, written with an AI from the personas in `docs/PERSONAS.md`, walked through `www.lupaempleo.xyz` (home → result → answer card). All quotes are invented. This is the Layer 1 test; real-user sessions are in `docs/USER_SESSIONS.md`.

## Synthetic users and what they did

| # | Role (synthetic) | Channel / stranger? | What they tried | Where they struggled | Quote (simulated) | What they did |
|---|---|---|---|---|---|---|
| 1 | Woman, 22, Ecatepec, looking for cashier work; lost $350 to a fake "uniform" fee last year | FB group "Empleos Edomex" · stranger | Her own offer: it arrived as a **flyer image** on WhatsApp | Couldn't paste an image; tried to type the flyer by hand, gave up halfway | "La oferta me llegó en foto, ¿cómo la pego? Nadie va a escribir todo eso." | Used the example offer instead; tapped "No voy a pagar" |
| 2 | Man, 31, Iztapalapa, security guard; offered a job in Monterrey "with housing" | Employment office line · stranger | Pasted the offer text | None; read the red verdict fast | "Ah, o sea que si me piden la INE por WhatsApp ya es para dudar." | **Copied the reply**; answered "Primero voy a verificar la empresa" |
| 3 | Woman, 44, Cuernavaca, mother looking for work from home | FB group "Bolsa de trabajo Cuernavaca" · stranger | Her own offer: "like videos for $300 a day", sent as **screenshots** of a Telegram chat | Same as #1: offer was images; copied only the first message, got 🟡 | "Lo demás venía en otras capturas, no sabía que tenía que pegar todo." | Answered "Voy a seguir con el proceso" after 🟡, then saw the 088 line and hesitated |
| 4 | Man, 19, Tlalpan, first job, studying prepa abierta | Job fair · stranger | Example offer | The headline word "fraude" | "Suena a que me van a regañar por caer." | Answered "No voy a pagar"; said he'd send Lupa to a friend |
| 5 | Woman, 27, Naucalpan, ex call-center agent | WhatsApp group of a former coworker · stranger | Pasted a real-looking offer with a company name | 🟢 "No encontramos señales conocidas" | "¿Entonces sí es real o no? Me lo debería decir." | Didn't answer the card; asked for a "sí o no" |

**Behaviors (synthetic):** 1 reply copied (#2) · 4 of 5 answered the card · 1 said she'd forward Lupa (#4) · 2 of 5 couldn't check their own offer because it was an image (#1, #3).

## Pain ranking (3 worst, ordered by threat to the 10:1 case)

The 10:1 case: Lupa is worth funding if people asked for money **pause before paying**. A pain ranks higher the more it stops a job-seeker from getting a verdict at the moment the money request arrives.

| Rank | Pain | Which persona | Why it threatens the 10:1 | Fix this week? |
|---|---|---|---|---|
| 1 | **Offers arrive as images (flyers, screenshots) and can't be checked** | #1, #3 | If the offer can't get in, there's no verdict at all, at the exact moment of the money request. It's the timing hypothesis from the MONEY brief, in its most concrete form | **Yes → PACKET §13** |
| 2 | Partial paste: offers split across several messages give a weaker verdict (🟡 instead of 🔴) | #3 | A softened verdict on a real scam can let the person continue | Backlog (hint next to the textbox) |
| 3 | 🟢 is read as "it's real" / people want a yes-or-no | #5 | Not a lost verdict, but a trust risk: the shadow clause says Lupa never says "safe" | Backlog (stronger copy under 🟢; never change the rule) |

## Proof of return

*A persona test cannot provide proof of return. Real evidence comes from the event log: `select repeat_visit, count(*) from public.checks group by repeat_visit;`, plus any message from a real user.*

## Every confusion logged

| Persona | Screen | Confusion |
|---|---|---|
| #1 cashier, 22 | Home | Offer arrived as a flyer image; nowhere to put it |
| #1 | Home | Tried to type the flyer by hand, gave up halfway |
| #3 mother, 44 | Home | Offer was 4 screenshots of a chat; pasted only the first message |
| #3 | Result (🟡) | Softer verdict than the full offer deserved; answered "Voy a seguir" |
| #4 first job, 19 | Home | The word "fraude" in the headline felt like being scolded |
| #5 ex call center, 27 | Result (🟢) | Read "no encontramos señales conocidas" as "it's real"; wanted a yes or no |

## What I fixed, and why not the persona #1

**Worst persona finding:** image offers (#1, #3). It is **not fixed this week**, on purpose. The same day, real users (`docs/USER_SESSIONS.md`) showed a different #1: they didn't know **how to verify the company**. Real users outrank synthetic ones, and the Charter allows one fix per round, so the fix shipped was **"Antes de pagar o mandar documentos, verifica la empresa"** (3 fixed steps on 🟡/🔴, deploy 2, `docs/evidence/fix1-after-*.png`).

**How the persona test still changed the product:**
- It is why the fix is **fixed text below "Qué hacer ahora"**, not a link or a longer page: personas #1 and #3 dropped off as soon as they had to do extra work.
- It confirmed the shadow clause: persona #5 wanted Lupa to say "es real". Lupa still never says it (copy audit test).

**Backlog, in order:** (1) image or screenshot upload (personas #1, #3), (2) hint to paste every message of the offer (#3), (3) clearer line under 🟢 that Lupa can't confirm a job is real (#5), (4) softer headline wording (#4).
