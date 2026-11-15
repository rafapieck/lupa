// Test helper: a minimal fake of the Supabase browser client used on /pricing.
// Not imported by app code.
import { vi } from "vitest";

type Row = Record<string, unknown>;
type Session = { user: { id: string; email: string } } | null;

export function makeFakeSupabase(opts: { session?: Session; rows?: Row[]; insertError?: boolean; selectError?: boolean } = {}) {
  let session: Session = opts.session ?? null;
  let listener: ((event: string, s: Session) => void) | null = null;
  const rows: Row[] = [...(opts.rows ?? [])];

  const calls = {
    insert: [] as Row[],
    deleteIds: [] as string[],
    selects: 0,
  };

  // vi.fn records the call arguments, so the mock itself takes none.
  const signInWithOAuth = vi.fn(async () => ({ data: {}, error: null }));
  const signOut = vi.fn(async () => {
    session = null;
    listener?.("SIGNED_OUT", null);
    return { error: null };
  });

  const client = {
    auth: {
      getSession: vi.fn(async () => ({ data: { session } })),
      onAuthStateChange: vi.fn((cb: (event: string, s: Session) => void) => {
        listener = cb;
        return { data: { subscription: { unsubscribe: () => (listener = null) } } };
      }),
      signInWithOAuth,
      signOut,
    },
    from: vi.fn(() => ({
      select: () => ({
        order: async () => {
          calls.selects++;
          if (opts.selectError) return { data: null, error: { message: "boom" } };
          return { data: [...rows], error: null };
        },
      }),
      insert: async (row: Row) => {
        calls.insert.push(row);
        if (opts.insertError) return { error: { message: "boom" } };
        rows.unshift({ id: `id-${rows.length + 1}`, created_at: "2026-11-15T12:00:00Z", ...row });
        return { error: null };
      },
      delete: () => ({
        eq: async (_col: string, id: string) => {
          calls.deleteIds.push(id);
          const i = rows.findIndex((r) => r.id === id);
          if (i >= 0) rows.splice(i, 1);
          return { error: null };
        },
      }),
    })),
  };

  return { client, calls, signInWithOAuth, signOut, rows };
}
