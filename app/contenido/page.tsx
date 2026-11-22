import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CONTENT_CTA, CONTENT_CTA_HREF, CONTENT_TITLE, PROMISE_LINE, SERIES } from "./content";

export const metadata: Metadata = {
  title: `${CONTENT_TITLE} — Lupa 🔍`,
  description: PROMISE_LINE,
};

export default function ContenidoPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-6 pb-4">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">{CONTENT_TITLE}</h1>
        <p className="mt-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-lg leading-snug font-semibold text-gray-900">
          {PROMISE_LINE}
        </p>
      </header>

      {SERIES.map((s) => (
        <section key={s.id} data-series={s.id} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5">
          <h2 className="text-2xl font-bold text-gray-900">{s.title}</h2>
          <p className="text-lg leading-snug text-gray-800">{s.purpose}</p>
          <p className="text-sm text-gray-600">{s.format}</p>

          <figure className="flex flex-col gap-2">
            {/* Lupa draws these itself (PNG under 150 KB, cached a day); no resizing needed. */}
            <Image
              src={s.finished.src}
              width={s.finished.width}
              height={s.finished.height}
              alt={s.finished.alt}
              loading="lazy"
              unoptimized
              className="h-auto w-full rounded-lg ring-1 ring-black/10"
            />
            <figcaption className="text-base font-semibold text-gray-900">
              {s.finished.name}
              {s.finished.note && (
                <span className="ml-2 inline-block rounded bg-gray-200 px-2 text-sm font-medium text-gray-700">
                  {s.finished.note}
                </span>
              )}
            </figcaption>
          </figure>

          <div className="rounded-xl bg-gray-100 px-4 py-3">
            <p className="text-sm font-semibold tracking-wide text-gray-600 uppercase">Boceto</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{s.sketch.name}</p>
            {s.sketch.lines.map((line) => (
              <p key={line} className="mt-1 text-base leading-snug text-gray-800">
                {line}
              </p>
            ))}
          </div>
        </section>
      ))}

      <Link
        href={CONTENT_CTA_HREF}
        className="w-full rounded-full bg-blue-700 py-4 text-center text-xl font-semibold text-white active:bg-blue-800"
      >
        {CONTENT_CTA}
      </Link>
    </main>
  );
}
