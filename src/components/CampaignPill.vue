<script setup lang="ts">
import { computed } from 'vue'
import type { Campaign } from '../types'
import { STATUS_META } from '../data/options'
import { useCoordinator } from '../composables/useCoordinator'

const props = withDefaults(
  defineProps<{ campaign: Campaign; showPercent?: boolean }>(),
  { showPercent: true },
)
defineEmits<{ (e: 'select', id: string): void }>()

const { campaignProgress } = useCoordinator()
const meta = computed(() => STATUS_META[props.campaign.status])
// In-flight campaigns show live ticket-derived progress; others use brief completion.
const progressPct = computed(() =>
  props.campaign.status === 'in_production' ? campaignProgress(props.campaign) : props.campaign.progress,
)
</script>

<template>
  <button
    type="button"
    class="group flex w-full items-center gap-1.5 overflow-hidden rounded-md px-2 py-1 text-left text-xs font-medium text-white shadow-sm transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
    :class="meta.bg"
    @click="$emit('select', campaign.id)"
  >
    <span class="flex-1 truncate">{{ campaign.name }}</span>
    <span
      v-if="props.showPercent"
      class="shrink-0 rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-semibold leading-none"
    >
      {{ progressPct }}%
    </span>
  </button>
</template>
