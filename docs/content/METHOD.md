# Content method: one input → useful output (PACKET §3d)

Six roles, each run in a separate chat, with human approval at the end. Rafael runs them (manual step M3) and saves each chat’s link.

| # | Role | Input | Output | Quality check |
|---|---|---|---|---|
| 1 | **Research** | The pattern row from `fraud_patterns` + its official alert | A 3-line fact sheet with the alert’s link | Rafael opens every link. No link, no fact. |
| 2 | **Writing** | Fact sheet + the three voice rules | Headline ≤ 8 words, body ≤ 30 words, one action | Word counts, *tú*, no “segura/confiable/legítima”, ends in an action |
| 3 | **Visual production** | Approved copy + layout slots | The card, rendered by `/api/card` (or `/s/...` for B1) | Readable at 390 px wide, < 150 KB, contrast passes |
| 4 | **Evidence / claim check** | Draft card + fact sheet | Pass/fail per claim | Any claim without a source is cut, not softened |
| 5 | **Style review** | Draft card + PACKET §3b | Checklist: palette, type, 5 layout slots, voice | All boxes pass or go to revision |
| 6 | **Revision** | Findings from 4 and 5 | v2 of the card | Roles 4 and 5 run again on v2 |
| ✋ | **Human approval** | v2 + both checklists | Rafael’s sign-off line in [`APPROVALS.md`](APPROVALS.md) | Nothing is posted without this line |

## B1 walk-through: input → masked → signals → verdict → card

> **Ejemplo con datos de prueba.** No real public offer has been chosen yet (PACKET §3d input is still “[TO FILL]”), so this walk-through uses an **invented** offer, as the §3d fallback says. The phone number is fake. The steps and outputs below are what the code in this repo actually produces for it (2026-11-22).

**1. Input** (what the person pastes):

```text
Ayudante general en bodega, $12,000 al mes. Contratación inmediata. Deposita $450 para tu uniforme y manda foto de tu INE por WhatsApp al 55 1234 5678.
```

**2. Masked** (`maskForAI`, `lib/mask.ts`: this copy is all that reaches Gemini):

```text
Ayudante general en bodega, $12,000 al mes. Contratación inmediata. Deposita $450 para tu uniforme y manda foto de tu INE por WhatsApp al [teléfono].
```

The amounts stay, because they are signals. The phone becomes `[teléfono]`. The keyword guard still reads the original text.

**3. Signals.** These are the keyword rules (`lib/keywords.ts`) on the original text. Gemini can add signals on top, but never remove these.

| Pattern | Weight | Signal | Fuente |
|---|---|---|---|
| `upfront_payment` | 4 | Te piden dinero antes de contratarte | Policía Cibernética CDMX |
| `personal_documents` | 4 | Te piden tu INE, CURP u otros documentos por mensaje | Guardia Nacional |
| `chat_only_contact` | 2 | Todo es por WhatsApp o chat, sin entrevista en persona | Policía Cibernética CDMX |
| `immediate_hiring` | 2 | Contratación inmediata, sin entrevista ni proceso | SSC CDMX |
| `no_company_name` | 1 | No dicen el nombre de la empresa | Policía Cibernética CDMX |

**4. Verdict** (`scoreSignals`, `lib/score.ts`): 4 + 4 + 2 + 2 + 1 = **13 → 🔴 Riesgo alto** (bands: 0–2 🟢, 3–5 🟡, 6+ 🔴). The AI never decides the color.

**5. Card.** The person taps **“Mandar aviso por WhatsApp”**, and WhatsApp opens with:

```text
Revisé una oferta de trabajo en Lupa y tiene señales de fraude. Mira cuáles antes de pagar: https://www.lupaempleo.xyz/s/red/upfront_payment,personal_documents,chat_only_contact,immediate_hiring,no_company_name
```

That link shows the verdict card, and its preview is the 1200×630 image: “LA REVISÉ CON LUPA”, Riesgo alto, the top 3 signals and their sources, then “Revisa la tuya en lupaempleo.xyz”. The offer text, the phone and the amounts never leave the check screen. The card is rebuilt only from pattern ids.

The finished B1 asset on `/contenido` uses the shorter link `/s/red/upfront_payment,personal_documents`, the two strongest signals.
