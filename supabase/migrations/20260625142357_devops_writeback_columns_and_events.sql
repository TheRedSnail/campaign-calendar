-- DevOps correlation + last-synced state on both levels (CMPG ≈ campaign, child ≈ ticket).
alter table public.campaigns
  add column devops_id    bigint unique,
  add column devops_state text,
  add column devops_url   text,
  add column synced_at    timestamptz;

alter table public.devops_tickets
  add column devops_id    bigint unique,
  add column devops_state text,
  add column devops_url   text,
  add column synced_at    timestamptz;

-- Raw audit log of every inbound webhook (also captures not-yet-linked items so nothing is lost).
create table public.devops_webhook_events (
  id             uuid primary key default gen_random_uuid(),
  event_type     text,
  work_item_id   bigint,
  work_item_type text,
  new_state      text,
  target         text,          -- 'campaign' | 'ticket' | 'none'
  matched        boolean not null default false,
  payload        jsonb,
  received_at    timestamptz not null default now()
);
alter table public.devops_webhook_events enable row level security;

-- Coordinators / RUN / admin can read the log; the Edge Function writes via the service role
-- (bypasses RLS), so no client INSERT policy is needed.
create policy devops_events_select on public.devops_webhook_events
  for select to authenticated
  using ( public.auth_role() in ('admin','campaign_coordinator','run_team') );
