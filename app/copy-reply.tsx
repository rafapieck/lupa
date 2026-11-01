"use client";

import { useEffect, useRef, useState } from "react";

export const REPLY_TITLE = "Si quieres contestarle, copia esto:";
export const COPY_LABEL = "Copiar mensaje";
export const COPIED_LABEL = "¡Copiado!";
export const COPY_FAILED =
  "No se pudo copiar. Mantén presionado el mensaje para copiarlo.";

/** Copies text with the Clipboard API, falling back to execCommand for older Android browsers. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * The reply is a fixed template from fraud_patterns.reply_es, chosen by the
 * rules in lib/score.ts. The AI never writes it.
 */
export default function CopyReply({ reply }: { reply: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function handleCopy() {
    const ok = await copyText(reply);
    setStatus(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    if (ok) timer.current = setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5">
      <h3 className="text-lg font-semibold text-gray-900">{REPLY_TITLE}</h3>
      <p
        data-testid="reply-text"
        className="mt-2 rounded-xl bg-gray-100 p-4 text-lg leading-snug text-gray-900 select-all"
      >
        {reply}
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className={`mt-3 w-full rounded-full py-4 text-xl font-semibold text-white ${
          status === "copied" ? "bg-green-700" : "bg-blue-700 active:bg-blue-800"
        }`}
      >
        {status === "copied" ? COPIED_LABEL : COPY_LABEL}
      </button>
      <p role="status" className="mt-2 text-center text-base text-gray-600">
        {status === "failed" ? COPY_FAILED : ""}
      </p>
    </section>
  );
}
