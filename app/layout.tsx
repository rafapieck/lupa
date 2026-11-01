import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

export const metadata: Metadata = {
  title: "Lupa 🔍 — Revisa si una oferta de trabajo tiene señales de fraude",
  description:
    "Pega una oferta de trabajo y Lupa te dice si tiene señales de fraude.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
