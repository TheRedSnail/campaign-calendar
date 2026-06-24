<script setup lang="ts">
import { computed } from 'vue'
import type { CampaignStatus } from '../types'
import { STATUS_META } from '../data/options'

const props = withDefaults(
  defineProps<{
    status: CampaignStatus
    label?: string
    /** soft = tinted background pill (default); dot = just a labelled dot */
    variant?: 'soft' | 'dot'
  }>(),
  { variant: 'soft' },
)

const meta = computed(() => STATUS_META[props.status])
const text = computed(() => props.label ?? meta.value.label)
</script>

<template>
  <span
    v-if="variant === 'soft'"
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    :class="[`${meta.dot}/10`]"
    :style="{ color: meta.hex, backgroundColor: meta.hex + '1A' }"
  >
    <span class="size-1.5 rounded-full" :style="{ backgroundColor: meta.hex }" />
    {{ text }}
  </span>
  <span v-else class="inline-flex items-center gap-1.5 text-xs text-gray-500">
    <span class="size-2 rounded-full" :class="meta.dot" />
    {{ text }}
  </span>
</template>
