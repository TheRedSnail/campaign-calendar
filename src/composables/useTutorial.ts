import { computed, reactive, toRefs } from 'vue'
import { useAuth } from './useAuth'
import { TOURS, tourById, type Tour } from '../data/tutorial'

// Module-level reactive store (same pattern as useCampaigns / useTimelineConfig — no Pinia).
//
// Two kinds of dismissal:
//   • "Hide for now"  → sessionStorage: clears when the browser session ends, so the tour
//                       pops up again next session.
//   • "Hide forever"  → localStorage, keyed per user id: never auto-starts again. Finishing a
//                       tour counts the same way (you've seen it).
// Both are wrapped in try/catch so private-mode / quota errors degrade to in-memory only.

const SEEN_KEY = 'tutorial-seen-v1' // localStorage; suffixed with the user id
const SESSION_KEY = 'tutorial-hidden-session-v1' // sessionStorage

interface TutorialState {
  activeTourId: string | null
  stepIndex: number
  seen: string[] // tour ids finished or hidden forever (persisted per user)
  hiddenSession: string[] // tour ids hidden for this session
}

function loadHiddenSession(): string[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

const state = reactive<TutorialState>({
  activeTourId: null,
  stepIndex: 0,
  seen: [],
  hiddenSession: loadHiddenSession(),
})

// The auth session ref is module-stable; read the current user id when keying storage.
const { session } = useAuth()
const seenKey = () => `${SEEN_KEY}:${session.value?.user.id ?? 'anon'}`

function loadSeen() {
  try {
    const raw = localStorage.getItem(seenKey())
    state.seen = raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    state.seen = []
  }
}

function persistSeen() {
  try {
    localStorage.setItem(seenKey(), JSON.stringify(state.seen))
  } catch {
    /* storage unavailable — keep in memory for the session */
  }
}

function persistHiddenSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.hiddenSession))
  } catch {
    /* storage unavailable */
  }
}

function markSeen(id: string | null) {
  if (id && !state.seen.includes(id)) {
    state.seen.push(id)
    persistSeen()
  }
}

const activeTour = computed<Tour | null>(() => tourById(state.activeTourId) ?? null)
const currentStep = computed(() => activeTour.value?.steps[state.stepIndex] ?? null)
const totalSteps = computed(() => activeTour.value?.steps.length ?? 0)
const isLastStep = computed(() => state.stepIndex >= totalSteps.value - 1)

function close() {
  state.activeTourId = null
  state.stepIndex = 0
}

/** Launch a tour explicitly (header button) — ignores the dismissed sets. */
function startTour(id: string) {
  if (!TOURS.some((t) => t.id === id)) return
  state.activeTourId = id
  state.stepIndex = 0
}

/** Auto-launch on entering a route, unless seen-forever or hidden this session. */
function maybeAutoStart(id: string) {
  if (state.activeTourId) return
  loadSeen()
  if (state.seen.includes(id) || state.hiddenSession.includes(id)) return
  startTour(id)
}

function next() {
  if (!activeTour.value) return
  if (state.stepIndex < totalSteps.value - 1) state.stepIndex += 1
  else finish()
}

/** Advance past a step whose target isn't on screen, without counting as "finished". */
function skip() {
  if (!activeTour.value) return
  if (state.stepIndex < totalSteps.value - 1) state.stepIndex += 1
  else close()
}

function finish() {
  markSeen(state.activeTourId) // completing means you've seen it
  close()
}

function hideForNow() {
  if (state.activeTourId && !state.hiddenSession.includes(state.activeTourId)) {
    state.hiddenSession.push(state.activeTourId)
    persistHiddenSession()
  }
  close()
}

function hideForever() {
  markSeen(state.activeTourId)
  close()
}

export function useTutorial() {
  return {
    ...toRefs(state),
    activeTour,
    currentStep,
    totalSteps,
    isLastStep,
    startTour,
    maybeAutoStart,
    next,
    skip,
    finish,
    hideForNow,
    hideForever,
    close,
  }
}
