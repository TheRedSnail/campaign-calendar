<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** Ordered stage labels (e.g. Briefed → Accepted → … → Live). */
  stages: string[]
  /** Index of the stage the campaign is currently at. */
  currentIndex: number
}>()

type StepState = 'done' | 'current' | 'live' | 'upcoming'

const steps = computed(() =>
  props.stages.map((label, i) => {
    let state: StepState
    if (i < props.currentIndex) state = 'done'
    else if (i === props.currentIndex) state = i === props.stages.length - 1 ? 'live' : 'current'
    else state = 'upcoming'
    return { label, state, n: i + 1 }
  }),
)

const CIRCLE: Record<StepState, string> = {
  done: 'bg-blue-600 text-white',
  current: 'bg-amber-500 text-white ring-4 ring-amber-500/20',
  live: 'bg-green-600 text-white',
  upcoming: 'border border-gray-300 bg-white text-gray-400',
}
const LABEL: Record<StepState, string> = {
  done: 'text-gray-500',
  current: 'text-gray-900 font-semibold',
  live: 'text-green-700 font-semibold',
  upcoming: 'text-gray-400',
}
const hasCheck = (s: StepState) => s === 'done' || s === 'live'
</script>

<template>
  <div class="flex">
    <div
      v-for="(step, i) in steps"
      :key="step.label"
      class="relative flex flex-1 flex-col items-center"
    >
      <!-- connector to the next node (sits behind the circle) -->
      <div
        v-if="i < steps.length - 1"
        class="absolute left-1/2 top-[15px] h-0.5 w-full"
        :class="i < currentIndex ? 'bg-blue-600' : 'bg-gray-200'"
      />
      <!-- node -->
      <span
        class="relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-semibold"
        :class="CIRCLE[step.state]"
      >
        <UIcon v-if="hasCheck(step.state)" name="i-lucide-check" class="size-4" />
        <template v-else>{{ step.n }}</template>
      </span>
      <!-- label -->
      <span class="mt-2 whitespace-nowrap text-xs" :class="LABEL[step.state]">{{ step.label }}</span>
    </div>
  </div>
</template>
