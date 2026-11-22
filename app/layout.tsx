import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";
import SourceCapture from "./source-capture";

export const metadata: Metadata = {
  title: "Lupa 🔍 — Revisa si una oferta de trabajo tiene señales de fraude",
  // PACKET §3b: starts with the user's moment, promises signals (not "real or
  // fake") and names the trust reason (official alerts).
  description:
    "¿Te piden dinero antes de contratarte? Pega la oferta y ve qué señales de fraude tiene y de qué alerta oficial viene cada una.",
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
        <SourceCapture />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
