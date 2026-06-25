<script setup lang="ts">
defineProps<{ label: string; selected: boolean; complete: boolean }>()
const emit = defineEmits<{ (e: 'update:selected', value: boolean): void }>()
</script>

<template>
  <div class="rounded-md border border-gray-200 dark:border-gray-700">
    <label class="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200">
      <UCheckbox
        :model-value="selected"
        @update:model-value="(v: boolean | 'indeterminate') => emit('update:selected', v === true)"
      />
      <span class="flex-1 font-medium">{{ label }}</span>
      <UIcon v-if="selected && complete" name="i-lucide-check" class="size-4 text-green-600" />
    </label>
    <div
      v-if="selected"
      class="flex flex-col gap-2.5 border-t border-gray-200 px-3 py-3 dark:border-gray-700"
    >
      <slot />
    </div>
  </div>
</template>
