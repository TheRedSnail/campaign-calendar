import type { Campaign, DevOpsTicket, TicketStage } from '../types'
import type { TimelinePhase } from '../data/timelineConfig'
import { fmtDate } from '../data/coordinator'
import { parseISO, toISO } from './dates'

/** A single row in the production-timeline Gantt, derived from one DevOps ticket.
 *  Positions are business-day indices on the axis (0 = brief date). */
export interface GanttRow {
  name: string // operational team
  ticketId: string
  stage: TicketStage // current-stage label shown above the bar
  statusLabel: string // left-column status ('On track' | 'At risk' | 'Overdue' | 'Complete')
  start: number
  doneEnd: number // end of the completed (blue) portion
  currentEnd: number // end of the current-stage (amber) portion
  end: number // end of the upcoming (gray) portion
  marker: 'open' | 'done' | 'risk'
}

/** A configured phase band (Briefing, In progress, …) drawn across the plot, in axis indices. */
export interface PhaseBand {
  key: string
  label: string
  start: number
  end: number
}

export interface ProductionTimeline {
  rows: GanttRow[]
  axisMax: number
  todayIdx: number
  goLiveIdx: number
  uatIdx: number // Ready-for-UAT milestone (= sum of phase durations)
  briefedIdx: number
  ticks: { label: string; idx: number }[]
  phaseBands: PhaseBand[]
}

const isWeekday = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6

/** Whole business days (Mon–Fri) between two ISO dates; 0 if `toISO` ≤ `fromISO`. */
export function businessDaysBetween(fromISO: string, toISOStr: string): number {
  const from = parseISO(fromISO)
  const to = parseISO(toISOStr)
  if (to <= from) return 0
  let count = 0
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  while (cur < to) {
    cur.setDate(cur.getDate() + 1)
    if (isWeekday(cur)) count++
  }
  return count
}

/** ISO date `n` business days after `fromISO`. */
export function addBusinessDays(fromISO: string, n: number): string {
  const d = parseISO(fromISO)
  let added = 0
  while (added < n) {
    d.setDate(d.getDate() + 1)
    if (isWeekday(d)) added++
  }
  return toISO(d)
}

/** Build the production-timeline view-model for a campaign from its DevOps tickets.
 *  Geometry is driven by the coordinator's phase config: each phase's business-day
 *  duration becomes an axis segment (the axis is already a business-day index, so
 *  weekends are excluded automatically). Tickets supply each track's current stage. */
export function buildProductionTimeline(
  c: Campaign,
  tickets: DevOpsTicket[],
  todayISO: string,
  phases: TimelinePhase[],
): ProductionTimeline {
  const briefedDate = c.briefedDate ?? c.startDate
  const goLiveDate = c.goLiveDate ?? c.endDate
  const goLiveIdx = Math.max(1, businessDaysBetween(briefedDate, goLiveDate))

  // Cumulative business-day offsets from the brief date — the end of each phase.
  const bounds: number[] = []
  let acc = 0
  for (const p of phases) {
    acc += Math.max(0, p.days)
    bounds.push(acc)
  }
  const uatIdx = bounds.length ? bounds[bounds.length - 1] : goLiveIdx

  const span = Math.max(goLiveIdx, uatIdx)
  const buffer = Math.max(2, Math.round(span * 0.2))
  const axisMax = span + buffer
  const todayIdx = Math.min(axisMax, businessDaysBetween(briefedDate, todayISO))

  // Phase bands (centred labels + tints) and boundary ticks (dates at each boundary).
  const phaseBands: PhaseBand[] = []
  let prev = 0
  phases.forEach((p, i) => {
    phaseBands.push({ key: p.key, label: p.label, start: prev, end: bounds[i] })
    prev = bounds[i]
  })

  const seen = new Set<number>()
  const ticks = [0, ...bounds]
    .filter((idx) => (seen.has(idx) ? false : (seen.add(idx), true)))
    .map((idx) => ({ idx, label: fmtDate(addBusinessDays(briefedDate, idx)) }))

  // Map each ticket's current stage onto the phase boundaries (done / current).
  const b0 = bounds[0] ?? 0 // end of Briefing
  const b1 = bounds[1] ?? b0 // end of In progress
  const STAGE_POS: Record<TicketStage, { done: number; current: number }> = {
    Briefed: { done: 0, current: b0 },
    Accepted: { done: b0, current: b0 },
    'In progress': { done: b0, current: b1 },
    'Ready for UAT': { done: uatIdx, current: uatIdx },
    Live: { done: uatIdx, current: uatIdx },
  }

  const rows: GanttRow[] = tickets.map((t) => {
    const f = STAGE_POS[t.stage]
    const isLive = t.stage === 'Live'
    const overdue = t.sla === 'Overdue' && !isLive
    return {
      name: t.team,
      ticketId: t.id,
      stage: t.stage,
      statusLabel: isLive ? 'Complete' : t.sla,
      start: 0,
      doneEnd: f.done,
      currentEnd: Math.min(uatIdx, f.current),
      end: isLive ? uatIdx : overdue ? axisMax : uatIdx,
      marker: isLive ? 'done' : t.sla === 'On track' ? 'open' : 'risk',
    }
  })

  return { rows, axisMax, todayIdx, goLiveIdx, uatIdx, briefedIdx: 0, ticks, phaseBands }
}
