import type { Campaign, DevOpsTicket, TicketStage } from '../types'
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

export interface ProductionTimeline {
  rows: GanttRow[]
  axisMax: number
  todayIdx: number
  goLiveIdx: number
  briefedIdx: number
  ticks: { label: string; idx: number }[]
}

/** Fraction of the briefed→go-live span a ticket has covered at each stage:
 *  `done` = end of the completed (blue) bar, `current` = end of the active (amber) bar. */
const STAGE_FRACTION: Record<TicketStage, { done: number; current: number }> = {
  Briefed: { done: 0, current: 0.08 },
  Accepted: { done: 0.1, current: 0.22 },
  'In progress': { done: 0.25, current: 0.62 },
  'Ready for UAT': { done: 0.66, current: 0.88 },
  Live: { done: 1, current: 1 },
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
 *  Tickets are the single source of truth — geometry, axis and labels all derive
 *  from ticket stages/SLA and the campaign's canonical brief/go-live dates. */
export function buildProductionTimeline(
  c: Campaign,
  tickets: DevOpsTicket[],
  todayISO: string,
): ProductionTimeline {
  const briefedDate = c.briefedDate ?? c.startDate
  const goLiveDate = c.goLiveDate ?? c.endDate
  const goLiveIdx = Math.max(1, businessDaysBetween(briefedDate, goLiveDate))
  const buffer = Math.max(2, Math.round(goLiveIdx * 0.2))
  const axisMax = goLiveIdx + buffer
  const todayIdx = Math.min(axisMax, businessDaysBetween(briefedDate, todayISO))

  const ticks: { label: string; idx: number }[] = []
  for (let i = 0; i <= goLiveIdx; i += 5) {
    ticks.push({ label: fmtDate(addBusinessDays(briefedDate, i)), idx: i })
  }

  const rows: GanttRow[] = tickets.map((t) => {
    const f = STAGE_FRACTION[t.stage]
    const isLive = t.stage === 'Live'
    const overdue = t.sla === 'Overdue' && !isLive
    return {
      name: t.team,
      ticketId: t.id,
      stage: t.stage,
      statusLabel: isLive ? 'Complete' : t.sla,
      start: 0,
      doneEnd: f.done * goLiveIdx,
      currentEnd: isLive ? goLiveIdx : Math.min(goLiveIdx, f.current * goLiveIdx),
      end: isLive ? goLiveIdx : overdue ? axisMax : goLiveIdx,
      marker: isLive ? 'done' : t.sla === 'On track' ? 'open' : 'risk',
    }
  })

  return { rows, axisMax, todayIdx, goLiveIdx, briefedIdx: 0, ticks }
}
