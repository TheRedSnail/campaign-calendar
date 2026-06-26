-- Make region-based scoping real: assigning a user a region now expands their visibility to
-- every country mapped to that region (via the new countries.region_id), and the 'Global'
-- region value (or is_global) sees all. Previously profile.regions only matched campaigns by
-- exact string overlap against campaign.regions, so a user scoped to "Regional – Western
-- Europe" could not see a campaign whose country was "Germany". Empty scope still = no
-- restriction, so owner/coordinator with no region scope are unaffected.

-- Member country names for a set of region names (SECURITY DEFINER bypasses table RLS).
create or replace function public.region_member_countries(region_names text[]) returns text[]
  language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(c.name), '{}')
  from public.countries c
  join public.regions r on r.id = c.region_id
  where r.name = any(region_names)
$$;

-- The full set of countries the current user can see: their explicit countries plus every
-- country expanded from their region scope.
create or replace function public.auth_visible_countries() returns text[]
  language sql stable security definer set search_path = public as $$
  select public.auth_countries() || public.region_member_countries(public.auth_regions())
$$;

-- "Sees everything" — run_team global flag, or the 'Global' sentinel in their region scope.
create or replace function public.auth_sees_all() returns boolean
  language sql stable security definer set search_path = public as $$
  select public.auth_is_global() or 'Global' = any(public.auth_regions())
$$;

grant execute on function public.region_member_countries(text[]) to authenticated;
grant execute on function public.auth_visible_countries()        to authenticated;
grant execute on function public.auth_sees_all()                 to authenticated;

-- run_team country check now uses the region-expanded set (keeps direct-country matches too).
create or replace function public.can_see_campaign(c_sbu text, c_country text) returns boolean
  language sql stable security definer set search_path = public as $$
  select case public.auth_role()
    when 'admin'                 then true
    when 'campaign_owner'        then c_sbu = any(public.auth_sbus())
    when 'campaign_coordinator'  then c_sbu = any(public.auth_sbus())
    when 'run_team'              then public.auth_sees_all() or c_country = any(public.auth_visible_countries())
    else false
  end
$$;

-- Optional brand + region filter for the SELECT policy. The region clause now also passes a
-- campaign whose country falls inside the user's region scope (region → countries), in
-- addition to the legacy targeting-array overlap. 'Global'/is_global short-circuits.
drop policy campaigns_select on public.campaigns;
create policy campaigns_select on public.campaigns
  for select to authenticated
  using (
    public.can_see_campaign(sbu, country)
    and (cardinality(public.auth_brands()) = 0 or brand = any(public.auth_brands()))
    and (
      cardinality(public.auth_regions()) = 0
      or public.auth_sees_all()
      or regions && public.auth_regions()
      or country = any(public.auth_visible_countries())
    )
  );
