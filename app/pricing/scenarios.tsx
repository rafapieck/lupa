"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState, useSyncExternalStore } from "react";
import { savePending } from "@/lib/pricing/pending";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { RawState } from "@/lib/pricing/raw";

export const SIGN_IN_LABEL = "Inicia sesión con Google para guardar";
export const SIGN_OUT_LABEL = "Cerrar sesión";
export const SIGN_IN_ERROR = "No se pudo iniciar sesión. Tus datos siguen en pantalla.";
export const UNAVAILABLE = "Guardar escenarios no está disponible en este momento. El simulador funciona igual.";

/** The URL Google sign-in returns to: always this origin's /pricing (the shared Site URL belongs to another app). */
export function redirectTarget(origin: string): string {
  return `${origin}/pricing`;
}

/** Strips an OAuth error that Supabase put in the URL; returns true if there was one. */
function takeUrlAuthError(): boolean {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const had = url.searchParams.has("error") || url.searchParams.has("error_description") || hash.has("error");
  if (!had) return false;
  for (const k of ["error", "error_code", "error_description"]) url.searchParams.delete(k);
  url.hash = "";
  window.history.replaceState(window.history.state, "", url.toString());
  return true;
}

const noopSubscribe = () => () => {};

export default function Scenarios({
  raw,
}: {
  raw: RawState;
  onLoad: (raw: RawState) => void;
  openSaveOnArrival: boolean;
}) {
  // undefined on the server and during hydration, then the browser client (or null without env vars).
  const supabase = useSyncExternalStore<SupabaseClient | null | undefined>(noopSubscribe, getBrowserSupabase, () => undefined);
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    // One-time read of the URL after an OAuth redirect (external state).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (takeUrlAuthError()) setMessage(SIGN_IN_ERROR);
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  async function signIn() {
    if (!supabase) return;
    setMessage(null);
    savePending({ raw, wantsSave: false });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTarget(window.location.origin) },
    });
    if (error) setMessage(SIGN_IN_ERROR);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setMessage(null);
  }

  if (supabase === undefined) return null; // first render (server and hydration): nothing yet

  if (supabase === null) {
    return (
      <section aria-label="Escenarios" className="text-base leading-snug text-gray-600">
        {UNAVAILABLE}
      </section>
    );
  }

  return (
    <section aria-label="Escenarios" className="flex flex-col gap-3">
      {!userId ? (
        <button
          type="button"
          onClick={signIn}
          className="w-full rounded-xl border-2 border-gray-300 bg-white py-4 text-center text-lg font-semibold text-gray-900"
        >
          {SIGN_IN_LABEL}
        </button>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 text-base text-gray-600">
          <span className="min-w-0 break-all" data-testid="user-email">
            {session?.user.email}
          </span>
          <button type="button" onClick={signOut} className="py-2 font-medium text-blue-700 underline underline-offset-4">
            {SIGN_OUT_LABEL}
          </button>
        </div>
      )}

      {message && (
        <p role="alert" className="text-base font-medium text-red-700">
          {message}
        </p>
      )}
    </section>
  );
}
