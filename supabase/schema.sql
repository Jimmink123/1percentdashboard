-- Run once in Supabase Studio -> SQL Editor for a fresh project.
-- Creates the `leads` table this dashboard reads from, with the RLS
-- policies both the dashboard (read) and the landing page popup (insert)
-- need, and enables Realtime so new leads appear live with no refresh.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  source text,
  campaign text,
  ad text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Allow anon read access"
on public.leads
for select
to anon
using (true);

create policy "Allow anon insert"
on public.leads
for insert
to anon
with check (true);

alter publication supabase_realtime add table public.leads;
