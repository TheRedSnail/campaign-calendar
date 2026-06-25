<script setup lang="ts">
import { computed } from 'vue'
import type { TicketSla } from '../../types'

const props = defineProps<{ sla: TicketSla }>()

const TONE: Record<TicketSla, { dot: string; text: string; bg: string }> = {
  'On track': { dot: 'bg-green-600', text: 'text-green-700', bg: 'bg-green-50' },
  'At risk': { dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  Overdue: { dot: 'bg-red-600', text: 'text-red-600', bg: 'bg-red-50' },
}
const tone = computed(() => TONE[props.sla])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
    :class="[tone.bg, tone.text]"
  >
    <span class="size-1.5 rounded-full" :class="tone.dot" />
    {{ sla }}
  </span>
</template>
