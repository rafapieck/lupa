-- Lupa: saved checks (the North Star) — insert-only, no offer text, no user data.
-- Run after schema.sql and seed.sql (pattern_ids must exist in fraud_patterns).
-- Safe to re-run: every statement is idempotent.

create table if not exists public.checks (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  verdict     text        not null check (verdict in ('green', 'yellow', 'red')),
  score       int         not null check (score between 0 and 100),
  pattern_ids text[]      not null default '{}',
  simulated   boolean     not null default false
);
-- No column holds the offer text, an IP, a user agent or anything about the user.

-- Row Level Security ON. The only policy lets anon INSERT. There are no
-- SELECT, UPDATE or DELETE policies, so the public API can never read,
-- change or delete a check.
alter table public.checks enable row level security;

drop policy if exists "anon can insert checks" on public.checks;
create policy "anon can insert checks"
  on public.checks
  for insert
  to anon
  with check (true);

-- Defense in depth on top of RLS: anon may only insert, and only the four
-- data columns. id and created_at always come from the defaults, so nobody
-- can backdate or future-date a check to game checks_this_week().
revoke all on public.checks from anon, authenticated;
grant insert (verdict, score, pattern_ids, simulated) on public.checks to anon;

-- Reject any pattern_ids value that is not a real fraud_patterns.id.
create or replace function public.checks_validate_pattern_ids()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bad text;
begin
  select p into bad
    from unnest(new.pattern_ids) as p
   where p is null
      or not exists (select 1 from public.fraud_patterns f where f.id = p)
   limit 1;
  if found then
    raise exception 'checks.pattern_ids: unknown pattern id %', coalesce(bad, 'NULL')
      using errcode = '23503';
  end if;
  return new;
end;
$$;

revoke all on function public.checks_validate_pattern_ids() from public, anon, authenticated;

drop trigger if exists checks_validate_pattern_ids on public.checks;
create trigger checks_validate_pattern_ids
  before insert on public.checks
  for each row
  execute function public.checks_validate_pattern_ids();

-- North Star: checks in the last 7 days. Returns one number, never rows.
create or replace function public.checks_this_week()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.checks where created_at >= now() - interval '7 days';
$$;

revoke all on function public.checks_this_week() from public;
grant execute on function public.checks_this_week() to anon;
