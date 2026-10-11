"use client";

import { useState } from "react";

export default function CheckForm() {
  const [text, setText] = useState("");

  return (
    <div className="flex flex-1 flex-col">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Lupa 🔍</h1>
        <p className="mt-3 text-xl text-gray-700">
          ¿Esta oferta de trabajo es real?
        </p>
      </header>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="offer" className="sr-only">
          Texto de la oferta
        </label>
        <textarea
          id="offer"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pega aquí el texto de la oferta…"
          rows={8}
          className="h-[38vh] min-h-40 w-full resize-none rounded-xl border-2 border-blue-700 p-4 text-lg leading-snug outline-none focus:ring-4 focus:ring-blue-200"
        />
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
