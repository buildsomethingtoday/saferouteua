-- Visit tracking: one row per session visit, anonymous inserts only.
create table if not exists public.site_visits (
  id bigint generated always as identity primary key,
  visited_at timestamptz not null default now(),
  path text,
  language text
);

alter table public.site_visits enable row level security;

-- Anyone may record a visit; nobody (anon) may read them back.
create policy "Allow anonymous visit inserts"
  on public.site_visits
  for insert
  to anon
  with check (true);
