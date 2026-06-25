create table public.devops_tickets (
  id          text primary key,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  team        text not null,
  title       text not null default '',
  stage       text not null default 'Briefed',
  sla         text not null default 'On track',
  assignee    text not null default 'Unassigned',
  due_date    text not null default ''
);
alter table public.devops_tickets enable row level security;
create index devops_tickets_campaign_idx on public.devops_tickets (campaign_id);

create policy tickets_select on public.devops_tickets
  for select to authenticated
  using ( exists (
    select 1 from public.campaigns c
    where c.id = devops_tickets.campaign_id
      and public.can_see_campaign(c.sbu, c.country)
  ));

create policy tickets_write on public.devops_tickets
  for all to authenticated
  using ( exists (
    select 1 from public.campaigns c
    where c.id = devops_tickets.campaign_id
      and public.can_see_campaign(c.sbu, c.country)
      and public.auth_role() in ('admin','campaign_coordinator','run_team')
  ))
  with check ( exists (
    select 1 from public.campaigns c
    where c.id = devops_tickets.campaign_id
      and public.can_see_campaign(c.sbu, c.country)
      and public.auth_role() in ('admin','campaign_coordinator','run_team')
  ));

-- Accept a brief atomically: flip the campaign to in_production and fan out its tickets.
create or replace function public.accept_brief(p_campaign_id uuid, p_tickets jsonb)
  returns void language plpgsql security invoker set search_path = public as $$
begin
  update public.campaigns set status = 'in_production' where id = p_campaign_id;
  insert into public.devops_tickets (id, campaign_id, team, title, stage, sla, assignee, due_date)
  select x.id, p_campaign_id, x.team, x.title, x.stage, x.sla, x.assignee, x.due_date
  from jsonb_to_recordset(p_tickets)
    as x(id text, team text, title text, stage text, sla text, assignee text, due_date text)
  on conflict (id) do nothing;
end;
$$;
grant execute on function public.accept_brief(uuid, jsonb) to authenticated;
