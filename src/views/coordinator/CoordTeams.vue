<script setup lang="ts">
import { computed } from 'vue'
import { useCoordinator } from '../../composables/useCoordinator'
import { TICKET_STAGES } from '../../data/coordinator'
import type { TicketStage } from '../../types'
import KpiCard from '../../components/KpiCard.vue'

const { teamWorkload, analytics } = useCoordinator()

const kpis = computed(() => {
  const rows = teamWorkload.value
  const open = rows.reduce((a, r) => a + r.open, 0)
  const overdue = rows.reduce((a, r) => a + r.overdue, 0)
  const busiest = [...rows].sort((a, b) => b.load - a.load)[0]
  return { open, overdue, busiest }
})

const SHORT: Record<TicketStage, string> = {
  Briefed: 'Briefed',
  Accepted: 'Accepted',
  'In progress': 'In prog.',
  'Ready for UAT': 'UAT',
  Live: 'Live',
}

function loadTone(load: number) {
  if (load > 85) return { text: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' }
  if (load > 65) return { text: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' }
  return { text: 'text-green-700', bg: 'bg-green-50', bar: 'bg-green-600' }
}

function cellShade(n: number) {
  if (n <= 0) return 'text-gray-300'
  if (n === 1) return 'bg-blue-50 text-gray-900'
  if (n === 2) return 'bg-blue-100 text-gray-900'
  return 'bg-blue-200 text-gray-900'
}
</script>

<template>
  <div class="mx-auto max-w-[1440px] space-y-5 p-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Team workload</h1>
      <p class="mt-1 text-sm text-gray-500">Open DevOps work items by operational team. Teams are derived from campaign channels.</p>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Open work items" :value="String(kpis.open)" caption="across all teams" />
      <KpiCard
        label="Overdue"
        :value="String(kpis.overdue)"
        :caption="kpis.overdue ? 'needs escalation' : 'none'"
        :caption-class="kpis.overdue ? 'text-red-600' : 'text-gray-500'"
      />
      <KpiCard label="Avg cycle time" :value="analytics.avgCycle" caption="briefed → live · target 10 d" caption-class="text-green-600" />
      <KpiCard
        label="Busiest team"
        :value="kpis.busiest ? kpis.busiest.team : '—'"
        :caption="kpis.busiest ? `${kpis.busiest.load}% of capacity` : ''"
        caption-class="text-amber-600"
      />
    </div>

    <!-- team cards -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="t in teamWorkload" :key="t.team" class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">{{ t.team }}</h3>
          <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="[loadTone(t.load).bg, loadTone(t.load).text]">
            {{ t.load }}% load
          </span>
        </div>
        <div class="mt-4 grid grid-cols-4 gap-2">
          <div><p class="text-lg font-bold text-gray-900">{{ t.open }}</p><p class="text-xs text-gray-500">Open</p></div>
          <div><p class="text-lg font-bold text-amber-600">{{ t.inProgress }}</p><p class="text-xs text-gray-500">In prog.</p></div>
          <div><p class="text-lg font-bold text-blue-600">{{ t.inReview }}</p><p class="text-xs text-gray-500">In review</p></div>
          <div><p class="text-lg font-bold" :class="t.overdue ? 'text-red-600' : 'text-gray-300'">{{ t.overdue }}</p><p class="text-xs text-gray-500">Overdue</p></div>
        </div>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <span class="block h-full rounded-full" :class="loadTone(t.load).bar" :style="{ width: `${t.load}%` }" />
        </div>
        <div class="mt-4">
          <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Active campaigns</p>
          <div class="mt-1.5 flex flex-wrap gap-1.5">
            <span v-for="c in t.campaigns" :key="c" class="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">{{ c }}</span>
            <span v-if="!t.campaigns.length" class="text-xs text-gray-400">—</span>
          </div>
        </div>
      </div>
    </div>

    <!-- matrix -->
    <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-base font-semibold text-gray-900">Work items by team &amp; stage</h2>
        <span class="text-xs text-gray-500">darker = more items · spot the bottleneck</span>
      </div>
      <table class="w-full text-center text-sm">
        <thead>
          <tr class="text-xs font-semibold uppercase tracking-wide text-gray-400">
            <th class="px-2 py-2 text-left">Team</th>
            <th v-for="s in TICKET_STAGES" :key="s" class="px-2 py-2">{{ SHORT[s] }}</th>
            <th class="px-2 py-2">Open</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in teamWorkload" :key="t.team">
            <td class="px-2 py-1.5 text-left font-medium text-gray-900">{{ t.team }}</td>
            <td v-for="s in TICKET_STAGES" :key="s" class="px-1 py-1.5">
              <span class="flex h-9 items-center justify-center rounded-md font-semibold" :class="cellShade(t.byStage[s])">
                {{ t.byStage[s] || '·' }}
              </span>
            </td>
            <td class="px-2 py-1.5 font-bold text-gray-900">{{ t.open }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
