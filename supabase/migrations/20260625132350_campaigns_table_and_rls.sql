create table public.campaigns (
  id            uuid primary key default gen_random_uuid(),
  created_by    uuid default auth.uid() references auth.users(id) on delete set null,
  name          text not null default '',
  brand         text not null default 'Loctite',
  sbu           text not null default '',
  country       text not null default '',          -- scoping + owner preselect
  status        campaign_status not null default 'draft',
  progress      int not null default 0,
  start_date    date,
  end_date      date,
  campaign_type text not null default '',
  priority      text not null default '',
  language      text not null default '',
  cost_center   text not null default '',
  regions       text[] not null default '{}',
  channels      text[] not null default '{}',
  goal          text not null default '',
  cta           text not null default '',
  owner         text not null default '',
  owner_email   text not null default '',
  coordinator   text,
  notes         text not null default '',
  assets        jsonb not null default '{}'::jsonb,   -- nested CampaignAssets
  recipients    jsonb not null default '[]'::jsonb,   -- {name,role}[]
  brief_id      text,
  briefed_at    text,
  briefed_date  date,
  go_live_date  date,
  created_at    timestamptz not null default now()
);
alter table public.campaigns enable row level security;
create index campaigns_sbu_idx     on public.campaigns (sbu);
create index campaigns_country_idx on public.campaigns (country);

create policy campaigns_select on public.campaigns
  for select to authenticated
  using ( public.can_see_campaign(sbu, country) );

create policy campaigns_insert on public.campaigns
  for insert to authenticated
  with check (
    public.auth_role() = 'admin'
    or (
      public.auth_role() = 'campaign_owner'
      and sbu     = any(public.auth_sbus())
      and country = any(public.auth_countries())
      and created_by = auth.uid()
    )
  );

create policy campaigns_update on public.campaigns
  for update to authenticated
  using ( public.can_see_campaign(sbu, country) )
  with check (
    public.auth_role() in ('admin','campaign_coordinator','run_team')
    or ( public.auth_role() = 'campaign_owner' and sbu = any(public.auth_sbus()) )
  );

create policy campaigns_delete on public.campaigns
  for delete to authenticated
  using ( public.auth_role() = 'admin' );
