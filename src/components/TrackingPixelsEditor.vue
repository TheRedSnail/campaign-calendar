<script setup lang="ts">
import FileUpload from './FileUpload.vue'
import { blankPixel } from '../data/campaigns'
import { PIXEL_VENDOR_OPTIONS, PIXEL_TYPE_OPTIONS } from '../data/options'
import type { TrackingPixel } from '../types'

// Edits mutate the (reactive) pixel objects in place; `change` tells the parent to persist.
const props = defineProps<{ modelValue: TrackingPixel[] }>()
const emit = defineEmits<{ (e: 'change'): void }>()

function addPixel() {
  props.modelValue.push(blankPixel())
  emit('change')
}
function removePixel(i: number) {
  props.modelValue.splice(i, 1)
  if (props.modelValue.length === 0) props.modelValue.push(blankPixel())
  emit('change')
}
function addPath(pixel: TrackingPixel) {
  pixel.paths.push({ url: '', comment: '' })
  emit('change')
}
function removePath(pixel: TrackingPixel, i: number) {
  pixel.paths.splice(i, 1)
  if (pixel.paths.length === 0) pixel.paths.push({ url: '', comment: '' })
  emit('change')
}
const onChange = () => emit('change')
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      v-for="(pixel, pi) in modelValue"
      :key="pi"
      class="rounded-md border border-gray-200 p-2.5 dark:border-gray-700"
    >
      <div class="mb-2 flex items-center justify-between">
        <span class="text-[13px] font-medium text-gray-500">Pixel {{ pi + 1 }}</span>
        <button
          v-if="modelValue.length > 1"
          type="button"
          class="text-gray-400 hover:text-red-600"
          @click="removePixel(pi)"
        >
          <UIcon name="i-lucide-trash-2" class="size-4" />
        </button>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div>
          <label class="mb-1 block text-[13px] font-medium text-gray-500">Pixel vendor</label>
          <USelect v-model="pixel.vendor" :items="PIXEL_VENDOR_OPTIONS" placeholder="Select vendor" class="w-full" @update:model-value="onChange" />
        </div>
        <div>
          <label class="mb-1 block text-[13px] font-medium text-gray-500">Pixel type</label>
          <USelect v-model="pixel.pixelType" :items="PIXEL_TYPE_OPTIONS" placeholder="Select type" class="w-full" @update:model-value="onChange" />
        </div>
        <div>
          <label class="mb-1 block text-[13px] font-medium text-gray-500">Pixel ID</label>
          <UInput v-model="pixel.pixelId" placeholder="e.g. 1234567890" class="w-full" @update:model-value="onChange" />
        </div>
        <div>
          <label class="mb-1 block text-[13px] font-medium text-gray-500">Briefing file</label>
          <FileUpload v-model="pixel.briefingDoc" @update:model-value="onChange" />
        </div>
      </div>

      <div class="mt-2.5">
        <label class="mb-1 block text-[13px] font-medium text-gray-500">Pixel script</label>
        <UTextarea v-model="pixel.script" :rows="2" placeholder="Paste the pixel script" class="w-full" @update:model-value="onChange" />
      </div>

      <div class="mt-3">
        <label class="mb-1 block text-[13px] font-medium text-gray-500">Paths</label>
        <div class="flex flex-col gap-2">
          <div v-for="(path, pj) in pixel.paths" :key="pj" class="flex items-start gap-2">
            <div class="grid flex-1 grid-cols-2 gap-2">
              <UInput v-model="path.url" placeholder="Path / URL" class="w-full" @update:model-value="onChange" />
              <UInput v-model="path.comment" placeholder="Comment / specification" class="w-full" @update:model-value="onChange" />
            </div>
            <button
              v-if="pixel.paths.length > 1"
              type="button"
              class="mt-2 text-gray-400 hover:text-red-600"
              @click="removePath(pixel, pj)"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </div>
        </div>
        <button
          type="button"
          class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          @click="addPath(pixel)"
        >
          <UIcon name="i-lucide-plus" class="size-3.5" /> Add path
        </button>
      </div>
    </div>

    <button
      type="button"
      class="inline-flex items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700"
      @click="addPixel"
    >
      <UIcon name="i-lucide-plus" class="size-4" /> Add pixel
    </button>
  </div>
</template>
