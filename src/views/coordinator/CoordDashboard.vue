<script setup lang="ts">
import { computed } from 'vue'
import { useCoordinator } from '../../composables/useCoordinator'
import { computeSections } from '../../composables/useCompletion'
import { fmtDate } from '../../data/coordinator'
import { CURRENT_USER } from '../../data/options'
import KpiCard from '../../components/KpiCard.vue'
import MiniStepper from '../../components/coordinator/MiniStepper.vue'
import SlaBadge from '../../components/coordinator/SlaBadge.vue'

const {
  dashboardKpis,
  triage,
  tickets,
  upcomingGoLives,
  myCampaigns,
  campaignStage,
  campaignProgress,
  campaignSla,
  campaignName,
} = useCoordinator()

const kpi = dashboardKpis

const briefRows = computed(() =>
  triage.value.map((c) => {
    const s = computeSections(c)
    const done = s.reduce((a, x) => a + x.done, 0)
    const total = s.reduce((a, x) => a + x.total, 0)
    return {
      id: c.id,
      tone: c.status === 'briefed' ? 'bg-amber-500' : 'bg-blue-600',
      title: c.status === 'briefed' ? `Awaiting your acceptance — ${c.name}` : `Brief ready to accept — ${c.name}`,
      sub: `${done}/${total} complete · ${c.channels.join(', ') || 'no channels'}`,
    }
  }),
)

const riskRows = computed(() =>
  tickets.value
    .filter((t) => t.sla !== 'On track')
    .map((t) => ({
      id: t.campaignId,
      tone: t.sla === 'Overdue' ? 'bg-red-600' : 'bg-amber-500',
      title: `${t.sla} — ${campaignName(t.campaignId)} · ${t.team}`,
      sub: `${t.stage} · ticket ${t.id} · ${t.assignee}`,
    })),
)
</script>

<template>
  <div class="mx-auto max-w-[1440px] space-y-5 p-6">
    <!-- greeting -->
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Good morning, {{ CURRENT_USER.firstName }}</h1>
      <p class="mt-1 text-sm text-gray-500">
        {{ kpi.inFlight }} campaigns in flight · {{ kpi.briefsToAction }} briefs waiting on you ·
        {{ kpi.atRisk }} elements at risk
      </p>
    </div>

    <!-- KPI row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Briefs to action" :value="String(kpi.briefsToAction)" caption="in your triage queue" />
      <KpiCard label="Campaigns in flight" :value="String(kpi.inFlight)" caption="in production" />
      <KpiCard
        label="At-risk elements"
        :value="String(kpi.atRisk)"
        :caption="`in ${kpi.atRiskCampaigns} campaign${kpi.atRiskCampaigns === 1 ? '' : 's'} · needs nudging`"
        caption-class="text-amber-600"
      />
      <KpiCard
        label="Go-lives this week"
        :value="String(kpi.goLivesThisWeek)"
        :caption="kpi.nextGoLive ? `next: ${kpi.nextGoLive.name}` : 'none scheduled'"
      />
    </div>

    <!-- two columns -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <!-- needs attention -->
      <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
        <div class="mb-2 flex items-center gap-2">
          <h2 class="text-base font-semibold text-gray-900">Needs my attention</h2>
          <span class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
            {{ briefRows.length + riskRows.length }}
          </span>
        </div>
        <ul class="divide-y divide-gray-100">
          <li v-for="r in briefRows" :key="'b' + r.id" class="flex items-center gap-3 py-3">
            <span class="mt-0.5 size-2.5 shrink-0 rounded-full" :class="r.tone" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-gray-900">{{ r.title }}</p>
              <p class="truncate text-xs text-gray-500">{{ r.sub }}</p>
            </div>
            <RouterLink
              to="/coordinator/triage"
              class="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Review
            </RouterLink>
          </li>
          <li v-for="(r, i) in riskRows" :key="'r' + i" class="flex items-center gap-3 py-3">
            <span class="mt-0.5 size-2.5 shrink-0 rounded-full" :class="r.tone" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-gray-900">{{ r.title }}</p>
              <p class="truncate text-xs text-gray-500">{{ r.sub }}</p>
            </div>
            <RouterLink
              :to="`/coordinator/campaign/${r.id}`"
              class="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Open
            </RouterLink>
          </li>
          <li v-if="!briefRows.length && !riskRows.length" class="py-6 text-center text-sm text-gray-400">
            All clear — nothing needs you right now.
          </li>
        </ul>
      </div>

      <!-- upcoming go-lives -->
      <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 class="mb-2 text-base font-semibold text-gray-900">Upcoming go-lives</h2>
        <ul class="divide-y divide-gray-100">
          <li v-for="c in upcomingGoLives" :key="c.id" class="flex items-center gap-3 py-3">
            <div class="flex w-14 shrink-0 flex-col items-center rounded-lg bg-gray-50 py-1.5">
              <span class="text-sm font-bold text-gray-900">{{ fmtDate(c.endDate).split(' ')[0] }}</span>
              <span class="text-xs text-gray-500">{{ fmtDate(c.endDate).split(' ')[1] }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-gray-900">{{ c.name }}</p>
              <p class="truncate text-xs text-gray-500">{{ campaignStage(c) }}</p>
            </div>
            <SlaBadge :sla="campaignSla(c)" />
          </li>
          <li v-if="!upcomingGoLives.length" class="py-6 text-center text-sm text-gray-400">
            Nothing in production yet.
          </li>
        </ul>
      </div>
    </div>

    <!-- my campaigns -->
    <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 class="mb-3 text-base font-semibold text-gray-900">My campaigns</h2>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
            <th class="pb-2 font-semibold">Campaign</th>
            <th class="pb-2 font-semibold">Owner</th>
            <th class="pb-2 font-semibold">Stage</th>
            <th class="pb-2 font-semibold">Progress</th>
            <th class="pb-2 font-semibold">SLA</th>
            <th class="pb-2 font-semibold">Go-live</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="c in myCampaigns" :key="c.id" class="hover:bg-gray-50">
            <td class="py-3 pr-4">
              <RouterLink :to="`/coordinator/campaign/${c.id}`" class="font-semibold text-gray-900 hover:text-blue-600">
                {{ c.name }}
              </RouterLink>
            </td>
            <td class="py-3 pr-4 text-gray-500">{{ c.owner || '—' }}</td>
            <td class="py-3 pr-4"><MiniStepper :stage="campaignStage(c)" /></td>
            <td class="py-3 pr-4">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-900">{{ campaignProgress(c) }}%</span>
                <span class="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                  <span class="block h-full rounded-full bg-blue-600" :style="{ width: `${campaignProgress(c)}%` }" />
                </span>
              </div>
            </td>
            <td class="py-3 pr-4"><SlaBadge :sla="campaignSla(c)" /></td>
            <td class="py-3 text-gray-700">{{ fmtDate(c.endDate) }}</td>
          </tr>
          <tr v-if="!myCampaigns.length">
            <td colspan="6" class="py-6 text-center text-sm text-gray-400">No campaigns assigned to you yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
