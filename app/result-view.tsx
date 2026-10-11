import type { ScoreResult, Verdict } from "@/lib/score";

export type CheckResult = ScoreResult & { simulated: boolean };

const THEME: Record<Verdict, { band: string; circle: string; icon: string; title: string }> = {
  red: { band: "bg-red-500", circle: "bg-red-700", icon: "text-red-700", title: "text-red-800" },
  yellow: { band: "bg-amber-300", circle: "bg-amber-700", icon: "text-amber-600", title: "text-amber-800" },
  green: { band: "bg-green-500", circle: "bg-green-700", icon: "text-green-700", title: "text-green-800" },
};

export const SIMULATED_NOTE =
  "ℹ️ La IA no respondió esta vez (análisis de IA simulado). El resultado viene de nuestras señales de alerta oficiales, que funcionan igual.";

const EMOJI: Record<Verdict, string> = { red: "🔴", yellow: "🟡", green: "🟢" };

export default function ResultView({
  result,
  isExample,
  onReset,
}: {
  result: CheckResult;
  isExample: boolean;
  onReset: () => void;
}) {
  const theme = THEME[result.verdict];

  return (
    <div className="flex flex-1 flex-col">
      <section className={`${theme.band} px-5 pt-6 pb-14`} aria-live="polite">
        <div
          className={`${theme.circle} mx-auto flex size-44 flex-col items-center justify-center rounded-full text-center text-white shadow-lg`}
        >
          <h2 className="px-2 text-[1.8rem] leading-tight font-bold">
            <span className="sr-only">{EMOJI[result.verdict]} </span>
            {result.verdictLabel}
          </h2>
        </div>
      </section>

      <div className="-mt-10 flex flex-col gap-4 px-5 pb-6">
        <section className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5">
          <h3 className={`text-xl font-bold ${theme.title}`}>Señales de alerta encontradas</h3>
          {result.matches.length === 0 ? (
            <p className="mt-3 text-lg text-gray-800">No encontramos señales de alerta.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {result.matches.map((m) => (
                <li key={m.id} className="flex gap-3">
                  <span className={`${theme.icon} text-xl leading-7`} aria-hidden>
                    ⚠
                  </span>
                  <div>
                    <p className="text-lg leading-snug text-gray-900">{m.label}</p>
                    <p className="mt-0.5 text-sm text-gray-500">Fuente: {m.source}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-amber-100 p-5 ring-1 ring-amber-200">
          <h3 className="text-lg font-semibold text-gray-900">Qué hacer ahora</h3>
          <p className="mt-1 text-xl leading-snug font-bold text-gray-900">{result.nextStep}</p>
        </section>

        {result.simulated && (
          // Required label for simulated AI output. Kept small and below the
          // advice: the verdict itself always comes from the rules, so it must
          // not read as "fake result" (persona test, confusion #1).
          <p role="status" className="px-1 text-sm leading-snug text-gray-500">
            {SIMULATED_NOTE}
          </p>
        )}

        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-full bg-blue-700 py-4 text-xl font-semibold text-white active:bg-blue-800"
        >
          Revisar otra oferta
        </button>

        {isExample && <p className="text-center text-base text-gray-600">Datos de ejemplo</p>}
      </div>
    </div>
  );
}
