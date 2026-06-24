# Campaign Calendar — Prototype

A working prototype of the **Campaign Calendar** wireframes (Henkel Adhesives), built from
the Figma file _Campaign Calendar — Wireframes_.

**Stack:** Vite + Vue 3 (`<script setup>`) · TypeScript · [Nuxt UI](https://ui.nuxt.com)
(Vue/Vite mode) · Tailwind CSS v4 · vue-router.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # type-check (vue-tsc) + production build → dist/
npm run typecheck  # vue-tsc --noEmit
```

## What's implemented

All data is mock data (`src/data/`); nothing is persisted.

| View | Route / entry | Notes |
|------|---------------|-------|
| **Month grid** | `/` (Month) | Status-coloured campaign pills with % badges, today marker, `+N more` overflow |
| **Timeline / Gantt** | `/` (Timeline) | Campaigns grouped by brand, bars sized to start→end, "Today" line |
| **Campaign drawer** | click any campaign | Sectioned form with live completion tracking (`X / 20`); the **Brief** button unlocks at 20/20 |
| **Brief flow** | drawer → _Brief campaign_ | 2-step modal: review compiled brief → confirmation (stamps Brief ID + status → Briefed) |
| **Production status** | drawer → _View production status_, or `/campaign/:id/production` | KPI cards, production-flow stages, element-status table |

Working interactions: month navigation, Month/Timeline toggle, filter chips
(SBU / Brand / Region / Owner / Channel / Status) + search across both views, drawer field
editing that recomputes completion & calendar status, the brief flow, and `+ New campaign`.

### Design tokens

Wireframe tokens map onto Tailwind defaults: accent/briefed `#2563EB` = `blue-600`,
in-progress `#F59E0B` = `amber-500`, ready `#16A34A` = `green-600`, draft `#9CA3AF` = `gray-400`.
Defined centrally in `src/data/options.ts` (`STATUS_META`). Font: Inter.

## Project layout

```
src/
  components/   AppHeader, FilterBar, FilterChip, MonthGrid, TimelineGantt,
                CampaignPill, StatusBadge, TagMultiSelect, CampaignDrawer,
                BriefModal, KpiCard
  composables/  useCampaigns (reactive store), useCompletion (field-completion model)
  data/         campaigns.ts (seed data), options.ts (option lists + status tokens)
  utils/        dates.ts (month grid + timeline math)
  views/        CalendarView, ProductionView
scripts/shots.mjs   Playwright screenshot driver used to verify against the wireframes
```
