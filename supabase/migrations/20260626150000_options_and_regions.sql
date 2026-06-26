-- Admin-managed dropdown values + structured region→country geography.
--
-- Until now every brief dropdown (SBU, brand, …) and the flat region/country list lived as
-- hardcoded constants in src/data/options.ts. These tables move that config into Postgres so
-- an admin can add / rename values from the /admin area, and model regions as groups of
-- countries. Everyone can read (the dropdowns); only admins can write (mirrors profiles RLS).

-- Flat option lists. PK (kind, value) means a value is unique within its list. `active=false`
-- soft-archives a value: it disappears from new-brief dropdowns but stays valid on existing
-- campaigns (hard delete stays a DB-only operation so history can be handled deliberately).
create table public.app_options (
  kind       text not null,
  value      text not null,
  label      text not null default '',
  sort_order int  not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (kind, value)
);
alter table public.app_options enable row level security;

-- Regions are named groups; 'Global' is a sentinel meaning "all countries" and is NOT a row.
create table public.regions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  sort_order int  not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.regions enable row level security;

-- Each country belongs to (at most) one region. on delete set null keeps the country if its
-- region is removed, so it just becomes unassigned rather than disappearing.
create table public.countries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  region_id  uuid references public.regions(id) on delete set null,
  sort_order int  not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.countries enable row level security;
create index countries_region_idx on public.countries (region_id);

-- RLS: any authenticated user reads (needs the dropdowns); admins manage. auth_role() is the
-- SECURITY DEFINER helper from 20260625132328 so these policies never re-enter table RLS.
create policy app_options_select on public.app_options
  for select to authenticated using (true);
create policy app_options_admin_all on public.app_options
  for all to authenticated
  using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

create policy regions_select on public.regions
  for select to authenticated using (true);
create policy regions_admin_all on public.regions
  for all to authenticated
  using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

create policy countries_select on public.countries
  for select to authenticated using (true);
create policy countries_admin_all on public.countries
  for all to authenticated
  using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');
