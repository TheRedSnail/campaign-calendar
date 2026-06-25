<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCoordinator, ASSIGNEE_OPTIONS } from '../../composables/useCoordinator'
import { TICKET_STAGES, SLA_LIST, TEAM_ORDER } from '../../data/coordinator'
import type { TicketSla, TicketStage } from '../../types'
import SlaBadge from '../../components/coordinator/SlaBadge.vue'
import StagePill from '../../components/coordinator/StagePill.vue'

const { tickets, campaignName, setTicketStage, setTicketSla, setTicketAssignee } = useCoordinator()

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
</script>

<template>
  <div class="mx-auto max-w-[1440px] space-y-5 p-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">DevOps tickets</h1>
      <p class="mt-1 text-sm text-gray-500">
        Change a ticket’s stage, SLA or assignee — every dashboard updates live.
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
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="t in rows" :key="t.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <span class="rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-blue-600">{{ t.id }}</span>
            </td>
            <td class="px-4 py-3">
              <RouterLink :to="`/coordinator/campaign/${t.campaignId}`" class="font-medium text-gray-900 hover:text-blue-600">
                {{ campaignName(t.campaignId) }}
              </RouterLink>
              <p class="text-xs text-gray-500">{{ t.title }}</p>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ t.team }}</td>
            <td class="px-4 py-3">
              <USelect
                :model-value="t.stage"
                :items="TICKET_STAGES"
                size="sm"
                class="w-40"
                @update:model-value="(v: TicketStage) => setTicketStage(t.id, v)"
              />
            </td>
            <td class="px-4 py-3">
              <USelect
                :model-value="t.sla"
                :items="SLA_LIST"
                size="sm"
                class="w-32"
                @update:model-value="(v: TicketSla) => setTicketSla(t.id, v)"
              />
            </td>
            <td class="px-4 py-3">
              <USelect
                :model-value="t.assignee"
                :items="ASSIGNEE_OPTIONS"
                size="sm"
                class="w-40"
                @update:model-value="(v: string) => setTicketAssignee(t.id, v)"
              />
            </td>
            <td class="px-4 py-3 text-gray-700">{{ t.dueDate }}</td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-400">No tickets match this filter.</td>
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
