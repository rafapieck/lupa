import Link from "next/link";

export const FOOTER_NOTE = "Lo analiza una IA de Google. Lupa no guarda lo que pegas.";

export const FOOTER_LINKS = [{ href: "/pricing", label: "Precios" }] as const;

export default function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-md flex-col items-center gap-2 px-5 pt-4 pb-6 text-center text-base text-gray-600">
      <p>{FOOTER_NOTE}</p>
      <nav aria-label="Pie de página" className="flex gap-4">
        {FOOTER_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="py-2 font-medium text-blue-700 underline underline-offset-4"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
