"use client";

import { useRef } from "react";
import { sendEvent } from "@/lib/send-event";
import { WA_BUTTON, WA_NOTE, whatsappUrl } from "@/lib/share";

/**
 * 🔴/🟡 only (the parent decides). Opens WhatsApp with a fixed message and the
 * /s/ card link. Logs one anonymous `shared` event per result.
 */
export default function ShareWhatsApp({ path, checkId }: { path: string; checkId?: string | null }) {
  const reported = useRef(false);

  function handleClick() {
    if (reported.current) return;
    reported.current = true;
    sendEvent(checkId, "shared");
  }

  return (
    <div className="flex flex-col gap-2">
      <a
        href={whatsappUrl(path)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        data-testid="share-whatsapp"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-green-700 py-4 text-center text-xl font-semibold text-white active:bg-green-800"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-6 fill-none stroke-current stroke-2">
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {WA_BUTTON}
      </a>
      <p className="text-center text-base leading-snug text-gray-600">{WA_NOTE}</p>
    </div>
  );
}
