import Link from "next/link";

export const NAV = [
  { href: "/", label: "Revisar oferta" },
  { href: "/product", label: "Cómo funciona" },
  { href: "/about", label: "Nosotros" },
] as const;

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav
        aria-label="Principal"
        className="mx-auto flex w-full max-w-md flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3"
      >
        <Link href="/" className="mr-auto text-xl font-bold tracking-tight">
          Lupa 🔍
        </Link>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="py-1 text-base font-medium text-blue-700 underline-offset-4 hover:underline"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
