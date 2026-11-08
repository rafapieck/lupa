-- Lupa Week 13: anonymous event log (what people DO after a verdict).
-- Run after checks.sql. Safe to re-run: every statement is idempotent.
-- Still no offer text, IP, user agent, cookie or anything about the user.

-- 1) checks: server-generated id is now inserted (so events can point to it),
--    plus a yes/no "this browser had checked before" flag.
alter table public.checks
  add column if not exists repeat_visit boolean not null default false;

revoke all on public.checks from anon, authenticated;
grant insert (id, verdict, score, pattern_ids, simulated, repeat_visit) on public.checks to anon;
-- created_at stays default-only, so nobody can backdate a check.

-- 2) check_events: insert-only, fixed vocab, linked to one check.
create table if not exists public.check_events (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  check_id   uuid        not null references public.checks(id) on delete cascade,
  kind       text        not null check (kind in ('reply_copied', 'intent')),
  answer     text        null check (answer is null or answer in ('no_pay', 'verify', 'continue', 'already_paid')),
  constraint check_events_answer_matches_kind check (
    (kind = 'intent' and answer is not null) or (kind = 'reply_copied' and answer is null)
  )
);

create index if not exists check_events_check_id_idx on public.check_events (check_id);

alter table public.check_events enable row level security;

drop policy if exists "anon can insert events" on public.check_events;
create policy "anon can insert events"
  on public.check_events
  for insert
  to anon
  with check (true);

revoke all on public.check_events from anon, authenticated;
grant insert (check_id, kind, answer) on public.check_events to anon;

-- Founder queries (run in the SQL editor, never exposed to the public API):
--
-- Pause rate on checks that matched a money pattern:
--   select e.answer, count(*) from public.check_events e
--     join public.checks c on c.id = e.check_id
--    where e.kind = 'intent' and c.pattern_ids && array['upfront_payment']
--    group by e.answer;
--
-- Replies copied per red/yellow check:
--   select c.verdict, count(distinct c.id) as checks,
--          count(e.id) filter (where e.kind = 'reply_copied') as copies
--     from public.checks c left join public.check_events e on e.check_id = c.id
--    where c.verdict in ('red', 'yellow') group by c.verdict;
--
-- Share of checks from browsers that had checked before:
--   select repeat_visit, count(*) from public.checks group by repeat_visit;
