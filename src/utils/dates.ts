import type { Campaign } from '../types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Parse a yyyy-mm-dd string into a local Date (no TZ surprises). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function monthLabel(iso: string): string {
  const d = parseISO(iso)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function addMonths(iso: string, delta: number): string {
  const d = parseISO(iso)
  return toISO(new Date(d.getFullYear(), d.getMonth() + delta, 1))
}

export function shortDate(iso: string): string {
  const d = parseISO(iso)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

export interface DayCell {
  iso: string
  day: number
  inMonth: boolean
  isToday: boolean
}

/** Build a Monday-first month matrix covering the given month. */
export function buildMonthCells(monthISO: string, todayISO: string): DayCell[] {
  const first = parseISO(monthISO)
  const year = first.getFullYear()
  const month = first.getMonth()
  // JS getDay: 0=Sun..6=Sat. Convert to Monday-first offset.
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - startOffset)

  const cells: DayCell[] = []
  for (let i = 0; i < 35; i++) {
    const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
    const iso = toISO(d)
    cells.push({
      iso,
      day: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: iso === todayISO,
    })
  }
  return cells
}

export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export interface TimelineWeek {
  iso: string
  label: string // "Jun 1"
  weekLabel: string // "Week 1"
}

/** Anchored to the campaign-calendar timeline window: Jun 1 – Jul 5, 2026. */
export const TIMELINE_START = '2026-06-01'
export const TIMELINE_WEEKS = 5

export function buildTimelineWeeks(): TimelineWeek[] {
  const start = parseISO(TIMELINE_START)
  const weeks: TimelineWeek[] = []
  for (let i = 0; i < TIMELINE_WEEKS; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i * 7)
    weeks.push({
      iso: toISO(d),
      label: `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`,
      weekLabel: `Week ${i + 1}`,
    })
  }
  return weeks
}

const DAY_MS = 86400000

/** Fractional position [0,1] of an ISO date across the timeline window. */
export function timelineFraction(iso: string): number {
  const start = parseISO(TIMELINE_START).getTime()
  const span = TIMELINE_WEEKS * 7 * DAY_MS
  const pos = (parseISO(iso).getTime() - start) / span
  return Math.min(1, Math.max(0, pos))
}

/** Left/width percentages for a bar spanning start→end on the timeline. */
export function timelineBar(startISO: string, endISO: string): { left: number; width: number } {
  const left = timelineFraction(startISO)
  const right = timelineFraction(endISO)
  return { left: left * 100, width: Math.max(2, (right - left) * 100) }
}

export interface MonthBar {
  id: string
  campaign: Campaign
  lane: number
  startCol: number // 0-6 within the week
  endCol: number
  isStart: boolean // segment contains the campaign's real start day
}

/**
 * Lay campaigns out as multi-day bars over a 35-cell month grid.
 * Returns one array of bar segments per week row (5 weeks). A campaign that
 * spans week boundaries is split into one segment per week; lanes are assigned
 * greedily so a campaign keeps the same lane across the whole grid.
 */
export function buildMonthBars(cells: DayCell[], campaigns: Campaign[]): MonthBar[][] {
  const weeks: MonthBar[][] = [[], [], [], [], []]
  if (!cells.length) return weeks
  const gridStart = parseISO(cells[0].iso).getTime()
  const dayIdx = (iso: string) => Math.round((parseISO(iso).getTime() - gridStart) / DAY_MS)

  const items = campaigns
    .map((c) => ({ c, s: Math.max(0, dayIdx(c.startDate)), e: Math.min(34, dayIdx(c.endDate)), lane: 0 }))
    .filter((it) => it.e >= it.s && it.s <= 34 && it.e >= 0)
    .sort((a, b) => a.s - b.s || a.e - b.e)

  const laneEnds: number[] = []
  for (const it of items) {
    let lane = laneEnds.findIndex((end) => end < it.s)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(it.e)
    } else {
      laneEnds[lane] = it.e
    }
    it.lane = lane
  }

  for (const it of items) {
    const startWeek = Math.floor(it.s / 7)
    const endWeek = Math.floor(it.e / 7)
    for (let w = startWeek; w <= endWeek; w++) {
      weeks[w].push({
        id: it.c.id,
        campaign: it.c,
        lane: it.lane,
        startCol: w === startWeek ? it.s % 7 : 0,
        endCol: w === endWeek ? it.e % 7 : 6,
        isStart: w === startWeek,
      })
    }
  }
  return weeks
}
