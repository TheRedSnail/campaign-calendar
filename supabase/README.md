# Supabase backend

The Campaign Calendar runs on Supabase project **`campaign-calendar`** (ref `hvzrhyitjapnxrzilzoq`,
region eu-west-3). Auth, the Postgres schema, Row-Level Security, and an admin Edge Function live here.

## Layout

- `migrations/` — schema, RLS policies, and seed data (campaigns, tickets, demo users). Applied in
  filename order.
- `functions/admin-users/` — Edge Function (service-role) backing the admin user-management screen:
  `create` / `update` / `reset_password` / `delete`, callable only by an authenticated admin.

## Data model

- `profiles` (1:1 with `auth.users`) — `role` (`campaign_owner` | `campaign_coordinator` | `run_team`
  | `admin`), `sbus[]`, `countries[]`, `is_global`.
- `campaigns` — the campaign records (with a `country` scoping field) — RLS-scoped.
- `devops_tickets` — per-team work items; visibility follows the parent campaign.

## Row-Level Security (visibility)

`SECURITY DEFINER` helpers (`auth_role`, `auth_sbus`, `auth_countries`, `auth_is_global`,
`can_see_campaign`) read the caller's profile without re-triggering RLS. Policies use them:

- **campaign_owner** — only campaigns in their (single) SBU; may INSERT only into their own SBU+country.
- **campaign_coordinator** — campaigns in any of their SBUs.
- **run_team** — campaigns in any of their countries (or all, if `is_global`); across all SBUs.
- **admin** — everything; only role allowed to DELETE.

## Demo accounts (prototype only)

| Role        | Email                     | Scope                       |
|-------------|---------------------------|-----------------------------|
| Admin       | `admin@demo.henkel`       | Everything                  |
| Owner       | `owner@demo.henkel`       | SBU Industrial / Germany    |
| Coordinator | `coordinator@demo.henkel` | SBUs Industrial + Automotive|
| RUN team    | `run@demo.henkel`         | Countries Germany + France  |

Password for all: **`Demo1234!`**

## Azure DevOps writeback (inbound)

`functions/devops-webhook/` is the endpoint the team's Azure DevOps **service hook** POSTs to when a
work item changes. Their `CMPG` work item maps to our **campaign**; child work items map to our
**`devops_tickets`**. The function records each event in `devops_webhook_events`, then updates the
matched row (`devops_state`, `devops_url`, `synced_at`; tickets also map `System.State` → our
`stage`). It writes via the service-role key (bypasses RLS) and always returns `200` on an
authenticated, well-formed request.

`devops_webhook_events` is **keyed by the work item id** (its primary key, per the DevOps team) —
one row per work item, upserted to its latest event/state, rather than an append-only log.

**Give the developers:**

- **URL**: `https://hvzrhyitjapnxrzilzoq.supabase.co/functions/v1/devops-webhook`
- **Events**: `workitem.created`, `workitem.updated`.
- **Auth**: set a shared secret as the service hook's HTTP **Basic auth** password, or append
  `?token=<secret>` to the URL (also accepts `X-Webhook-Secret` / `Bearer`). The secret is the
  `DEVOPS_WEBHOOK_SECRET` function secret — set it with
  `supabase secrets set DEVOPS_WEBHOOK_SECRET=…` (a prototype default is baked in until you do).
- **Linkage**: matching is purely on `resource.workItemId` (DevOps is the master of record; names
  are not unique, so there is no name check). A campaign stores its parent (CMPG) work item id in
  `campaigns.devops_id`; each per-team ticket stores its child work item id in
  `devops_tickets.devops_id`. These ids are written by **outbound** creation at the briefing moment
  (to be built); after that every update matches by id. Events for ids we don't yet know are still
  logged (`matched=false`).
- **Confirm**: the exact `System.State` values your process uses, so `STATE_TO_STAGE` in the
  function is accurate (defaults cover New/To do, Active/Doing, Resolved/In review, Done/Closed).

Verified end-to-end with the team's sample payload (`payload-example.txt` at the repo root): an
event whose `workItemId` is linked to a row updates it — a campaign's synced state, or a ticket's
`stage` (e.g. `Doing` → `In progress`) with assignee/due date.

## Working locally

```bash
supabase link --project-ref hvzrhyitjapnxrzilzoq
supabase db push                       # apply migrations
supabase functions deploy admin-users  # deploy the Edge Function
```

The web app reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (see repo `.env.example`).
