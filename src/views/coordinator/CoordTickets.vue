<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCoordinator } from '../../composables/useCoordinator'
import { TEAM_ORDER, devopsTicketUrl } from '../../data/coordinator'
import type { TicketSla } from '../../types'
import SlaBadge from '../../components/coordinator/SlaBadge.vue'
import StagePill from '../../components/coordinator/StagePill.vue'

const { tickets, campaignName } = useCoordinator()

const teamFilter = ref<string>('All teams')
const riskOnly = ref(false)
const teamItems = ['All teams', ...TEAM_ORDER]

const rows = computed(() =>
  tickets.value.filter((t) => {
    if (teamFilter.value !== 'All teams' && t.team !== teamFilter.value) return false
    if (riskOnly.value && t.sla === 'On track') return false
    return true
  }),
)

const atRisk = computed(() => tickets.value.filter((t) => t.sla !== 'On track').length)

// Colour-code each ticket row by its SLA (same palette as SlaBadge).
const SLA_ROW_BG: Record<TicketSla, string> = {
  'On track': 'bg-green-50/40 hover:bg-green-50/80',
  'At risk': 'bg-amber-50/50 hover:bg-amber-50/90',
  Overdue: 'bg-red-50/60 hover:bg-red-100/70',
}
const SLA_ACCENT: Record<TicketSla, string> = {
  'On track': 'border-l-4 border-l-green-500',
  'At risk': 'border-l-4 border-l-amber-500',
  Overdue: 'border-l-4 border-l-red-500',
}
</script>

<template>
  <div class="mx-auto max-w-[1440px] space-y-5 p-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">DevOps tickets</h1>
      <p class="mt-1 text-sm text-gray-500">
        Work items synced from Azure DevOps — open one in DevOps from its ticket ID.
        <span class="font-medium text-gray-700">{{ tickets.length }} tickets · {{ atRisk }} at risk</span>
      </p>
    </div>

    <!-- filters -->
    <div class="flex flex-wrap items-center gap-3">
      <USelect v-model="teamFilter" :items="teamItems" size="sm" class="w-48" />
      <label class="flex items-center gap-2 text-sm text-gray-600">
        <UCheckbox v-model="riskOnly" /> At risk &amp; overdue only
      </label>
    </div>

    <!-- table -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
            <th class="px-4 py-3 font-semibold">Ticket</th>
            <th class="px-4 py-3 font-semibold">Campaign</th>
            <th class="px-4 py-3 font-semibold">Team</th>
            <th class="px-4 py-3 font-semibold">Stage</th>
            <th class="px-4 py-3 font-semibold">SLA</th>
            <th class="px-4 py-3 font-semibold">Assignee</th>
            <th class="px-4 py-3 font-semibold">Due</th>
            <th class="px-4 py-3 font-semibold">DevOps</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="t in rows" :key="t.id" class="transition-colors" :class="SLA_ROW_BG[t.sla]">
            <td class="px-4 py-3" :class="SLA_ACCENT[t.sla]">
              <a
                :href="devopsTicketUrl(t)"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:underline"
                :title="`Open ${t.id} in Azure DevOps`"
              >
                {{ t.id }}
                <UIcon name="i-lucide-external-link" class="size-3" />
              </a>
            </td>
            <td class="px-4 py-3">
              <RouterLink :to="`/coordinator/campaign/${t.campaignId}`" class="font-medium text-gray-900 hover:text-blue-600">
                {{ campaignName(t.campaignId) }}
              </RouterLink>
              <p class="text-xs text-gray-500">{{ t.title }}</p>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ t.team }}</td>
            <td class="px-4 py-3"><StagePill :stage="t.stage" /></td>
            <td class="px-4 py-3"><SlaBadge :sla="t.sla" /></td>
            <td class="px-4 py-3 text-gray-700">{{ t.assignee || '—' }}</td>
            <td class="px-4 py-3 text-gray-700">{{ t.dueDate }}</td>
            <td class="px-4 py-3">
              <a
                v-if="t.devopsUrl"
                :href="t.devopsUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                :title="`Synced from Azure DevOps${t.devopsState ? ' · ' + t.devopsState : ''}`"
              >
                <UIcon name="i-lucide-git-pull-request-arrow" class="size-3.5" />
                {{ t.devopsState || 'View' }}
              </a>
              <span v-else class="text-xs text-gray-300">—</span>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="8" class="px-4 py-8 text-center text-sm text-gray-400">No tickets match this filter.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- legend -->
    <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
      <span class="flex items-center gap-1.5">Stages:</span>
      <StagePill stage="In progress" />
      <StagePill stage="Live" />
      <span class="ml-4 flex items-center gap-1.5">SLA:</span>
      <SlaBadge sla="On track" />
      <SlaBadge sla="At risk" />
      <SlaBadge sla="Overdue" />
    </div>
  </div>
</template>
