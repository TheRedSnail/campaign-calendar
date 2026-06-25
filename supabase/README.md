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

## Working locally

```bash
supabase link --project-ref hvzrhyitjapnxrzilzoq
supabase db push                       # apply migrations
supabase functions deploy admin-users  # deploy the Edge Function
```

The web app reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (see repo `.env.example`).
