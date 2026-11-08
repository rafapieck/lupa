"use client";

import { useState } from "react";
import type { IntentAnswer } from "@/lib/save-event";
import { sendEvent } from "@/lib/send-event";

export const INTENT_TITLE = "¿Qué vas a hacer con esta oferta?";
export const INTENT_HINT = "Es opcional y anónimo. Nos ayuda a saber si Lupa sirve.";
export const INTENT_THANKS = "Gracias. Tu respuesta es anónima.";
export const REPORT_LINE =
  "Si ya pagaste o mandaste documentos, repórtalo al 088 o a la Policía Cibernética de tu estado.";

export const INTENT_OPTIONS: { answer: IntentAnswer; label: string }[] = [
  { answer: "no_pay", label: "No voy a pagar ni mandar documentos" },
  { answer: "verify", label: "Primero voy a verificar la empresa" },
  { answer: "continue", label: "Voy a seguir con el proceso" },
  { answer: "already_paid", label: "Ya había pagado o mandado documentos" },
];

/**
 * One optional, anonymous tap after the verdict (Week 13 event log).
 * All four buttons share the same neutral style on purpose: the design must
 * not reward "continue" with a green "go" button. Fixed answers only, never
 * free text, so nothing personal can be typed in.
 */
export default function IntentCard({ checkId }: { checkId: string }) {
  const [answer, setAnswer] = useState<IntentAnswer | null>(null);

  function choose(a: IntentAnswer) {
    if (answer) return;
    setAnswer(a);
    sendEvent(checkId, "intent", a);
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5" aria-live="polite">
      <h3 className="text-lg font-semibold text-gray-900">{INTENT_TITLE}</h3>
      {answer ? (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-lg text-gray-900">{INTENT_THANKS}</p>
          {(answer === "continue" || answer === "already_paid") && (
            <p className="text-base leading-snug font-semibold text-gray-900">{REPORT_LINE}</p>
          )}
        </div>
      ) : (
        <>
          <p className="mt-1 text-base text-gray-600">{INTENT_HINT}</p>
          <div className="mt-3 flex flex-col gap-2">
            {INTENT_OPTIONS.map((o) => (
              <button
                key={o.answer}
                type="button"
                onClick={() => choose(o.answer)}
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-left text-lg leading-snug text-gray-900 active:bg-gray-100"
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
