# Campaign Calendar — prototype

Working prototype of the **Campaign Calendar** wireframes (Henkel Adhesives), built from the
Figma file _Campaign Calendar — Wireframes_
(`https://www.figma.com/design/6KNP9QWvlyBGc3em9hYUxS/Campaign-Calendar-%E2%80%94-Wireframes`).
It is a UI prototype: **all data is mock data and nothing is persisted.**

## Stack

Vite + Vue 3 (`<script setup>`) · TypeScript · [Nuxt UI](https://ui.nuxt.com) (Vue/Vite mode) ·
Tailwind CSS v4 · vue-router (history mode).

## Commands

```bash
npm run dev        # http://localhost:5173
npm run build      # vue-tsc -b type-check + production build → dist/
npm run typecheck  # vue-tsc --noEmit  (run this before committing)
```

Deployed on Netlify (`netlify.toml`): builds `dist/`, with an SPA fallback so deep routes
like `/campaign/:id/production` resolve on direct load.

## Architecture

```
src/
  components/   AppHeader, FilterBar, FilterChip, MonthGrid, TimelineGantt,
                CampaignPill, StatusBadge, TagMultiSelect, CampaignDrawer,
                BriefModal, KpiCard
  composables/  useCampaigns (reactive store + drawer/filter state),
                useCompletion (field-completion model, X / 20)
  data/         campaigns.ts (seed data), options.ts (option lists + STATUS_META tokens)
  utils/        dates.ts (month-grid cells, multi-day bar layout, timeline math)
  views/        CalendarView (Month + Timeline), ProductionView (per-campaign status)
scripts/shots.mjs   Playwright screenshot driver to verify against the wireframes
```

- **State** lives in `composables/useCampaigns.ts` — a module-level reactive store (no Pinia).
  `filtered` applies the active filter chips + search; `openDrawer(id)` drives the drawer.
- **Routing**: `CalendarView` at `/`; `ProductionView` at `/campaign/:id/production`.
- **Views map to wireframe frames**: Month grid (frame 1), Timeline/Gantt (frame 2),
  Campaign drawer (frames 3–4), Brief flow (frame 5), Production status (frame 6).

## Conventions

- **Design tokens**: wireframe colours map onto Tailwind defaults, defined centrally in
  `data/options.ts` (`STATUS_META`). accent/briefed `#2563EB` = `blue-600`, in-progress
  `#F59E0B` = `amber-500`, ready/live `#16A34A` = `green-600`, draft `#9CA3AF` = `gray-400`.
  Font: Inter. Reuse these tokens — don't hardcode new hex values.
- Components are `<script setup lang="ts">`; prefer `computed` over watchers; keep mock data in
  `src/data/`, not inline in components.
- Run `npm run typecheck` before committing.

## Production status — the brief→go-live Gantt (`views/ProductionView.vue`)

Frame 6 shows a campaign in production as a **staggered calendar Gantt**, not a table:

- **5 elements** (Landing page, Form, Email, UTM campaign name, Tracking pixel implementation)
  each move through **8 stages** — Briefed → Accepted → In progress → QA → Business review →
  Ready for UAT → Ready for go-live → Live — over **10 business days** each.
- The x-axis is a **business-day index** (`pos(idx)` maps idx → %). `0` = brief date (12 Jun),
  `TODAY_IDX = 8` (24 Jun), `GOLIVE_IDX = 15` (03 Jul), `AXIS_MAX = 18` (leaves buffer so an
  at-risk bar can overshoot the go-live line).
- Each `ProductionElement` (see `types.ts`) carries `start / doneEnd / currentEnd / end` as axis
  indices: blue = done (`start→doneEnd`), amber = current stage (`doneEnd→currentEnd`),
  grey = upcoming (`→end`). `marker` is `open` (on track), `done` (complete), or `risk`.
- `progressStages` (`CampaignProgressStage[]`) drives the overarching stepper above the timeline.

When changing the element set or stages, edit the seed in `data/campaigns.ts` and keep the KPI
numbers (overallProgress, sla, etc.) consistent with the elements.

## Figma

When editing the design, the wireframe lives in the file above. Frame 6 = `node-id 24:2`. Match
`data/options.ts` tokens and the existing card styling (white surface, `#E3E6EA` 1px border,
12px radius, Inter).
