<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string[]
  options: readonly string[]
  placeholder?: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const available = computed(() => props.options.filter((o) => !props.modelValue.includes(o)))

function add(option: string) {
  emit('update:modelValue', [...props.modelValue, option])
}
function remove(option: string) {
  emit('update:modelValue', props.modelValue.filter((o) => o !== option))
}
</script>

<template>
  <div
    class="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5"
  >
    <span
      v-for="tag in modelValue"
      :key="tag"
      class="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
    >
      {{ tag }}
      <button type="button" class="text-blue-400 hover:text-blue-700" @click="remove(tag)">
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
    </span>

    <UPopover v-if="available.length" :content="{ align: 'start' }">
      <button type="button" class="rounded px-1 text-xs font-medium text-gray-400 hover:text-gray-600">
        + add
      </button>
      <template #content>
        <ul class="max-h-56 w-48 overflow-auto p-1">
          <li v-for="option in available" :key="option">
            <button
              type="button"
              class="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
              @click="add(option)"
            >
              {{ option }}
            </button>
          </li>
        </ul>
      </template>
    </UPopover>

    <span v-if="!modelValue.length" class="px-1 text-sm text-gray-400">
      {{ placeholder ?? 'Select…' }}
    </span>
  </div>
</template>
