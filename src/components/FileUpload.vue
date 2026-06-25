<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const input = ref<HTMLInputElement | null>(null)

function pick() {
  input.value?.click()
}
function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) emit('update:modelValue', f.name)
}
function clear() {
  emit('update:modelValue', '')
  if (input.value) input.value.value = ''
}
</script>

<template>
  <div>
    <input ref="input" type="file" class="hidden" @change="onFile" />
    <div
      v-if="modelValue"
      class="flex items-center gap-2 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm dark:border-gray-700"
    >
      <UIcon name="i-lucide-paperclip" class="size-4 shrink-0 text-gray-400" />
      <span class="flex-1 truncate text-gray-700 dark:text-gray-200">{{ modelValue }}</span>
      <button type="button" class="text-gray-400 hover:text-gray-600" @click="clear">
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </div>
    <UButton
      v-else
      label="Upload briefing document"
      icon="i-lucide-upload"
      color="neutral"
      variant="outline"
      size="sm"
      @click="pick"
    />
  </div>
</template>
