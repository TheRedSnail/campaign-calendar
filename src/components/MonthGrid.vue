<script setup lang="ts">
import { computed } from 'vue'
import CampaignPill from './CampaignPill.vue'
import { useCampaigns } from '../composables/useCampaigns'
import { buildMonthCells, WEEKDAYS } from '../utils/dates'
import { TODAY } from '../data/options'
import type { Campaign } from '../types'

const { currentMonth, filtered, openDrawer } = useCampaigns()

const cells = computed(() => buildMonthCells(currentMonth.value, TODAY))

const byDay = computed(() => {
  const map = new Map<string, Campaign[]>()
  for (const c of filtered.value) {
    const list = map.get(c.startDate) ?? []
    list.push(c)
    map.set(c.startDate, list)
  }
  return map
})

const MAX_VISIBLE = 2
</script>

<template>
  <div class="flex flex-1 flex-col overflow-hidden bg-white">
    <div class="grid grid-cols-7 border-b border-gray-200">
      <div
        v-for="day in WEEKDAYS"
        :key="day"
        class="px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-400"
      >
        {{ day }}
      </div>
    </div>

    <div class="grid flex-1 grid-cols-7 grid-rows-5">
      <div
        v-for="cell in cells"
        :key="cell.iso"
        class="flex flex-col gap-1 border-b border-r border-gray-100 p-2 last:border-r-0"
        :class="cell.inMonth ? 'bg-white' : 'bg-gray-50/60'"
      >
        <div class="flex items-center">
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

        <div class="flex flex-col gap-1">
          <CampaignPill
            v-for="c in (byDay.get(cell.iso) ?? []).slice(0, MAX_VISIBLE)"
            :key="c.id"
            :campaign="c"
            @select="openDrawer"
          />
          <button
            v-if="(byDay.get(cell.iso)?.length ?? 0) > MAX_VISIBLE"
            type="button"
            class="px-1 text-left text-[11px] font-medium text-gray-400 hover:text-gray-600"
            @click="openDrawer((byDay.get(cell.iso) ?? [])[MAX_VISIBLE].id)"
          >
            +{{ (byDay.get(cell.iso)?.length ?? 0) - MAX_VISIBLE }} more
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
