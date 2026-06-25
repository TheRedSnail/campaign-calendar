-- Per the DevOps team: use the work item id as the primary key of the webhook table.
-- The table becomes one row per work item, upserted to its latest state (not an append log).

-- Collapse any duplicates to the most recent row per work item, then drop null ids.
delete from public.devops_webhook_events a
  using public.devops_webhook_events b
  where a.work_item_id = b.work_item_id and a.received_at < b.received_at;
delete from public.devops_webhook_events where work_item_id is null;

-- Dropping the id column removes the old uuid primary key with it.
alter table public.devops_webhook_events drop column id;
alter table public.devops_webhook_events alter column work_item_id set not null;
alter table public.devops_webhook_events add primary key (work_item_id);
