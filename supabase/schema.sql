-- Lupa: verified fraud patterns (public, read-only).
-- Run this first in the Supabase SQL editor, then run seed.sql.

create table if not exists public.fraud_patterns (
  id           text primary key,
  signal       text not null unique,
  weight       int  not null check (weight between 0 and 10),
  label_es     text not null,
  next_step_es text not null,
  source       text not null
);

-- Row Level Security ON: with no other policies, nobody can insert,
-- update or delete through the public API. Patterns are loaded only from
-- the SQL editor (seed.sql).
alter table public.fraud_patterns enable row level security;

drop policy if exists "anon can read fraud patterns" on public.fraud_patterns;
create policy "anon can read fraud patterns"
  on public.fraud_patterns
  for select
  to anon
  using (true);
