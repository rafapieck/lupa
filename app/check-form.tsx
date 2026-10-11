"use client";

import { useState } from "react";
import { MAX_CHARS, validateOffer } from "@/lib/validate";
import ResultView, { type CheckResult } from "./result-view";

// Invented offer 1 from docs/PACKET.md — sample data, not a real offer.
const EXAMPLE_OFFER =
  "Vacante en tienda, $35,000 al mes, sin experiencia, contratación HOY. Solo deposita $450 para tu uniforme.";

const NETWORK_ERROR = "No pudimos revisar la oferta. Revisa tu conexión e intenta de nuevo.";

export default function CheckForm() {
  const [text, setText] = useState("");
  const [isExample, setIsExample] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const validation = validateOffer(text);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: validation.text }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.verdict) {
        setError(data?.error ?? NETWORK_ERROR);
        return;
      }
      setResult(data as CheckResult);
      window.scrollTo(0, 0);
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setText("");
    setIsExample(false);
    setError(null);
    window.scrollTo(0, 0);
  }

  if (result) {
    return <ResultView result={result} isExample={isExample} onReset={reset} />;
  }

  return (
    <div className="flex flex-1 flex-col px-5 pt-10 pb-6">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Lupa 🔍</h1>
        <p className="mt-3 text-xl text-gray-700">¿Esta oferta de trabajo es real?</p>
      </header>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <label htmlFor="offer" className="sr-only">
          Texto de la oferta
        </label>
        <textarea
          id="offer"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setIsExample(false);
            if (error) setError(null);
          }}
          placeholder="Pega aquí el texto de la oferta…"
          rows={8}
          disabled={loading}
          aria-invalid={error ? true : undefined}
          aria-describedby="offer-help"
          className="h-[38vh] min-h-40 w-full resize-none rounded-xl border-2 border-blue-700 p-4 text-lg leading-snug outline-none focus:ring-4 focus:ring-blue-200 disabled:bg-gray-50"
        />
        <div id="offer-help" className="-mt-2 flex justify-between gap-3 text-base">
          <p role="alert" className="font-medium text-red-700">
            {error ?? (isExample ? <span className="font-normal text-gray-600">Datos de ejemplo (oferta inventada)</span> : null)}
          </p>
          <p className={text.length > MAX_CHARS ? "text-red-700" : "text-gray-500"}>
            {text.length}/{MAX_CHARS}
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-blue-700 py-4 text-xl font-semibold text-white active:bg-blue-800 disabled:bg-blue-400"
        >
          {loading ? "Revisando…" : "Revisar oferta"}
        </button>
        <button
          type="button"
          onClick={() => {
            setText(EXAMPLE_OFFER);
            setIsExample(true);
            setError(null);
          }}
          disabled={loading}
          className="self-center py-1 text-base text-blue-700 underline underline-offset-4"
        >
          Probar con un ejemplo
        </button>
      </form>

      <footer className="mt-auto pt-8 text-center text-base text-gray-600">No guardamos lo que pegas.</footer>
    </div>
  );
}
