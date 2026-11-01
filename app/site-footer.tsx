export const FOOTER_NOTE = "Lo analiza una IA de Google. Lupa no guarda lo que pegas.";

export default function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-md px-5 pt-4 pb-6 text-center text-base text-gray-600">
      {FOOTER_NOTE}
    </footer>
  );
}
