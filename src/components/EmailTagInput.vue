<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ modelValue: string[]; placeholder?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const draft = ref('')

function add() {
  const value = draft.value.trim().replace(/,$/, '').trim()
  if (!value || props.modelValue.includes(value)) {
    draft.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, value])
  draft.value = ''
}

function remove(email: string) {
  emit('update:modelValue', props.modelValue.filter((e) => e !== email))
}
</script>

<template>
  <div
    class="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5"
  >
    <span
      v-for="email in modelValue"
      :key="email"
      class="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
    >
      {{ email }}
      <button type="button" class="text-blue-400 hover:text-blue-700" @click="remove(email)">
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
    </span>

    <input
      v-model="draft"
      type="email"
      :placeholder="modelValue.length ? '' : (placeholder ?? 'Add email + Enter')"
      class="min-w-[8rem] flex-1 border-0 bg-transparent px-1 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0"
      @keydown.enter.prevent="add"
      @keydown.,.prevent="add"
      @blur="add"
    />
  </div>
</template>
