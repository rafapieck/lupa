import Link from "next/link";

// PACKET Appendix A (10:1 memo), translated to Spanish (Mexico).
// Source links from Rafael (2026-11-15): news reports of the FTC and Consejo Ciudadano figures.

export const MEMO_TITLE = "Por qué Lupa es gratis para quien busca trabajo, y por qué paga una institución";
export const FX_LABEL = "tipo de cambio supuesto";

export const SOURCES = {
  ftc: {
    label: "Fuente: FTC, reportes del cuarto trimestre de 2025 (vía KJRH)",
    href: "https://www.kjrh.com/money/consumer/job-recruitment-scams-could-cost-job-seekers-thousands-of-dollars",
  },
  consejo: {
    label: "Fuente: Consejo Ciudadano, 5° Reporte de Trata de Personas (vía Expansión Política)",
    href: "https://politica.expansion.mx/cdmx/2026/04/20/3-de-10-victimas-trata-de-personas-ofertas-de-empleo-falsas",
  },
} as const;

function Source({ id }: { id: keyof typeof SOURCES }) {
  const s = SOURCES[id];
  return (
    <a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      className="ml-1 text-sm text-gray-600 underline underline-offset-2"
    >
      ({s.label})
    </a>
  );
}

export default function TenToOneMemo() {
  return (
    <section aria-labelledby="memo-title" className="flex flex-col gap-3">
      <h2 id="memo-title" className="text-2xl font-bold text-gray-900">
        {MEMO_TITLE}
      </h2>
      <p className="text-lg leading-snug text-gray-800">
        Lupa sigue una sola regla para sus precios: quien la usa debe recibir unas diez veces más valor de lo que le
        cuesta.
      </p>

      <h3 className="text-xl font-semibold text-gray-900">Para quien busca trabajo, la cuenta ni se acerca</h3>
      <p className="text-lg leading-snug text-gray-800">
        Lupa cuesta $0 y unos 30 segundos. Del otro lado está el pago por adelantado que pide un reclutador falso. En
        Estados Unidos, la FTC (Comisión Federal de Comercio) reporta una pérdida mediana de unos US$2,000 por víctima
        de estafas de empleo
        <Source id="ftc" />, unos $36,000 MXN si cada dólar vale $18 MXN
        <span className="ml-1 text-sm whitespace-nowrap text-gray-500">({FX_LABEL})</span>.
      </p>
      <p className="text-lg leading-snug text-gray-800">
        Luego están sus documentos: una INE o una CURP enviada a un desconocido puede usarse para fraudes mucho después
        de que el trabajo falso desaparece. Y está su integridad física: el Consejo Ciudadano reporta que cerca del 30%
        de las personas captadas para explotación llegan por ofertas de trabajo falsas
        <Source id="consejo" />.
      </p>
      <p className="text-lg leading-snug text-gray-800">
        Frente a esos costos, cualquier precio que le cobráramos a quien busca trabajo solo lo alejaría de revisar. Por
        eso revisar una oferta es gratis, en todos los planes, para siempre.
      </p>

      <h3 className="text-xl font-semibold text-gray-900">Para una institución, la cuenta sale con una sola persona</h3>
      <p className="text-lg leading-snug text-gray-800">
        Una bolsa de trabajo universitaria o municipal paga $24,000 MXN al año por el plan Campus. Lo que pierde la
        víctima típica, según el cálculo de arriba, ya es más que esa licencia. Y eso sin contar lo que no tiene precio:
        alguien que mandó sus documentos, una familia que pagó un &quot;curso de capacitación&quot;, o alguien que fue a
        una cita que no era una entrevista.
      </p>
      <p className="text-lg leading-snug text-gray-800">
        Si Lupa ayuda a una sola persona de esa bolsa a evitar uno de esos casos, la licencia ya se pagó. Cada aviso que
        dé el resto del año es lo que queda de la cuenta.
      </p>

      <h3 className="text-xl font-semibold text-gray-900">Lo que las instituciones no reciben</h3>
      <p className="text-lg leading-snug text-gray-800">
        Nunca reciben los datos de ninguna persona que busca trabajo. Reciben patrones agregados (qué canales, qué tipo
        de ofertas, qué estados) para avisar a su comunidad. Lupa nunca le dice a nadie que una oferta es de fiar: dice
        qué señales de alerta encontró, o que no encontró ninguna.
      </p>

      <p className="text-base leading-snug text-gray-600">
        La cifra de la FTC es de Estados Unidos. El tipo de cambio es un supuesto.
      </p>
      <Link href="/pricing" className="text-lg font-medium text-blue-700 underline underline-offset-4">
        Ver precios para instituciones
      </Link>
    </section>
  );
}
