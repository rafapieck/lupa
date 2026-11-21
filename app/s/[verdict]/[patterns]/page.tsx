import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SHARE_CTA, SHARE_CTA_HREF, SHARE_NOTE, parseShare, type ShareVerdict } from "@/lib/share";

type Params = { verdict: string; patterns: string };

// Block on the server instead of streaming: link-preview crawlers need the
// real 404 status and the og: tags in the first response, and the page only
// reads its own URL params (no data fetch).
export const instant = false;

const THEME: Record<ShareVerdict, { badge: string; title: string }> = {
  red: { badge: "bg-red-700 text-white", title: "text-red-800" },
  yellow: { badge: "bg-amber-300 text-gray-900", title: "text-amber-800" },
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { verdict, patterns } = await params;
  const card = parseShare(verdict, patterns);
  if (!card) return {};
  const title = `Aviso de Lupa: ${card.verdictLabel}`;
  const description = card.patterns.map((p) => p.label_es).join(" · ");
  return {
    title,
    description,
    // Share links are for people, not search engines.
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", locale: "es_MX", siteName: "Lupa" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharePage({ params }: { params: Promise<Params> }) {
  const { verdict, patterns } = await params;
  const card = parseShare(verdict, patterns);
  if (!card) notFound();
  const theme = THEME[card.verdict];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-6 pb-4">
      <p className="text-sm font-bold tracking-wide text-amber-700">AVISO COMPARTIDO DESDE LUPA</p>
      <h1 className="sr-only">Aviso de Lupa: {card.verdictLabel}</h1>
      <div className={`${theme.badge} self-start rounded-full px-6 py-3 text-2xl font-bold`} data-testid="badge">
        {card.verdictLabel}
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5">
        <h2 className={`text-xl font-bold ${theme.title}`}>Señales de alerta encontradas</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {card.patterns.map((p) => (
            <li key={p.id} className="flex gap-3" data-pattern={p.id}>
              <span className={`${theme.title} text-xl leading-7`} aria-hidden>
                ⚠
              </span>
              <div>
                <p className="text-lg leading-snug text-gray-900">{p.label_es}</p>
                <p className="mt-0.5 text-sm text-gray-500">Fuente: {p.source}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-amber-100 p-5 ring-1 ring-amber-200">
        <h2 className="text-lg font-semibold text-gray-900">Qué hacer ahora</h2>
        <p className="mt-1 text-xl leading-snug font-bold text-gray-900">{card.nextStep}</p>
      </section>

      <Link
        href={SHARE_CTA_HREF}
        className="w-full rounded-full bg-blue-700 py-4 text-center text-xl font-semibold text-white active:bg-blue-800"
      >
        {SHARE_CTA}
      </Link>
      <p className="text-center text-base leading-snug text-gray-600">{SHARE_NOTE}</p>
    </main>
  );
}
