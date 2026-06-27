<script setup lang="ts">
import { computed } from 'vue'
import { HELP } from '../data/help'

const props = withDefaults(
  defineProps<{
    /** Key into the HELP content record (e.g. "brief.channels"). */
    topic: string
    /** Popover alignment along the trigger edge. */
    align?: 'start' | 'center' | 'end'
  }>(),
  { align: 'start' },
)

// Look up content by key. Missing key → render nothing (safe to sprinkle anywhere).
const entry = computed(() => HELP[props.topic])
</script>

<template>
  <UPopover v-if="entry" :content="{ align, side: 'top' }">
    <button
      type="button"
      class="inline-flex translate-y-px items-center justify-center align-middle text-gray-400 transition-colors hover:text-gray-600"
      :aria-label="`Help: ${entry.title}`"
      @click.stop.prevent
    >
      <UIcon name="i-lucide-info" class="size-3.5" />
    </button>

    <template #content>
      <div class="w-64 p-3 text-sm">
        <p class="font-semibold text-gray-900">{{ entry.title }}</p>
        <p class="mt-1 text-gray-600">{{ entry.body }}</p>
        <p
          v-if="entry.example"
          class="mt-2 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700"
        >
          {{ entry.example }}
        </p>
        <a
          v-if="entry.href"
          :href="entry.href"
          target="_blank"
          rel="noopener"
          class="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        >
          {{ entry.hrefLabel ?? 'Learn more' }}
          <UIcon name="i-lucide-external-link" class="size-3" />
        </a>
      </div>
    </template>
  </UPopover>
</template>
