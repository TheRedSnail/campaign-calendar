-- Per-account brand + region scope (in addition to SBU/country). Empty array = no
-- restriction on that dimension, so existing accounts keep their current visibility.
alter table public.profiles
  add column if not exists brands  text[] not null default '{}',
  add column if not exists regions text[] not null default '{}';

create or replace function public.auth_brands() returns text[]
  language sql stable security definer set search_path = public as $$
  select coalesce(brands,'{}') from public.profiles where id = auth.uid()
$$;
create or replace function public.auth_regions() returns text[]
  language sql stable security definer set search_path = public as $$
  select coalesce(regions,'{}') from public.profiles where id = auth.uid()
$$;
grant execute on function public.auth_brands()  to authenticated;
grant execute on function public.auth_regions() to authenticated;

-- Extend campaign visibility with the optional brand + region scope (empty = allow all).
drop policy campaigns_select on public.campaigns;
create policy campaigns_select on public.campaigns
  for select to authenticated
  using (
    public.can_see_campaign(sbu, country)
    and (cardinality(public.auth_brands())  = 0 or brand   = any(public.auth_brands()))
    and (cardinality(public.auth_regions()) = 0 or regions && public.auth_regions())
  );
