<script setup lang="ts">
import { computed } from 'vue'
import { useCoordinator } from '../../composables/useCoordinator'
import KpiCard from '../../components/KpiCard.vue'

const { analytics } = useCoordinator()
const a = analytics

const maxCycle = computed(() => Math.max(...a.value.cycleByStage.map((s) => s.days)))
const maxThr = computed(() => Math.max(...a.value.throughputTrend))
</script>

<template>
  <div class="mx-auto max-w-[1440px] space-y-5 p-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Throughput &amp; SLA</h1>
      <p class="mt-1 text-sm text-gray-500">How fast briefs move to go-live, where time is lost, and whether we hit SLA.</p>
    </div>

    <!-- KPIs (live) -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Avg cycle time" :value="a.avgCycle" caption="briefed → live · target 10 d" caption-class="text-green-600" />
      <KpiCard
        label="SLA adherence"
        :value="`${a.slaPct}%`"
        caption="live · target 85%"
        :caption-class="a.slaPct >= 85 ? 'text-green-600' : 'text-amber-600'"
      />
      <KpiCard
        label="At-risk items"
        :value="String(a.atRisk)"
        caption="across all tickets"
        :caption-class="a.atRisk ? 'text-amber-600' : 'text-gray-500'"
      />
      <KpiCard label="Live work items" :value="String(a.live)" caption="shipped" />
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <!-- cycle time per stage -->
      <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
        <h2 class="mb-4 text-base font-semibold text-gray-900">Cycle time per stage · average business days</h2>
        <div class="space-y-3">
          <div v-for="s in a.cycleByStage" :key="s.stage" class="flex items-center gap-3">
            <span class="w-40 shrink-0 text-sm text-gray-700">{{ s.stage }}</span>
            <span class="h-5 flex-1 overflow-hidden rounded bg-gray-50">
              <span
                class="block h-full rounded"
                :class="s.days >= 3 ? 'bg-amber-500' : 'bg-blue-600'"
                :style="{ width: `${(s.days / maxCycle) * 100}%` }"
              />
            </span>
            <span class="w-12 shrink-0 text-right text-sm font-semibold" :class="s.days >= 3 ? 'text-amber-600' : 'text-gray-900'">
              {{ s.days.toFixed(1) }} d
            </span>
          </div>
        </div>
      </div>

      <!-- bottleneck callout -->
      <div class="rounded-xl border border-amber-500 bg-amber-50 p-5">
        <div class="flex items-center gap-2">
          <span class="size-2.5 rounded-full bg-amber-500" />
          <span class="text-xs font-semibold text-amber-600">Bottleneck</span>
        </div>
        <h3 class="mt-2 text-lg font-semibold text-gray-900">“{{ a.bottleneck.stage }}” is your slowest stage</h3>
        <p class="mt-1 flex items-baseline gap-2">
          <span class="text-3xl font-bold text-amber-600">{{ a.bottleneck.days.toFixed(1) }} d</span>
          <span class="text-xs text-gray-500">longest avg stage</span>
        </p>
        <p class="mt-3 text-sm text-gray-600">
          Elements sit here far longer than any other stage — most overruns trace back to the Web &amp; Landing team.
          Consider WIP limits or earlier asset hand-off.
        </p>
      </div>
    </div>

    <!-- trends -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">SLA adherence trend</h2>
          <span class="text-xs text-gray-500">target 85%</span>
        </div>
        <div class="flex h-40 items-end justify-between gap-3">
          <div v-for="(v, i) in a.slaTrend" :key="i" class="flex flex-1 flex-col items-center gap-2">
            <span class="text-xs font-semibold text-gray-700">{{ v }}%</span>
            <div
              class="w-8 rounded-t"
              :class="v >= 85 ? 'bg-green-600' : 'bg-amber-500'"
              :style="{ height: `${(v / 100) * 120}px` }"
            />
            <span class="text-xs text-gray-500">{{ a.trendMonths[i] }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">Throughput — go-lives per month</h2>
          <span class="text-xs text-gray-500">illustrative</span>
        </div>
        <div class="flex h-40 items-end justify-between gap-3">
          <div v-for="(v, i) in a.throughputTrend" :key="i" class="flex flex-1 flex-col items-center gap-2">
            <span class="text-xs font-semibold text-gray-700">{{ v }}</span>
            <div class="w-8 rounded-t bg-blue-600" :style="{ height: `${(v / maxThr) * 120}px` }" />
            <span class="text-xs text-gray-500">{{ a.trendMonths[i] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
