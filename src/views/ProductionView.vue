<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KpiCard from '../components/KpiCard.vue'
import StageStepper from '../components/StageStepper.vue'
import { useCampaigns } from '../composables/useCampaigns'
import { useCoordinator } from '../composables/useCoordinator'
import { useTimelineConfig } from '../composables/useTimelineConfig'
import { TICKET_STAGES, fmtDate } from '../data/coordinator'
import { TODAY, STATUS_META } from '../data/options'
import { buildProductionTimeline, type GanttRow } from '../utils/production'

const route = useRoute()
const router = useRouter()
const { campaigns } = useCampaigns()
const { ticketsFor, campaignStageIndex, campaignProgress, slaBreakdown } = useCoordinator()
const { phases } = useTimelineConfig()

const campaign = computed(() => campaigns.value.find((c) => c.id === route.params.id))
const tickets = computed(() => (campaign.value ? ticketsFor(campaign.value.id) : []))

// Everything below derives from the campaign's DevOps tickets — the single source of truth.
// Geometry (the phase chunks) comes from the coordinator's timeline config.
const timeline = computed(() =>
  campaign.value ? buildProductionTimeline(campaign.value, tickets.value, TODAY, phases.value) : null,
)
const briefedDate = computed(() => campaign.value?.briefedDate ?? campaign.value?.startDate ?? '')
const goLiveDate = computed(() => campaign.value?.goLiveDate ?? campaign.value?.endDate ?? '')

const sla = computed(() =>
  campaign.value ? slaBreakdown(campaign.value) : { total: 0, onTrack: 0, atRisk: 0, overdue: 0 },
)
const currentIndex = computed(() => (campaign.value ? campaignStageIndex(campaign.value) : 0))
const goLiveWorkingDays = computed(() => {
  if (!timeline.value) return '—'
  const d = timeline.value.goLiveIdx - timeline.value.todayIdx
  return d > 0 ? `${d} days` : d === 0 ? 'today' : 'overdue'
})

const pos = (idx: number) => (timeline.value ? (idx / timeline.value.axisMax) * 100 : 0)

const STATUS: Record<string, { dot: string; text: string }> = {
  'On track': { dot: 'bg-green-500', text: 'text-gray-600' },
  'At risk': { dot: 'bg-amber-500', text: 'text-amber-600' },
  Overdue: { dot: 'bg-red-500', text: 'text-red-600' },
  Complete: { dot: 'bg-blue-600', text: 'text-blue-700' },
}

/** Centre point (axis idx) for the current-stage label above a bar. */
function headCenter(el: GanttRow) {
  return el.currentEnd > el.doneEnd
    ? (el.doneEnd + el.currentEnd) / 2
    : (el.start + el.doneEnd) / 2
}

