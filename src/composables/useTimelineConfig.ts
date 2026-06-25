import { computed, reactive } from 'vue'
import {
  DEFAULT_PHASES,
  STORAGE_KEY,
  type TimelinePhase,
} from '../data/timelineConfig'

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

/** Load persisted phases from localStorage, falling back to the defaults.
 *  Validates against the default key set so a stale/corrupt blob can't break the view. */
function loadPhases(): TimelinePhase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return clone(DEFAULT_PHASES)
    const saved = JSON.parse(raw) as TimelinePhase[]
    // Keep the canonical order/labels from DEFAULT_PHASES; only adopt saved day counts.
    return DEFAULT_PHASES.map((d) => {
      const match = saved.find((p) => p.key === d.key)
      const days = match && Number.isFinite(match.days) && match.days >= 0 ? match.days : d.days
      return { ...d, days }
    })
  } catch {
    return clone(DEFAULT_PHASES)
  }
}

interface ConfigState {
  phases: TimelinePhase[]
}

const state = reactive<ConfigState>({
  phases: loadPhases(),
})

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.phases))
  } catch {
    // localStorage unavailable (private mode / quota) — config stays in-memory for the session.
  }
}

/** Cumulative business-day offsets, i.e. the axis index at the end of each phase. */
const boundaries = computed(() => {
  const out: number[] = []
  let acc = 0
  for (const p of state.phases) {
    acc += Math.max(0, p.days)
    out.push(acc)
  }
  return out
})

/** Total business days brief → Ready for UAT (the UAT milestone index). */
const totalDays = computed(() => boundaries.value[boundaries.value.length - 1] ?? 0)

function setPhaseDays(key: TimelinePhase['key'], days: number) {
  const p = state.phases.find((x) => x.key === key)
  if (!p) return
  p.days = Number.isFinite(days) && days >= 0 ? Math.round(days) : 0
  persist()
}

function resetToDefaults() {
  state.phases = clone(DEFAULT_PHASES)
  persist()
}

export function useTimelineConfig() {
  return {
    phases: computed(() => state.phases),
    boundaries,
    totalDays,
    setPhaseDays,
    resetToDefaults,
  }
}
