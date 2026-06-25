<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaigns } from '../../composables/useCampaigns'
import { useCoordinator, ASSIGNEE_OPTIONS } from '../../composables/useCoordinator'
import { TICKET_STAGES, SLA_LIST, fmtDate } from '../../data/coordinator'
import { TODAY } from '../../data/options'
import type { TicketSla, TicketStage } from '../../types'
import KpiCard from '../../components/KpiCard.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import StageStepper from '../../components/StageStepper.vue'

const route = useRoute()
const { campaigns } = useCampaigns()
const {
  ticketsFor,
  campaignProgress,
  campaignSla,
  setTicketStage,
  setTicketSla,
  setTicketAssignee,
} = useCoordinator()

const campaign = computed(() => campaigns.value.find((c) => c.id === route.params.id))
const tickets = computed(() => (campaign.value ? ticketsFor(campaign.value.id) : []))

const onTrack = computed(() => tickets.value.filter((t) => t.sla === 'On track').length)

const goLiveDays = computed(() => {
  if (!campaign.value) return '—'
  const d = Math.round(
    (new Date(campaign.value.endDate + 'T00:00:00').getTime() - new Date(TODAY + 'T00:00:00').getTime()) / 86_400_000,
  )
  return d >= 0 ? `${d} days` : `${-d} d ago`
})

/** Representative position in the stage flow: rounded average of the
 * campaign's ticket stages (updates live as tickets are edited). */
const currentIndex = computed(() => {
  if (!tickets.value.length) return 0
  const avg =
    tickets.value.reduce((sum, t) => sum + TICKET_STAGES.indexOf(t.stage), 0) / tickets.value.length
  return Math.round(avg)
})
</script>

<template>
  <div v-if="campaign" class="mx-auto max-w-[1440px] space-y-5 p-6">
    <!-- header -->
    <div class="flex items-center justify-between gap-3">
      <div>
        <RouterLink to="/coordinator/portfolio" class="text-sm text-gray-400 hover:text-gray-600">‹ Portfolio</RouterLink>
        <div class="mt-1 flex items-center gap-3">
          <h1 class="text-2xl font-semibold text-gray-900">{{ campaign.name }}</h1>
          <StatusBadge :status="campaign.status" />
        </div>
        <p class="mt-1 text-sm text-gray-500">
          {{ campaign.brand }} · {{ campaign.sbu }} · Owner {{ campaign.owner || '—' }} · Coordinator {{ campaign.coordinator }}
        </p>
      </div>
      <RouterLink
        v-if="campaign.production"
        :to="`/campaign/${campaign.id}/production`"
        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Open production Gantt ↗
      </RouterLink>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Overall progress" :value="`${campaignProgress(campaign)}%`" :progress="campaignProgress(campaign)" />
      <KpiCard label="SLA" :value="`${onTrack} / ${tickets.length}`" caption="tickets on track" />
      <KpiCard label="Work items" :value="String(tickets.length)" caption="across operational teams" />
      <KpiCard label="Time to go-live" :value="goLiveDays" :caption="`go-live ${fmtDate(campaign.endDate)}`" />
    </div>

    <!-- stepper -->
    <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 class="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Campaign progress</h2>
      <StageStepper :stages="TICKET_STAGES" :current-index="currentIndex" />
    </div>

    <!-- editable tickets -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 class="text-base font-semibold text-gray-900">DevOps work items</h2>
        <span class="text-xs text-gray-500">edit inline — dashboards update live</span>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
            <th class="px-5 py-3 font-semibold">Ticket</th>
            <th class="px-4 py-3 font-semibold">Team</th>
            <th class="px-4 py-3 font-semibold">Stage</th>
            <th class="px-4 py-3 font-semibold">SLA</th>
            <th class="px-4 py-3 font-semibold">Assignee</th>
            <th class="px-4 py-3 font-semibold">Due</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="t in tickets" :key="t.id" class="hover:bg-gray-50">
            <td class="px-5 py-3">
              <span class="rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-blue-600">{{ t.id }}</span>
              <p class="mt-1 text-xs text-gray-500">{{ t.title }}</p>
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
          <tr v-if="!tickets.length">
            <td colspan="6" class="px-5 py-8 text-center text-sm text-gray-400">
              No tickets yet — accept this brief in Triage to create them.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else class="mx-auto max-w-[1440px] p-6">
    <p class="text-sm text-gray-500">Campaign not found. <RouterLink to="/coordinator/portfolio" class="text-blue-600">Back to portfolio</RouterLink></p>
  </div>
</template>
