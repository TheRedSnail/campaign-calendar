<script setup lang="ts">
import HelpHint from './HelpHint.vue'

defineProps<{
  label: string
  value: string
  caption?: string
  captionClass?: string
  progress?: number
  /** Optional HELP topic key — renders a help hint next to the label. */
  help?: string
}>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover">
    <p class="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
      {{ label }}
      <HelpHint v-if="help" :topic="help" />
    </p>
    <p class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{{ value }}</p>

    <div v-if="progress !== undefined" class="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div class="h-full rounded-full bg-blue-600" :style="{ width: `${progress}%` }" />
    </div>
    <p v-else-if="caption" class="mt-2 text-xs" :class="captionClass ?? 'text-gray-500'">
      {{ caption }}
    </p>
  </div>
</template>
