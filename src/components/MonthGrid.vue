<script setup lang="ts">
import { computed } from 'vue'
import { useCampaigns } from '../composables/useCampaigns'
import { buildMonthCells, buildMonthBars, WEEKDAYS, type MonthBar } from '../utils/dates'
import { TODAY, STATUS_META } from '../data/options'

const { currentMonth, filtered, openDrawer } = useCampaigns()

const cells = computed(() => buildMonthCells(currentMonth.value, TODAY))
const weeksCells = computed(() => [0, 1, 2, 3, 4].map((w) => cells.value.slice(w * 7, w * 7 + 7)))
const bars = computed(() => buildMonthBars(cells.value, filtered.value))

const COL = 100 / 7
const LANE_H = 22
const TOP_OFFSET = 30

function barStyle(bar: MonthBar) {
  return {
    left: `calc(${bar.startCol * COL}% + 4px)`,
    width: `calc(${(bar.endCol - bar.startCol + 1) * COL}% - 8px)`,
    top: `${TOP_OFFSET + bar.lane * LANE_H}px`,
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col overflow-hidden bg-white">
    <!-- weekday header -->
    <div class="grid grid-cols-7 border-b border-gray-200">
      <div
        v-for="day in WEEKDAYS"
        :key="day"
        class="px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-400"
      >
        {{ day }}
      </div>
    </div>

    <!-- week rows -->
    <div class="flex flex-1 flex-col">
      <div
        v-for="(week, w) in weeksCells"
        :key="w"
        class="relative flex-1 overflow-hidden border-b border-gray-100 last:border-b-0"
      >
        <!-- background day cells -->
        <div class="grid h-full grid-cols-7">
          <div
            v-for="cell in week"
            :key="cell.iso"
            class="border-r border-gray-100 p-2 last:border-r-0"
            :class="cell.inMonth ? 'bg-white' : 'bg-gray-50/60'"
          >
            <span
              v-if="cell.isToday"
              class="flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
            >
              {{ cell.day }}
            </span>
            <span
              v-else
              class="text-xs font-medium"
              :class="cell.inMonth ? 'text-gray-500' : 'text-gray-300'"
            >
              {{ cell.day }}
            </span>
          </div>
        </div>

        <!-- multi-day bars overlay -->
        <div class="pointer-events-none absolute inset-0">
          <button
            v-for="bar in bars[w]"
            :key="bar.id + '-' + bar.startCol"
            type="button"
            class="pointer-events-auto absolute flex h-[18px] items-center gap-1.5 overflow-hidden rounded-md px-2 text-xs font-medium text-white shadow-sm transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            :class="STATUS_META[bar.campaign.status].bg"
            :style="barStyle(bar)"
            @click="openDrawer(bar.id)"
          >
            <span class="flex-1 truncate" :class="{ 'opacity-90': !bar.isStart }">{{ bar.campaign.name }}</span>
            <span class="shrink-0 rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
              {{ bar.campaign.progress }}%
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
