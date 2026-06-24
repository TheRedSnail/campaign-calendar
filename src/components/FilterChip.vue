<script setup lang="ts" generic="T extends string">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  options: readonly T[]
  modelValue: T[]
  format?: (option: T) => string
}>()

const labelOf = (option: T) => (props.format ? props.format(option) : option)
const emit = defineEmits<{ (e: 'update:modelValue', value: T[]): void }>()

const active = computed(() => props.modelValue.length > 0)

function toggle(option: T) {
  const next = props.modelValue.includes(option)
    ? props.modelValue.filter((o) => o !== option)
    : [...props.modelValue, option]
  emit('update:modelValue', next)
}

function clear() {
  emit('update:modelValue', [])
}
</script>

<template>
  <UPopover :content="{ align: 'start' }">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition"
      :class="
        active
          ? 'border-blue-200 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      "
    >
      {{ label }}
      <span
        v-if="active"
        class="rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold leading-tight text-white"
      >
        {{ modelValue.length }}
      </span>
      <UIcon name="i-lucide-chevron-down" class="size-3.5 opacity-60" />
    </button>

    <template #content>
      <div class="w-56 p-1.5">
        <div class="flex items-center justify-between px-2 py-1">
          <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ label }}</span>
          <button
            v-if="active"
            type="button"
            class="text-xs font-medium text-blue-600 hover:underline"
            @click="clear"
          >
            Clear
          </button>
        </div>
        <ul class="max-h-64 overflow-auto">
          <li v-for="option in options" :key="option">
            <label
              class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <UCheckbox
                :model-value="modelValue.includes(option)"
                @update:model-value="toggle(option)"
              />
              <span class="truncate">{{ labelOf(option) }}</span>
            </label>
          </li>
        </ul>
      </div>
    </template>
  </UPopover>
</template>
