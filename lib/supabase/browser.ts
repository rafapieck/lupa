import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client, used only on /pricing for Google sign-in and the
// user's own scenarios. Reads the public URL and anon key (never the
// service-role key). Every query runs with the user's session, so RLS applies.
// PKCE flow: on the way back from Google, ?code= is exchanged for a session
// and removed from the URL by supabase-js itself.

let client: SupabaseClient | null | undefined;

export function getBrowserSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (typeof window === "undefined" || !url || !key) return null;
  client = createClient(url, key, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

/** Tests only. */
export function __setBrowserSupabaseForTests(c: SupabaseClient | null | undefined) {
  client = c;
}
