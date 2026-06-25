<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KpiCard from '../components/KpiCard.vue'
import { useCampaigns } from '../composables/useCampaigns'
import type { ProductionElement, ProgressDot, ElementStatus } from '../types'

const route = useRoute()
const router = useRouter()
const { campaigns } = useCampaigns()

const campaign = computed(() => campaigns.value.find((c) => c.id === route.params.id))
const prod = computed(() => campaign.value?.production)

// ── Timeline axis (business-day indices) ──────────────────────────────
const AXIS_MAX = 18
const TICKS = [
  { label: '12 Jun', idx: 0 },
  { label: '15 Jun', idx: 1 },
  { label: '22 Jun', idx: 6 },
  { label: '29 Jun', idx: 11 },
]
const TODAY_IDX = 8
const GOLIVE_IDX = 15
const pos = (idx: number) => (idx / AXIS_MAX) * 100

const DOT: Record<ProgressDot, string> = {
  gray: 'bg-gray-400',
  blue: 'bg-blue-600',
  amber: 'bg-amber-500',
  green: 'bg-green-600',
}

const STATUS: Record<ElementStatus, { dot: string; text: string }> = {
  'On track': { dot: 'bg-green-500', text: 'text-gray-600' },
  'At risk': { dot: 'bg-amber-500', text: 'text-amber-600' },
  Complete: { dot: 'bg-blue-600', text: 'text-blue-700' },
}

/** Centre point (axis idx) for the current-stage label above a bar. */
function headCenter(el: ProductionElement) {
  return el.currentEnd > el.doneEnd
    ? (el.doneEnd + el.currentEnd) / 2
    : (el.start + el.doneEnd) / 2
}

function back() {
  router.push({ name: 'calendar' })
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f8fa]">
    <div v-if="campaign && prod">
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
            In production
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
            Briefed <span class="font-semibold text-gray-800">{{ prod.briefedDate }}</span>
          </span>
          <span class="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
            Go-live <span class="font-semibold text-gray-800">{{ prod.goLiveDate }}</span>
          </span>
          <UButton label="View brief" color="neutral" variant="outline" size="sm" @click="back" />
        </div>
      </header>

      <div class="mx-auto flex max-w-[1320px] flex-col gap-4 p-6">
        <!-- KPI cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Overall progress" :value="`${prod.overallProgress}%`" :progress="prod.overallProgress" />
          <KpiCard
            label="Avg throughput / element"
            :value="prod.avgThroughput"
            :caption="prod.avgThroughputCaption"
            caption-class="text-green-600"
          />
          <KpiCard label="SLA adherence" :value="prod.sla" :caption="prod.slaCaption" />
          <KpiCard label="Time to go-live" :value="prod.timeToGoLive" :caption="prod.timeToGoLiveCaption" />
        </div>

        <!-- Campaign progress (overarching broad statuses) -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p class="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-400">Campaign progress</p>
          <div class="flex items-start">
            <template v-for="(stage, i) in prod.progressStages" :key="stage.label">
              <div class="flex shrink-0 flex-col gap-1.5">
                <div class="flex items-center gap-2">
                  <span class="size-2 rounded-full" :class="DOT[stage.dot]" />
                  <span class="whitespace-nowrap text-sm font-medium text-gray-800">{{ stage.label }}</span>
                </div>
                <span class="pl-4 text-xs text-gray-400">{{ stage.count }}</span>
              </div>
              <div
                v-if="i < prod.progressStages.length - 1"
                class="flex flex-1 flex-col items-center px-1.5 pt-0.5"
              >
                <span class="whitespace-nowrap text-[11px] font-medium text-blue-600">Ø {{ stage.avgAfter }}</span>
                <span class="mt-1.5 h-px w-full bg-gray-200" />
              </div>
            </template>
          </div>
        </div>

        <!-- Production timeline (Gantt) -->
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h2 class="text-base font-semibold text-gray-900">Production timeline</h2>
              <p class="mt-0.5 text-xs text-gray-400">
                {{ prod.elements.length }} elements · brief → go-live · 8 stages over 10 business days each
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
              <div
                v-for="el in prod.elements"
                :key="el.name"
                class="flex h-[72px] flex-col justify-center"
              >
                <div class="text-sm font-medium text-gray-900">{{ el.name }}</div>
                <div class="mt-1 inline-flex items-center gap-1.5 text-xs font-medium" :class="STATUS[el.status].text">
                  <span class="size-1.5 rounded-full" :class="STATUS[el.status].dot" />
                  {{ el.status }}
                </div>
              </div>
            </div>

            <!-- Plot area -->
            <div class="relative flex-1">
              <!-- axis labels -->
              <div class="relative h-10">
                <span
                  v-for="t in TICKS"
                  :key="t.label"
                  class="absolute top-4 text-xs text-gray-400"
                  :style="{ left: `${pos(t.idx)}%` }"
                >
                  {{ t.label }}
                </span>
                <div
                  class="absolute top-0 -translate-x-1/2 rounded bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-white"
                  :style="{ left: `${pos(TODAY_IDX)}%` }"
                >
                  Today · 24 Jun
                </div>
                <div
                  class="absolute top-0 -translate-x-1/2 rounded bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white"
                  :style="{ left: `${pos(GOLIVE_IDX)}%` }"
                >
                  Go-live · 03 Jul
                </div>
              </div>

              <!-- gridlines + markers overlay (span all rows) -->
              <div class="pointer-events-none absolute inset-x-0 bottom-0" :style="{ top: '40px' }">
                <div
                  v-for="t in TICKS"
                  :key="t.label"
                  class="absolute bottom-0 top-0 w-px bg-gray-100"
                  :style="{ left: `${pos(t.idx)}%` }"
                />
                <div
                  class="absolute bottom-0 top-0 w-px bg-gray-400/70"
                  :style="{ left: `${pos(TODAY_IDX)}%` }"
                />
                <div
                  class="absolute bottom-0 top-0 w-0.5 bg-blue-500/80"
                  :style="{ left: `${pos(GOLIVE_IDX)}%` }"
                />
              </div>

              <!-- element rows -->
              <div class="relative">
                <div
                  v-for="el in prod.elements"
                  :key="el.name"
                  class="relative h-[72px] border-t border-gray-100"
                >
                  <!-- current-stage label -->
                  <span
                    class="absolute top-3 -translate-x-1/2 whitespace-nowrap text-[11px] text-gray-500"
                    :style="{ left: `${pos(headCenter(el))}%` }"
                  >
                    {{ el.currentStage }}
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
                        borderLeft: '9px solid #16a34a',
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
