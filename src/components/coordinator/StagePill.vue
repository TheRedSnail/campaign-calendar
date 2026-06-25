<script setup lang="ts">
import { computed } from 'vue'
import type { ProgressDot, TicketStage } from '../../types'
import { STAGE_DOT } from '../../data/coordinator'

const props = defineProps<{ stage: TicketStage }>()

const TONE: Record<ProgressDot, { dot: string; text: string; bg: string }> = {
  gray: { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-100' },
  blue: { dot: 'bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50' },
  amber: { dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  green: { dot: 'bg-green-600', text: 'text-green-700', bg: 'bg-green-50' },
}
const tone = computed(() => TONE[STAGE_DOT[props.stage]])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
    :class="[tone.bg, tone.text]"
  >
    <span class="size-1.5 rounded-full" :class="tone.dot" />
    {{ stage }}
  </span>
</template>
