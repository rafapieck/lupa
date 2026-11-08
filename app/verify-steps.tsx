export const VERIFY_TITLE = "Antes de pagar o mandar documentos, verifica la empresa:";

// Real-user sessions #1 and #3 (Week 13): both didn't know how to check if the
// company existed and searched online on their own. Fixed text, chosen by us,
// never written by the AI. Shown on yellow and red only.
export const VERIFY_STEPS = [
  "Busca en Google el nombre de la empresa junto con la palabra «fraude».",
  "Busca tú mismo su página y su teléfono oficiales. No uses el número ni el link que te mandaron.",
  "Pide la dirección y una entrevista en persona o por videollamada antes de cualquier pago.",
];

export default function VerifySteps() {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5">
      <h3 className="text-lg font-semibold text-gray-900">{VERIFY_TITLE}</h3>
      <ol className="mt-3 flex flex-col gap-3">
        {VERIFY_STEPS.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-base font-bold text-white"
              aria-hidden
            >
              {i + 1}
            </span>
            <p className="text-lg leading-snug text-gray-900">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
