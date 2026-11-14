import type { Metadata } from "next";
import { NEVER_PAYWALLED, PRICES_NOTE, PRICING_SUBTITLE, PRICING_TITLE, SOON_LABEL, TIERS } from "./tiers";

export const metadata: Metadata = {
  title: "Precios — Lupa 🔍",
  description: PRICING_SUBTITLE,
};

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-6 pb-4">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">{PRICING_TITLE}</h1>
        <p className="mt-2 text-lg leading-snug text-gray-800">{PRICING_SUBTITLE}</p>
      </header>

      <section aria-label="Planes" className="flex flex-col gap-3">
        {TIERS.map((tier) => (
          <article
            key={tier.id}
            data-tier={tier.id}
            className={
              tier.recommended
                ? "rounded-2xl border-2 border-amber-400 bg-amber-50 p-5"
                : "rounded-2xl border border-gray-300 bg-white p-5"
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                {tier.name} · {tier.price}
              </h2>
              <span
                className={
                  tier.recommended
                    ? "rounded-full bg-amber-200 px-3 py-1 text-sm font-medium text-amber-950"
                    : "rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800"
                }
              >
                {tier.tag}
              </span>
            </div>
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-6 text-lg leading-snug text-gray-800">
              {tier.features.map((f) => (
                <li key={f.text}>
                  {f.text}
                  {f.soon && (
                    <span className="ml-2 inline-block rounded bg-gray-200 px-2 text-sm font-medium whitespace-nowrap text-gray-700">
                      {SOON_LABEL}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-base leading-snug text-gray-600">{tier.freeNote}</p>
          </article>
        ))}
      </section>

      <div className="flex flex-col gap-3">
        <p className="text-base text-gray-600">{PRICES_NOTE}</p>
        <p className="rounded-xl bg-gray-100 px-4 py-3 text-lg leading-snug font-medium text-gray-900">
          <span aria-hidden="true">🔓 </span>
          {NEVER_PAYWALLED}
        </p>
        <p className="text-base leading-snug text-gray-600">
          Lo marcado “{SOON_LABEL}” todavía no está disponible. Hoy no cobramos: estos precios son nuestra propuesta
          para instituciones.
        </p>
      </div>
    </main>
  );
}
