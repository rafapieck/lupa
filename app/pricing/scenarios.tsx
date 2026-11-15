"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { savePending } from "@/lib/pricing/pending";
import { SCENARIO_COLUMNS, rowToRaw, toInsertRow, type ScenarioRow } from "@/lib/pricing/scenario-row";
import { SCENARIO_NAME_MAX, validateInputs, validateScenarioName } from "@/lib/pricing/simulate";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { SIMULATOR_PATH } from "./tiers";
import { toRawState, type RawState } from "@/lib/pricing/raw";

export const SIGN_IN_LABEL = "Inicia sesión con Google para guardar";
export const SIGN_OUT_LABEL = "Cerrar sesión";
export const SAVE_LABEL = "Guardar escenario";
export const LIST_TITLE = "Mis escenarios";
export const SAVE_ERROR = "No se pudo guardar. Tus datos siguen en pantalla.";
export const SIGN_IN_ERROR = "No se pudo iniciar sesión. Tus datos siguen en pantalla.";
export const LOAD_LIST_ERROR = "No se pudieron cargar tus escenarios.";
export const DELETE_ERROR = "No se pudo borrar. Intenta de nuevo.";
export const FIX_FIELDS = "Corrige los campos marcados antes de guardar.";
export const UNAVAILABLE = "Guardar escenarios no está disponible en este momento. El simulador funciona igual.";
export const SAVED = "Escenario guardado.";

const dateFmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" });

/** The URL Google sign-in returns to: always this origin's simulator page (the shared Site URL belongs to another app). */
export function redirectTarget(origin: string): string {
  return `${origin}${SIMULATOR_PATH}`;
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
  onLoad,
  openSaveOnArrival,
}: {
  raw: RawState;
  onLoad: (raw: RawState) => void;
  openSaveOnArrival: boolean;
}) {
  // undefined on the server and during hydration, then the browser client (or null without env vars).
  const supabase = useSyncExternalStore<SupabaseClient | null | undefined>(noopSubscribe, getBrowserSupabase, () => undefined);
  const [session, setSession] = useState<Session | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [namingState, setNaming] = useState(false);
  const [arrivalHandled, setArrivalHandled] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);

  const userId = session?.user.id ?? null;
  // Came back from sign-in after tapping "Guardar escenario": the name field opens by itself.
  const naming = !!userId && (namingState || (openSaveOnArrival && !arrivalHandled));

  useEffect(() => {
    // One-time read of the URL after an OAuth redirect (external state).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (takeUrlAuthError()) setMessage({ kind: "error", text: SIGN_IN_ERROR });
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) clearSignedOutState();
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  // Signed out: nothing from the previous user stays on screen (PACKET §12c #10).
  function clearSignedOutState() {
    setScenarios([]);
    setNaming(false);
    setConfirmingId(null);
  }

  const refresh = useCallback(async () => {
    if (!supabase || !userId) return;
    const { data, error } = await supabase
      .from("scenarios")
      .select(SCENARIO_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) {
      setMessage({ kind: "error", text: LOAD_LIST_ERROR });
      return;
    }
    setScenarios((data ?? []) as unknown as ScenarioRow[]);
  }, [supabase, userId]);

  // Signed in: fetch own rows (setState happens after the network call).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is set after the fetch resolves
    if (userId) void refresh();
  }, [userId, refresh]);

  useEffect(() => {
    if (naming) nameInput.current?.focus();
  }, [naming]);

  async function signIn(wantsSave: boolean) {
    if (!supabase) return;
    setMessage(null);
    savePending({ raw, wantsSave });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTarget(window.location.origin) },
    });
    if (error) setMessage({ kind: "error", text: SIGN_IN_ERROR });
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    clearSignedOutState();
    setMessage(null);
  }

  function startSave() {
    setMessage(null);
    if (!userId) {
      void signIn(true);
      return;
    }
    setNaming(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !userId || busy) return;
    const n = validateScenarioName(name);
    if (!n.ok) {
      setNameError(n.error);
      return;
    }
    setNameError(null);
    const v = validateInputs(raw);
    if (!v.ok) {
      setMessage({ kind: "error", text: FIX_FIELDS });
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("scenarios").insert(toInsertRow(n.name, v.values));
    setBusy(false);
    if (error) {
      setMessage({ kind: "error", text: SAVE_ERROR });
      return;
    }
    setNaming(false);
    setArrivalHandled(true);
    setName("");
    setMessage({ kind: "ok", text: SAVED });
    await refresh();
  }

  function load(row: ScenarioRow) {
    setMessage(null);
    onLoad(toRawState(rowToRaw(row)));
  }

  async function remove(id: string) {
    if (!supabase || busy) return;
    setBusy(true);
    const { error } = await supabase.from("scenarios").delete().eq("id", id);
    setBusy(false);
    setConfirmingId(null);
    if (error) {
      setMessage({ kind: "error", text: DELETE_ERROR });
      return;
    }
    await refresh();
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
      <button
        type="button"
        onClick={startSave}
        className="w-full rounded-xl bg-slate-900 py-4 text-center text-xl font-semibold text-white active:bg-slate-800"
      >
        {SAVE_LABEL}
      </button>

      {!userId ? (
        <button
          type="button"
          onClick={() => signIn(false)}
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
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={message.kind === "error" ? "text-base font-medium text-red-700" : "text-base font-medium text-green-800"}
        >
          {message.text}
        </p>
      )}

      {userId && naming && (
        <form onSubmit={save} className="flex flex-col gap-2 rounded-2xl bg-gray-100 p-4">
          <label htmlFor="scenario-name" className="text-lg font-medium text-gray-900">
            Nombre del escenario
          </label>
          <input
            ref={nameInput}
            id="scenario-name"
            name="scenario-name"
            type="text"
            maxLength={SCENARIO_NAME_MAX + 20}
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={nameError ? true : undefined}
            className="rounded-xl border-2 border-gray-300 bg-white px-3 py-3 text-lg"
          />
          {nameError && <p className="text-base font-medium text-red-700">{nameError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-slate-900 py-3 text-lg font-semibold text-white disabled:opacity-60"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setNaming(false);
                setArrivalHandled(true);
                setNameError(null);
              }}
              className="flex-1 rounded-xl border-2 border-gray-300 bg-white py-3 text-lg font-semibold text-gray-900"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {userId && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold text-gray-900">{LIST_TITLE}</h3>
          {(userId ? scenarios : []).length === 0 ? (
            <p className="text-base text-gray-600">Todavía no guardas ningún escenario.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {scenarios.map((s) => (
                <li key={s.id} className="rounded-xl border border-gray-300 bg-white p-3" data-scenario={s.id}>
                  <p className="text-lg font-semibold break-words text-gray-900">{s.name}</p>
                  <p className="text-sm text-gray-600">{dateFmt.format(new Date(s.created_at))}</p>
                  {confirmingId === s.id ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <p className="text-base text-gray-900">¿Borrar este escenario? No se puede deshacer.</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => remove(s.id)}
                          className="flex-1 rounded-xl bg-red-700 py-3 text-lg font-semibold text-white disabled:opacity-60"
                        >
                          Sí, borrar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="flex-1 rounded-xl border-2 border-gray-300 bg-white py-3 text-lg font-semibold text-gray-900"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => load(s)}
                        className="flex-1 rounded-xl border-2 border-blue-700 bg-white py-3 text-lg font-semibold text-blue-700"
                      >
                        Cargar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(s.id)}
                        className="flex-1 rounded-xl border-2 border-gray-300 bg-white py-3 text-lg font-semibold text-gray-900"
                      >
                        Borrar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
