import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ChecksThisWeek from "./checks-this-week";

export const metadata: Metadata = {
  title: "Nosotros — Lupa 🔍",
  description: "Por qué existe Lupa, quién la paga y cuántas ofertas se revisan cada semana.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-6 pb-4">
      <h1 className="text-4xl font-bold tracking-tight">Nosotros</h1>

      <Suspense fallback={null}>
        <ChecksThisWeek />
      </Suspense>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Por qué existe Lupa</h2>
        <p className="mt-2 text-lg leading-snug text-gray-800">
          Quien busca su primer trabajo, o lo que salga, lo busca en grupos de Facebook y en mensajes de WhatsApp. Ahí
          esperan las estafas: te piden dinero para el &quot;uniforme&quot;, el &quot;curso&quot; o el &quot;examen
          médico&quot;, te piden tu INE por mensaje, o te ofrecen viaje y hospedaje para irte mañana a otra ciudad.
        </p>
        <p className="mt-2 text-lg leading-snug text-gray-800">
          La persona decide sola, con prisa, frente a alguien que sabe exactamente qué decir, y sin nada con qué
          comparar la oferta.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Hoy vs. con Lupa</h2>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <div className="rounded-2xl bg-gray-100 p-5">
            <h3 className="text-lg font-semibold text-gray-700">Hoy</h3>
            <p className="mt-1 text-lg leading-snug text-gray-800">
              Buscas el nombre en Google, preguntas en el grupo y decides por corazonada.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5">
            <h3 className="text-lg font-semibold text-blue-800">Con Lupa</h3>
            <p className="mt-1 text-lg leading-snug font-semibold text-gray-900">
              Una respuesta con fuente sobre tu oferta, en menos de 30 segundos, gratis.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Quién paga</h2>
        <p className="mt-2 text-lg leading-snug text-gray-800">
          Lupa se pensó para que la paguen patrocinadores públicos y sociales: programas de empleo, fundaciones y
          programas de prevención del delito.
        </p>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-6 text-lg leading-snug text-gray-800">
          <li>Quien busca trabajo nunca paga.</li>
          <li>Las empresas que publican vacantes no pueden pagar, así que nadie puede comprar un resultado.</li>
        </ul>
        <p className="mt-2 text-base leading-snug text-gray-600">
          Hoy todavía no tenemos patrocinadores: Lupa es gratis y funciona con herramientas gratuitas.
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
