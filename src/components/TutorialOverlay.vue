<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTutorial } from '../composables/useTutorial'
import { tourForRoute } from '../data/tutorial'

const route = useRoute()
const {
  activeTour,
  currentStep,
  activeTourId,
  stepIndex,
  totalSteps,
  isLastStep,
  maybeAutoStart,
  next,
  skip,
  hideForNow,
  hideForever,
  close,
} = useTutorial()

interface Rect {
  top: number
  left: number
  width: number
  height: number
}
const rect = ref<Rect | null>(null)

const POPOVER_W = 320
const PAD = 6
const RETRIES = 6
const RETRY_MS = 120
let retryTimer: ReturnType<typeof setTimeout> | undefined
let startTimer: ReturnType<typeof setTimeout> | undefined

function findEl(): HTMLElement | null {
  const step = currentStep.value
  return step ? document.querySelector(`[data-tutorial-id="${step.target}"]`) : null
}

function measure() {
  const el = findEl()
  if (!el) {
    rect.value = null
    return
  }
  const r = el.getBoundingClientRect()
  rect.value = { top: r.top, left: r.left, width: r.width, height: r.height }
}

function clearRetry() {
  if (retryTimer) clearTimeout(retryTimer)
  retryTimer = undefined
}

/** Bring the current step's target into view and measure it; skip the step if it never appears. */
function ensureTarget(attempt = 0) {
  if (!activeTour.value) return
  const el = findEl()
  if (el) {
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    clearRetry()
    retryTimer = setTimeout(measure, 180)
    return
  }
  if (attempt < RETRIES) {
    clearRetry()
    retryTimer = setTimeout(() => ensureTarget(attempt + 1), RETRY_MS)
  } else {
    rect.value = null
    skip() // target not on this screen (e.g. no New campaign button for this role)
  }
}

// Re-anchor whenever the tour or step changes.
watch([activeTourId, stepIndex], () => {
  clearRetry()
  rect.value = null
  if (activeTour.value) nextTick(() => ensureTarget())
})

// Auto-start the matching tour on entering a route; drop a tour that doesn't belong here.
watch(
  () => route.name,
  (name) => {
    if (activeTour.value && activeTour.value.routeName !== name) close()
    const tour = tourForRoute(typeof name === 'string' ? name : undefined)
    if (startTimer) clearTimeout(startTimer)
    if (tour) startTimer = setTimeout(() => maybeAutoStart(tour.id), 400)
  },
  { immediate: true },
)

function reposition() {
  if (activeTour.value) measure()
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && activeTour.value) hideForNow()
}
onMounted(() => {
  window.addEventListener('scroll', reposition, true)
  window.addEventListener('resize', reposition)
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', reposition, true)
  window.removeEventListener('resize', reposition)
  window.removeEventListener('keydown', onKeydown)
  clearRetry()
  if (startTimer) clearTimeout(startTimer)
})

const spotlightStyle = computed(() => {
  const r = rect.value
  if (!r) return null
  return {
    top: `${r.top - PAD}px`,
    left: `${r.left - PAD}px`,
    width: `${r.width + PAD * 2}px`,
    height: `${r.height + PAD * 2}px`,
    boxShadow: '0 0 0 9999px rgba(17, 24, 39, 0.55)',
  }
})

const popoverStyle = computed<Record<string, string>>(() => {
  const r = rect.value
  if (!r) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: `${POPOVER_W}px` }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const left = Math.min(Math.max(r.left + r.width / 2 - POPOVER_W / 2, 12), vw - POPOVER_W - 12)
  const style: Record<string, string> = { left: `${left}px`, width: `${POPOVER_W}px` }
  const placeBelow = r.top + r.height / 2 < vh / 2
  if (placeBelow) style.top = `${r.top + r.height + 12}px`
  else style.bottom = `${vh - r.top + 12}px`
  return style
})
</script>

<template>
  <Teleport to="body">
    <div v-if="activeTour && currentStep" class="fixed inset-0 z-[100]">
      <!-- click catcher: blocks interaction with the page behind during the tour -->
      <div class="absolute inset-0"></div>

      <!-- spotlight cutout (dim comes from the huge box-shadow); falls back to a flat dim -->
      <div
        v-if="spotlightStyle"
        class="pointer-events-none absolute rounded-lg ring-2 ring-red-500 transition-all duration-200"
        :style="spotlightStyle"
      ></div>
      <div v-else class="absolute inset-0 bg-gray-900/55"></div>

      <!-- step popover -->
      <div
        class="pointer-events-auto fixed z-[102] rounded-xl border border-gray-200 bg-white p-4 shadow-modal"
        :style="popoverStyle"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-semibold text-gray-900">{{ currentStep.title }}</p>
          <button
            type="button"
            class="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close tutorial"
            @click="hideForNow"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>
        <p class="mt-1.5 text-sm text-gray-600">{{ currentStep.body }}</p>

        <div class="mt-3 flex items-center justify-between">
          <span class="text-xs font-medium text-gray-400">Step {{ stepIndex + 1 }} of {{ totalSteps }}</span>
          <UButton :label="isLastStep ? 'Finish' : 'Next'" color="primary" size="sm" @click="next" />
        </div>

        <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs">
          <button type="button" class="font-medium text-gray-500 hover:text-gray-700" @click="hideForNow">
            Hide for now
          </button>
          <button type="button" class="font-medium text-gray-400 hover:text-gray-600" @click="hideForever">
            Hide forever
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
