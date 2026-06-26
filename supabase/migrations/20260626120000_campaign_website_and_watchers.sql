-- briefs.md adds two campaign-level fields:
--   website  — the target brand site (single value)
--   watchers — CC email addresses kept in the loop alongside the owner
alter table public.campaigns
  add column if not exists website  text   not null default '',
  add column if not exists watchers text[] not null default '{}';
