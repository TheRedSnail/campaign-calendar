-- Role + status enums
create type app_role as enum ('campaign_owner','campaign_coordinator','run_team','admin');
create type campaign_status as enum ('draft','in_progress','ready','briefed','in_production');

-- Profiles: 1:1 with auth.users. Owner stores one sbu + one country (as single-element
-- arrays so one `= ANY(...)` predicate works for every role); coordinator has many sbus;
-- run_team has many countries (or is_global).
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text not null default '',
  role       app_role not null default 'campaign_owner',
  sbus       text[] not null default '{}',
  countries  text[] not null default '{}',
  is_global  boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- SECURITY DEFINER helpers read profiles as the function owner, bypassing RLS, so policies
-- that call them never re-enter the profiles policies (avoids infinite recursion).
create or replace function public.auth_role() returns app_role
  language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;
create or replace function public.auth_sbus() returns text[]
  language sql stable security definer set search_path = public as $$
  select coalesce(sbus,'{}') from public.profiles where id = auth.uid()
$$;
create or replace function public.auth_countries() returns text[]
  language sql stable security definer set search_path = public as $$
  select coalesce(countries,'{}') from public.profiles where id = auth.uid()
$$;
create or replace function public.auth_is_global() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce(is_global,false) from public.profiles where id = auth.uid()
$$;
create or replace function public.can_see_campaign(c_sbu text, c_country text) returns boolean
  language sql stable security definer set search_path = public as $$
  select case public.auth_role()
    when 'admin'                 then true
    when 'campaign_owner'        then c_sbu = any(public.auth_sbus())
    when 'campaign_coordinator'  then c_sbu = any(public.auth_sbus())
    when 'run_team'              then public.auth_is_global() or c_country = any(public.auth_countries())
    else false
  end
$$;

grant execute on function public.auth_role()                       to authenticated;
grant execute on function public.auth_sbus()                       to authenticated;
grant execute on function public.auth_countries()                  to authenticated;
grant execute on function public.auth_is_global()                  to authenticated;
grant execute on function public.can_see_campaign(text,text)       to authenticated;

-- Profiles policies: self-read for everyone; admins manage all. The admin policy calling
-- auth_role() is safe because that helper is SECURITY DEFINER and bypasses RLS internally.
create policy profiles_self_select on public.profiles
  for select to authenticated using (id = auth.uid());
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');
