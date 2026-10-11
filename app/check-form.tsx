"use client";

import { useState } from "react";
import { MAX_CHARS, validateOffer } from "@/lib/validate";

export default function CheckForm() {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateOffer(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Lupa 🔍</h1>
        <p className="mt-3 text-xl text-gray-700">
          ¿Esta oferta de trabajo es real?
        </p>
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
            if (error) setError(null);
          }}
          placeholder="Pega aquí el texto de la oferta…"
          rows={8}
          aria-invalid={error ? true : undefined}
          aria-describedby="offer-help"
          className="h-[38vh] min-h-40 w-full resize-none rounded-xl border-2 border-blue-700 p-4 text-lg leading-snug outline-none focus:ring-4 focus:ring-blue-200"
        />
        <div id="offer-help" className="-mt-2 flex justify-between gap-3 text-base">
          <p role="alert" className="font-medium text-red-700">
            {error}
          </p>
          <p className={text.length > MAX_CHARS ? "text-red-700" : "text-gray-500"}>
            {text.length}/{MAX_CHARS}
          </p>
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-blue-700 py-4 text-xl font-semibold text-white active:bg-blue-800"
        >
          Revisar oferta
        </button>
      </form>

      <footer className="mt-auto pt-8 text-center text-base text-gray-600">
        No guardamos lo que pegas.
      </footer>
    </div>
  );
}
