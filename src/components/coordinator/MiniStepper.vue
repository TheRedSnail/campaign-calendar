<script setup lang="ts">
import { computed } from 'vue'
import type { TicketStage } from '../../types'
import { TICKET_STAGES } from '../../data/coordinator'

const props = defineProps<{ stage: TicketStage }>()
const idx = computed(() => TICKET_STAGES.indexOf(props.stage))

function tone(i: number): string {
  if (i < idx.value) return 'bg-blue-600'
  if (i === idx.value) return props.stage === 'Live' ? 'bg-green-600' : 'bg-amber-500'
  return 'bg-gray-200'
}
</script>

<template>
  <span class="inline-flex items-center gap-1" :title="stage">
    <span v-for="(s, i) in TICKET_STAGES" :key="s" class="size-2 rounded-full" :class="tone(i)" />
  </span>
</template>