function back() {
  router.push({ name: 'calendar' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="campaign && timeline && tickets.length">
      <!-- Header -->
      <header class="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-3">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            @click="back"
          >
            <UIcon name="i-lucide-chevron-left" class="size-4" />
            Calendar
          </button>
          <span class="h-5 w-px bg-gray-200" />
          <h1 class="text-base font-semibold text-gray-900">{{ campaign.name }}</h1>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <span class="size-1.5 rounded-full bg-blue-600" />
            {{ STATUS_META[campaign.status].label }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
            Briefed <span class="font-semibold text-gray-800">{{ fmtDate(briefedDate) }}</span>
          </span>
          <span class="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
            Go-live <span class="font-semibold text-gray-800">{{ fmtDate(goLiveDate) }}</span>
          </span>
          <UButton label="View brief" color="neutral" variant="outline" size="sm" @click="back" />
        </div>
      </header>

      <div class="mx-auto flex max-w-[1320px] flex-col gap-4 p-6">
        <!-- KPI cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Overall progress" :value="`${campaignProgress(campaign)}%`" :progress="campaignProgress(campaign)" />
          <KpiCard
            label="SLA adherence"
            :value="`${sla.onTrack} / ${sla.total}`"
            :caption="`${sla.onTrack} on track · ${sla.atRisk} at risk · ${sla.overdue} overdue`"
            :caption-class="sla.overdue ? 'text-red-600' : sla.atRisk ? 'text-amber-600' : 'text-green-600'"
          />
          <KpiCard label="Work items" :value="String(sla.total)" caption="across operational teams" />
          <KpiCard
            label="Time to go-live"
            :value="goLiveWorkingDays"
            :caption="`working days · go-live ${fmtDate(goLiveDate)}`"
          />
        </div>

        <!-- Campaign progress (overarching broad statuses) -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
          <p class="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-400">Campaign progress</p>
          <StageStepper :stages="TICKET_STAGES" :current-index="currentIndex" />
        </div>

        <!-- Production timeline (Gantt) -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h2 class="text-base font-semibold text-gray-900">Production timeline</h2>
              <p class="mt-0.5 text-xs text-gray-400">
                {{ tickets.length }} work items · {{ timeline.phaseBands.length }} phases · brief →
                Ready for UAT ({{ timeline.uatIdx }} business days)
              </p>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span class="inline-flex items-center gap-1.5"><span class="size-3 rounded-sm bg-blue-600" />Done</span>
              <span class="inline-flex items-center gap-1.5"><span class="size-3 rounded-sm bg-amber-500" />Current stage</span>
              <span class="inline-flex items-center gap-1.5"><span class="size-3 rounded-sm bg-gray-200" />Upcoming</span>
              <span class="inline-flex items-center gap-1.5"><span class="size-2.5 rounded-full bg-green-600" />Live ✓</span>
            </div>
          </div>

          <div class="flex">
            <!-- Left label column -->
            <div class="w-56 shrink-0">
              <div class="h-10" />
              <div class="flex h-7 items-center text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Default plan
              </div>
              <div
                v-for="el in timeline.rows"
                :key="el.ticketId"
                class="flex h-[72px] flex-col justify-center"
              >
                <div class="text-sm font-medium text-gray-900">{{ el.name }}</div>
                <div class="mt-1 inline-flex items-center gap-1.5 text-xs font-medium" :class="STATUS[el.statusLabel].text">
                  <span class="size-1.5 rounded-full" :class="STATUS[el.statusLabel].dot" />
                  {{ el.statusLabel }}
                </div>
              </div>
            </div>

            <!-- Plot area -->
            <div class="relative flex-1">
              <!-- axis labels -->
              <div class="relative h-10">
                <span
                  v-for="t in timeline.ticks"
                  :key="t.label"
                  class="absolute top-4 text-xs text-gray-400"
                  :style="{ left: `${pos(t.idx)}%` }"
                >
                  {{ t.label }}
                </span>
                <div
                  class="absolute top-0 -translate-x-1/2 rounded bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-white"
                  :style="{ left: `${pos(timeline.todayIdx)}%` }"
                >
                  Today · {{ fmtDate(TODAY) }}
                </div>
                <div
                  class="absolute top-0 -translate-x-1/2 rounded bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white"
                  :style="{ left: `${pos(timeline.goLiveIdx)}%` }"
                >
                  Go-live · {{ fmtDate(goLiveDate) }}
                </div>
                <div
                  class="absolute bottom-0 -translate-x-1/2 whitespace-nowrap rounded bg-green-600 px-2 py-0.5 text-[11px] font-medium text-white"
                  :style="{ left: `${pos(timeline.uatIdx)}%` }"
                >
                  ◆ UAT · day {{ timeline.uatIdx }}
                </div>
              </div>

              <!-- phase bands (the configured chunking, applied to every track) -->
              <div class="relative h-7">
                <div
                  v-for="(band, i) in timeline.phaseBands"
                  :key="band.key"
                  class="absolute inset-y-0 flex items-center justify-center overflow-hidden border-l border-gray-200 first:border-l-0"
                  :class="i % 2 ? 'bg-gray-50' : 'bg-gray-100/70'"
                  :style="{ left: `${pos(band.start)}%`, width: `${pos(band.end) - pos(band.start)}%` }"
                >
                  <span class="truncate px-1 text-[11px] font-medium text-gray-500">{{ band.label }}</span>
                </div>
              </div>

              <!-- gridlines + markers overlay (span all rows) -->
              <div class="pointer-events-none absolute inset-x-0 bottom-0" :style="{ top: '40px' }">
                <div
                  v-for="t in timeline.ticks"
                  :key="t.label"
                  class="absolute bottom-0 top-0 w-px bg-gray-100"
                  :style="{ left: `${pos(t.idx)}%` }"
                />
                <div
                  class="absolute bottom-0 top-0 w-px bg-gray-400/70"
                  :style="{ left: `${pos(timeline.todayIdx)}%` }"
                />
                <div
                  class="absolute bottom-0 top-0 w-0.5 bg-blue-500/80"
                  :style="{ left: `${pos(timeline.goLiveIdx)}%` }"
                />
                <div
                  class="absolute bottom-0 top-0 w-0.5 bg-green-500/70"
                  :style="{ left: `${pos(timeline.uatIdx)}%` }"
                />
              </div>

              <!-- element rows -->
              <div class="relative">
                <div
                  v-for="el in timeline.rows"
                  :key="el.ticketId"
                  class="relative h-[72px] border-t border-gray-100"
                >
                  <!-- current-stage label -->
                  <span
                    class="absolute top-3 -translate-x-1/2 whitespace-nowrap text-[11px] text-gray-500"
                    :style="{ left: `${pos(headCenter(el))}%` }"
                  >
                    {{ el.stage }}
                  </span>

                  <!-- bar -->
                  <div class="absolute top-1/2 h-[18px] w-full -translate-y-1/2">
                    <!-- upcoming (gray) base from start→end -->
                    <div
                      class="absolute h-full rounded bg-gray-200"
                      :style="{ left: `${pos(el.start)}%`, width: `${pos(el.end) - pos(el.start)}%` }"
                    />
                    <!-- done (blue) -->
                    <div
                      class="absolute h-full rounded-l bg-blue-600"
                      :class="{ 'rounded-r': el.currentEnd <= el.doneEnd }"
                      :style="{ left: `${pos(el.start)}%`, width: `${pos(el.doneEnd) - pos(el.start)}%` }"
                    />
                    <!-- current stage (amber) -->
                    <div
                      v-if="el.currentEnd > el.doneEnd"
                      class="absolute h-full bg-amber-500"
                      :style="{ left: `${pos(el.doneEnd)}%`, width: `${pos(el.currentEnd) - pos(el.doneEnd)}%` }"
                    />

                    <!-- end marker -->
                    <span
                      v-if="el.marker === 'open'"
                      class="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] border-2 border-blue-400 bg-white"
                      :style="{ left: `${pos(el.end)}%` }"
                    />
                    <span
                      v-else-if="el.marker === 'risk'"
                      class="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-red-500"
                      :style="{ left: `${pos(el.end)}%` }"
                    />
                    <span
                      v-else
                      class="absolute top-1/2 size-0 -translate-y-1/2"
                      :style="{
                        left: `${pos(el.end)}%`,
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderLeft: '9px solid #175641',
                      }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <p class="text-gray-500">No production data for this campaign.</p>
      <UButton label="Back to calendar" color="primary" @click="back" />
    </div>
  </div>
</template>
