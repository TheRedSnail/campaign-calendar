<script setup lang="ts">
import { computed } from 'vue'
import { useTimelineConfig } from '../composables/useTimelineConfig'
import type { TimelinePhase } from '../data/timelineConfig'
import { UAT_LABEL } from '../data/timelineConfig'
import SettingsShell from '../components/SettingsShell.vue'

const { phases, totalDays, setPhaseDays, resetToDefaults } = useTimelineConfig()

// Phase → accent (reuses the calendar status tokens; no new hex values).
const PHASE_COLOR: Record<TimelinePhase['key'], string> = {
  briefing: 'bg-blue-600',
  in_progress: 'bg-amber-500',
  qa: 'bg-gray-400',
  business_review: 'bg-green-600',
}

/** Preview segments sized by their share of the total (collapsed phases are skipped). */
const segments = computed(() =>
  phases.value
    .filter((p) => p.days > 0)
    .map((p) => ({ ...p, width: totalDays.value ? (p.days / totalDays.value) * 100 : 0 })),
)

function onDays(key: TimelinePhase['key'], v: string | number) {
  setPhaseDays(key, Number(v))
}
</script>

<template>
  <SettingsShell>
    <template #actions>
      <UButton
        label="Reset to defaults"
        icon="i-lucide-rotate-ccw"
        color="neutral"
        variant="outline"
        size="sm"
        @click="resetToDefaults"
      />
    </template>

    <div class="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Production timeline</h1>
        <p class="text-sm text-gray-500">Default production-timeline durations (business days).</p>
      </div>

      <!-- Phase durations -->
      <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
        <div class="mb-1 flex items-start justify-between">
          <div>
            <h2 class="text-base font-semibold text-gray-900">Per-track phase durations</h2>
            <p class="mt-0.5 text-xs text-gray-400">
              Business days for each phase of every production-timeline track (weekends excluded).
            </p>
          </div>
          <span class="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
            Total <span class="font-semibold text-gray-800">{{ totalDays }}</span> business days
          </span>
        </div>

        <div class="mt-4 flex flex-col divide-y divide-gray-100">
          <div v-for="phase in phases" :key="phase.key" class="flex items-center gap-3 py-3">
            <span class="size-2.5 shrink-0 rounded-full" :class="PHASE_COLOR[phase.key]" />
            <span class="flex-1 text-sm font-medium text-gray-900">{{ phase.label }}</span>
            <div class="flex items-center gap-2">
              <UInput
                :model-value="phase.days"
                type="number"
                :min="0"
                :max="60"
                class="w-24"
                @update:model-value="(v: string | number) => onDays(phase.key, v)"
              />
              <span class="w-16 text-[13px] text-gray-500">days</span>
            </div>
          </div>

          <!-- Ready for UAT milestone (derived, not editable) -->
          <div class="flex items-center gap-3 py-3">
            <span class="size-2.5 shrink-0 rotate-45 rounded-[2px] bg-green-600" />
            <span class="flex-1 text-sm font-medium text-gray-900">{{ UAT_LABEL }}</span>
            <span class="text-[13px] text-gray-500">milestone · day {{ totalDays }}</span>
          </div>
        </div>
      </section>

      <!-- Live preview -->
      <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
        <h2 class="text-base font-semibold text-gray-900">Preview</h2>
        <p class="mt-0.5 text-xs text-gray-400">
          How each track chunks from brief (day 0) to Ready for UAT (day {{ totalDays }}).
        </p>

        <div class="mt-4 flex h-7 w-full overflow-hidden rounded-md">
          <div
            v-for="seg in segments"
            :key="seg.key"
            class="flex items-center justify-center overflow-hidden text-[11px] font-medium text-white"
            :class="PHASE_COLOR[seg.key]"
            :style="{ width: `${seg.width}%` }"
          >
            <span class="truncate px-1">{{ seg.label }}</span>
          </div>
        </div>
        <div class="mt-2 flex justify-between text-[11px] text-gray-400">
          <span>Brief · day 0</span>
          <span>◆ Ready for UAT · day {{ totalDays }}</span>
        </div>

        <div class="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
          <span v-for="phase in phases" :key="phase.key" class="inline-flex items-center gap-1.5">
            <span class="size-2.5 rounded-full" :class="PHASE_COLOR[phase.key]" />
            {{ phase.label }} · {{ phase.days }}d
          </span>
        </div>
      </section>

      <p class="px-1 text-xs text-gray-400">
        Changes apply to every campaign's production timeline and are saved to this browser.
      </p>
    </div>
  </SettingsShell>
</template>
