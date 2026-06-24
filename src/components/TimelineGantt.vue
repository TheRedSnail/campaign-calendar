<script setup lang="ts">
import { computed } from 'vue'
import { useCampaigns } from '../composables/useCampaigns'
import { BRAND_OPTIONS, STATUS_META, TODAY } from '../data/options'
import { buildTimelineWeeks, shortDate, timelineBar, timelineFraction } from '../utils/dates'
import type { Brand, Campaign } from '../types'

const { filtered, openDrawer } = useCampaigns()

const ROW = 48 // px per campaign bar row
const weeks = buildTimelineWeeks()
const todayLeft = computed(() => timelineFraction(TODAY) * 100)

const groups = computed(() =>
  BRAND_OPTIONS.map((brand: Brand) => ({
    brand,
    campaigns: filtered.value.filter((c) => c.brand === brand),
  })).filter((g) => g.campaigns.length > 0),
)

function barStyle(c: Campaign) {
  const { left, width } = timelineBar(c.startDate, c.endDate)
  return { left: `${left}%`, width: `${width}%` }
}
</script>

<template>
  <div class="flex flex-1 overflow-auto bg-white">
    <!-- Left labels column -->
    <div class="flex w-52 shrink-0 flex-col border-r border-gray-200">
      <div class="flex h-14 items-center px-4 text-sm font-medium text-gray-500">Brand / Campaign</div>
      <div
        v-for="group in groups"
        :key="group.brand"
        class="flex flex-col justify-center border-b border-gray-100 px-4"
        :style="{ height: `${group.campaigns.length * ROW}px` }"
      >
        <div class="text-sm font-semibold text-gray-900">{{ group.brand }}</div>
        <div class="text-xs text-gray-400">{{ group.campaigns.length }} campaigns</div>
      </div>
    </div>

    <!-- Right chart column -->
    <div class="flex flex-1 flex-col">
      <!-- weeks header -->
      <div class="flex h-14">
        <div
          v-for="week in weeks"
          :key="week.iso"
          class="flex flex-1 flex-col justify-center border-b border-l border-gray-100 px-3"
        >
          <div class="text-sm font-medium text-gray-700">{{ week.label }}</div>
          <div class="text-xs text-gray-400">{{ week.weekLabel }}</div>
        </div>
      </div>

      <!-- chart body -->
      <div class="relative flex-1">
        <!-- week gridlines -->
        <div class="absolute inset-0 flex">
          <div v-for="week in weeks" :key="week.iso" class="flex-1 border-l border-gray-100" />
        </div>

        <!-- today line -->
        <div
          class="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-blue-500/70"
          :style="{ left: `${todayLeft}%` }"
        >
          <span
            class="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"
          >
            Today · {{ shortDate(TODAY) }}
          </span>
        </div>

        <!-- bars -->
        <div class="relative">
          <template v-for="group in groups" :key="group.brand">
            <div
              v-for="c in group.campaigns"
              :key="c.id"
              class="relative border-b border-transparent"
              :style="{ height: `${ROW}px` }"
            >
              <button
                type="button"
                class="absolute top-1/2 flex h-7 max-w-full -translate-y-1/2 items-center gap-2 overflow-hidden rounded-md px-2 text-xs font-medium text-white shadow-sm transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                :class="STATUS_META[c.status].bg"
                :style="barStyle(c)"
                @click="openDrawer(c.id)"
              >
                <span class="truncate">{{ c.name }}</span>
                <span class="shrink-0 rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                  {{ c.progress }}%
                </span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
