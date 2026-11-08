-- Lupa Week 13 bug fix: mark checks made with the built-in example offer, so
-- demos and tests never count as real users (North Star, pause rate).
-- Run after events.sql. Safe to re-run.

alter table public.checks
  add column if not exists example boolean not null default false;

revoke all on public.checks from anon, authenticated;
grant insert (id, verdict, score, pattern_ids, simulated, repeat_visit, example) on public.checks to anon;

-- North Star counts real checks only.
create or replace function public.checks_this_week()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.checks
   where created_at >= now() - interval '7 days'
     and not example;
$$;

revoke all on function public.checks_this_week() from public;
grant execute on function public.checks_this_week() to anon;

-- Checks saved before this fix: the example offer scores exactly like this.
-- Not run automatically; run it by hand if you want to clean old demo rows:
--   update public.checks set example = true where <your condition>;
