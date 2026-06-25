<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCoordinator } from '../../composables/useCoordinator'
import { fmtDate } from '../../data/coordinator'
import MiniStepper from '../../components/coordinator/MiniStepper.vue'
import SlaBadge from '../../components/coordinator/SlaBadge.vue'

const { portfolioRows, pipelineCounts } = useCoordinator()

const DOT_CLASS: Record<string, string> = {
  gray: 'bg-gray-300',
  blue: 'bg-blue-600',
  amber: 'bg-amber-500',
  green: 'bg-green-600',
}

const lens = ref<'all' | 'risk'>('all')
const rows = computed(() =>
  lens.value === 'all' ? portfolioRows.value : portfolioRows.value.filter((r) => r.sla !== 'On track'),
)

function rowTint(sla: string) {
  if (sla === 'Overdue') return 'bg-red-50/60'
  if (sla === 'At risk') return 'bg-amber-50/50'
  return ''
}
</script>

<template>
  <div class="mx-auto max-w-[1440px] space-y-5 p-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Portfolio</h1>
      <p class="mt-1 text-sm text-gray-500">Every campaign in flight, sorted by risk.</p>
    </div>

    <!-- pipeline funnel -->
    <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 class="mb-3 text-base font-semibold text-gray-900">Campaigns by production stage</h2>
      <div class="grid grid-cols-3 gap-3 lg:grid-cols-5">
        <div v-for="s in pipelineCounts" :key="s.stage" class="rounded-lg bg-gray-50 p-3">
          <div class="flex items-center gap-1.5">
            <span class="size-2 rounded-full" :class="s.count ? DOT_CLASS[s.dot] : 'bg-gray-200'" />
            <span class="text-xl font-bold" :class="s.count ? 'text-gray-900' : 'text-gray-300'">{{ s.count }}</span>
          </div>
          <p class="mt-1 text-xs text-gray-500">{{ s.stage }}</p>
        </div>
      </div>
    </div>

    <!-- filter -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Filter</span>
      <button
        type="button"
        class="rounded-full border px-3 py-1.5 text-xs font-medium"
        :class="lens === 'all' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-600'"
        @click="lens = 'all'"
      >
        All in flight
      </button>
      <button
        type="button"
        class="rounded-full border px-3 py-1.5 text-xs font-medium"
        :class="lens === 'risk' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-gray-200 bg-white text-gray-600'"
        @click="lens = 'risk'"
      >
        At risk &amp; overdue
      </button>
    </div>

    <!-- table -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
            <th class="px-4 py-3 font-semibold">Campaign</th>
            <th class="px-4 py-3 font-semibold">Coordinator</th>
            <th class="px-4 py-3 font-semibold">Brand</th>
            <th class="px-4 py-3 font-semibold">Stage</th>
            <th class="px-4 py-3 font-semibold">Progress</th>
            <th class="px-4 py-3 font-semibold">SLA</th>
            <th class="px-4 py-3 font-semibold">Go-live</th>
            <th class="px-4 py-3 font-semibold">Risk</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in rows" :key="r.campaign.id" class="hover:bg-gray-50" :class="rowTint(r.sla)">
            <td class="px-4 py-3">
              <RouterLink
                :to="`/coordinator/campaign/${r.campaign.id}`"
                class="font-semibold text-gray-900 hover:text-blue-600"
              >
                {{ r.campaign.name }}
              </RouterLink>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ r.campaign.coordinator }}</td>
            <td class="px-4 py-3 text-gray-500">{{ r.campaign.brand }}</td>
            <td class="px-4 py-3"><MiniStepper :stage="r.stage" /></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-900">{{ r.progress }}%</span>
                <span class="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                  <span class="block h-full rounded-full bg-blue-600" :style="{ width: `${r.progress}%` }" />
                </span>
              </div>
            </td>
            <td class="px-4 py-3"><SlaBadge :sla="r.sla" /></td>
            <td class="px-4 py-3 text-gray-700">{{ fmtDate(r.campaign.endDate) }}</td>
            <td class="px-4 py-3">
              <span v-if="r.risk" class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <span class="size-1.5 rounded-full bg-amber-500" />{{ r.risk }} at risk
              </span>
              <span v-else class="text-gray-300">—</span>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="8" class="px-4 py-8 text-center text-sm text-gray-400">No campaigns match this filter.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
