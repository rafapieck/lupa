import type { Metadata } from "next";
import Link from "next/link";
import Simulator from "../simulator";

export const SIMULADOR_TITLE = "¿Cómo se sostiene Lupa?";
export const SIMULADOR_INTRO =
  "Para fundadores, inversionistas y quien quiera revisar los números: cuántas instituciones tendrían que pagar para cubrir lo que cuesta que revisar ofertas siga siendo gratis.";

export const metadata: Metadata = {
  title: "Simulador de ingresos — Lupa 🔍",
  description: SIMULADOR_INTRO,
};

export default function SimuladorPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-6 pb-4">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">{SIMULADOR_TITLE}</h1>
        <p className="mt-2 text-lg leading-snug text-gray-800">{SIMULADOR_INTRO}</p>
        <Link href="/pricing" className="mt-2 inline-block py-1 text-base font-medium text-blue-700 underline underline-offset-4">
          ← Volver a precios
        </Link>
      </header>
      <Simulator />
    </main>
  );
}
