/** A single phase in the default production-timeline plan applied to every track.
 *  Durations are in business days (weekends are excluded by the Gantt axis). */
export interface TimelinePhase {
  key: 'briefing' | 'in_progress' | 'qa' | 'business_review'
  label: string
  days: number
}

/** Default per-track timeline: brief (day 0) → Ready for UAT (day 10), weekends excluded. */
export const DEFAULT_PHASES: TimelinePhase[] = [
  { key: 'briefing', label: 'Briefing', days: 1 },
  { key: 'in_progress', label: 'In progress', days: 5 },
  { key: 'qa', label: 'QA', days: 2 },
  { key: 'business_review', label: 'Business review', days: 2 },
]

/** Ready for UAT is the terminal milestone at sum(days) — not an editable phase row. */
export const UAT_LABEL = 'Ready for UAT'

export const STORAGE_KEY = 'cc:timeline-phases'
