import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo funciona — Lupa 🔍",
  description: "Pegas la oferta, buscamos señales de fraude verificadas y te decimos el riesgo, la fuente y qué hacer.",
};

const STEPS = [
  {
    title: "Pegas la oferta",
    body: "Copia el texto del anuncio de Facebook o del mensaje de WhatsApp y pégalo en Lupa. No necesitas cuenta ni dar tus datos.",
  },
  {
    title: "Buscamos señales de fraude verificadas",
    body: "Una IA solo lee el texto y marca qué señales tiene, por ejemplo si te piden dinero o tu INE. La IA no decide el resultado.",
  },
  {
    title: "Te decimos el riesgo, la fuente y qué hacer",
    body: "El resultado sale de reglas fijas y de patrones tomados de alertas oficiales (Policía Cibernética CDMX, SSC CDMX, Guardia Nacional). Cada señal muestra su fuente y siempre te damos un siguiente paso.",
  },
] as const;

const VERDICTS = [
  { emoji: "🔴", label: "Riesgo alto", body: "Tiene varias señales de fraude. No pagues ni mandes documentos." },
  { emoji: "🟡", label: "Precaución", body: "Tiene alguna señal. Confirma antes de seguir." },
  {
    emoji: "🟢",
    label: "No encontramos señales conocidas",
    body: "No tiene las señales que conocemos. Eso no garantiza nada: igual confirma que la empresa existe y nunca pagues por adelantado.",
  },
] as const;

export default function ProductPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-6 pb-4">
      <h1 className="text-4xl font-bold tracking-tight">Cómo funciona</h1>

      <ol className="flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5">
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xl font-bold text-white"
            >
              {i + 1}
            </span>
            <div>
              <h2 className="text-xl leading-snug font-bold text-gray-900">{step.title}</h2>
              <p className="mt-1 text-lg leading-snug text-gray-800">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="rounded-2xl bg-amber-100 p-5 ring-1 ring-amber-200">
        <h2 className="text-xl font-bold text-gray-900">La IA solo lee</h2>
        <p className="mt-1 text-lg leading-snug text-gray-900">
          La IA nunca da el resultado. El resultado viene de patrones de alertas oficiales y de reglas fijas, así que
          nadie lo puede convencer de cambiarlo.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900">Qué significa cada color</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {VERDICTS.map((v) => (
            <li key={v.label} className="flex gap-3">
              <span className="text-xl leading-7" aria-hidden>
                {v.emoji}
              </span>
              <p className="text-lg leading-snug text-gray-800">
                <strong className="text-gray-900">{v.label}.</strong> {v.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900">Lo que guardamos</h2>
        <p className="mt-1 text-lg leading-snug text-gray-800">
          Lupa no guarda lo que pegas ni quién eres. Solo guardamos el color del resultado, el puntaje, las señales
          encontradas y la fecha, para contar cuántas ofertas se revisan.
        </p>
      </section>

      <Link
        href="/"
        className="w-full rounded-full bg-blue-700 py-4 text-center text-xl font-semibold text-white active:bg-blue-800"
      >
        Revisar una oferta
      </Link>
    </main>
  );
}
