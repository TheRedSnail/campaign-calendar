import { computed, reactive } from 'vue'
import type { Campaign, DevOpsTicket, TicketSla, TicketStage } from '../types'
import { useCampaigns } from './useCampaigns'
import { useAuth } from './useAuth'
import { OWNER_OPTIONS, TODAY } from '../data/options'
import {
  generateTickets,
  STAGE_DOT,
  TEAM_ORDER,
  TICKET_STAGES,
} from '../data/coordinator'
import { supabase } from '../lib/supabase'
import { rowToTicket, ticketToRow } from '../data/mappers'

const { campaigns } = useCampaigns()
const { profile } = useAuth()

interface CoordState {
  tickets: DevOpsTicket[]
}

const state = reactive<CoordState>({
  tickets: [], // hydrated from Supabase after auth (see loadTickets)
})

/** Replace the local ticket set from Supabase (RLS scopes to visible campaigns). */
async function loadTickets() {
  const { data, error } = await supabase.from('devops_tickets').select('*')
  if (error) {
    console.error('loadTickets', error)
    return
  }
  state.tickets = (data ?? []).map(rowToTicket)
}

function resetTickets() {
  state.tickets = []
}

// ---- helpers -------------------------------------------------------------

const stageIndex = (s: TicketStage) => TICKET_STAGES.indexOf(s)
const SLA_RANK: Record<TicketSla, number> = { 'On track': 0, 'At risk': 1, Overdue: 2 }
const IDX_IN_PROGRESS = stageIndex('In progress')
const IDX_READY = stageIndex('Ready for UAT')

/** Canonical go-live date for a campaign (falls back to its schedule end). */
const goLiveOf = (c: Campaign) => c.goLiveDate ?? c.endDate

export function ticketsFor(id: string): DevOpsTicket[] {
  return state.tickets.filter((t) => t.campaignId === id)
}

/**
 * The single campaign-stage rule used everywhere (steppers, funnel, portfolio):
 *   Briefed       — not accepted yet (still in triage)
 *   Accepted      — accepted, but no child ticket has started
 *   In progress   — at least one child ticket is In progress (or beyond)
 *   Ready for UAT — every child ticket is at Ready for UAT or beyond
 *   Live          — the campaign (parent) is live: every child ticket is Live
 */
export function campaignStage(c: Campaign): TicketStage {
  if (c.status !== 'in_production') return 'Briefed'
  const ts = ticketsFor(c.id)
  if (!ts.length) return 'Accepted'
  if (ts.every((t) => t.stage === 'Live')) return 'Live'
  if (ts.every((t) => stageIndex(t.stage) >= IDX_READY)) return 'Ready for UAT'
  if (ts.some((t) => stageIndex(t.stage) >= IDX_IN_PROGRESS)) return 'In progress'
  return 'Accepted'
}

/** Index of the campaign stage in TICKET_STAGES — drives every stepper. */
export function campaignStageIndex(c: Campaign): number {
  return stageIndex(campaignStage(c))
}

/** 0–100 from the average stage index across tickets (continuous progress bar). */
export function campaignProgress(c: Campaign): number {
  const ts = ticketsFor(c.id)
  if (!ts.length) return 0
  const avg = ts.reduce((s, t) => s + stageIndex(t.stage), 0) / ts.length
  return Math.round((avg / (TICKET_STAGES.length - 1)) * 100)
}

/** Worst SLA across a campaign's tickets. */
export function campaignSla(c: Campaign): TicketSla {
  const ts = ticketsFor(c.id)
  let worst: TicketSla = 'On track'
  for (const t of ts) if (SLA_RANK[t.sla] > SLA_RANK[worst]) worst = t.sla
  return worst
}

export function riskCount(c: Campaign): number {
  return ticketsFor(c.id).filter((t) => t.sla !== 'On track').length
}

/** Ticket SLA tally for a campaign (reused by KPI captions). */
export function slaBreakdown(c: Campaign) {
  const ts = ticketsFor(c.id)
  return {
    total: ts.length,
    onTrack: ts.filter((t) => t.sla === 'On track').length,
    atRisk: ts.filter((t) => t.sla === 'At risk').length,
    overdue: ts.filter((t) => t.sla === 'Overdue').length,
  }
}

const parse = (iso: string) => new Date(iso + 'T00:00:00')
const daysBetween = (a: string, b: string) =>
  Math.round((parse(b).getTime() - parse(a).getTime()) / 86_400_000)

// ---- computeds (everything the dashboards read) --------------------------

const inFlight = computed(() => campaigns.value.filter((c) => c.status === 'in_production'))

const triage = computed(() =>
  campaigns.value
    .filter((c) => c.status === 'briefed')
    .sort((a, b) => a.endDate.localeCompare(b.endDate)),
)

const atRiskTickets = computed(() => state.tickets.filter((t) => t.sla !== 'On track'))

const dashboardKpis = computed(() => {
  const riskCampaigns = new Set(atRiskTickets.value.map((t) => t.campaignId))
  const goLives = inFlight.value.filter((c) => {
    const d = daysBetween(TODAY, goLiveOf(c))
    return d >= 0 && d <= 7
  })
  return {
    briefsToAction: triage.value.length,
    inFlight: inFlight.value.length,
    atRisk: atRiskTickets.value.length,
    atRiskCampaigns: riskCampaigns.size,
    goLivesThisWeek: goLives.length,
    nextGoLive: [...inFlight.value].sort((a, b) => goLiveOf(a).localeCompare(goLiveOf(b)))[0] ?? null,
  }
})

const myCampaigns = computed(() =>
  campaigns.value
    .filter(
      (c) =>
        (c.status === 'in_production' || c.status === 'briefed') &&
        c.coordinator === profile.value?.full_name,
    )
    .sort((a, b) => SLA_RANK[campaignSla(b)] - SLA_RANK[campaignSla(a)]),
)

const upcomingGoLives = computed(() =>
  [...inFlight.value].sort((a, b) => goLiveOf(a).localeCompare(goLiveOf(b))).slice(0, 5),
)

const pipelineCounts = computed(() => {
  const counts: Record<TicketStage, number> = {} as Record<TicketStage, number>
  for (const s of TICKET_STAGES) counts[s] = 0
  for (const c of inFlight.value) counts[campaignStage(c)]++
  return TICKET_STAGES.map((stage) => ({ stage, count: counts[stage], dot: STAGE_DOT[stage] }))
})

const portfolioRows = computed(() =>
  inFlight.value
    .map((c) => ({
      campaign: c,
      stage: campaignStage(c),
      progress: campaignProgress(c),
      sla: campaignSla(c),
      risk: riskCount(c),
    }))
    .sort((a, b) => SLA_RANK[b.sla] - SLA_RANK[a.sla] || goLiveOf(a.campaign).localeCompare(goLiveOf(b.campaign))),
)

export interface TeamLoad {
  team: string
  open: number
  inProgress: number
  inReview: number
  overdue: number
  load: number
  campaigns: string[]
  byStage: Record<TicketStage, number>
}

const teamWorkload = computed<TeamLoad[]>(() => {
  const rows = TEAM_ORDER.map((team) => {
    const ts = state.tickets.filter((t) => t.team === team)
    const byStage = {} as Record<TicketStage, number>
    for (const s of TICKET_STAGES) byStage[s] = 0
    for (const t of ts) byStage[t.stage]++
    const open = ts.filter((t) => t.stage !== 'Live').length
    const names = [...new Set(ts.map((t) => campaignName(t.campaignId)))]
    return {
      team,
      open,
      inProgress: byStage['In progress'],
      inReview: byStage['Ready for UAT'],
      overdue: ts.filter((t) => t.sla === 'Overdue').length,
      load: 0,
      campaigns: names,
      byStage,
    }
  })
  const maxOpen = Math.max(1, ...rows.map((r) => r.open))
  for (const r of rows) r.load = Math.round((r.open / maxOpen) * 100)
  return rows
})

const STATIC_CYCLE: { stage: TicketStage; days: number }[] = [
  { stage: 'Briefed', days: 0.5 },
  { stage: 'Accepted', days: 0.6 },
  { stage: 'In progress', days: 5.2 },
  { stage: 'Ready for UAT', days: 1.6 },
]
/** Total briefed→live cycle, derived from the per-stage figures above. */
const AVG_CYCLE_DAYS = STATIC_CYCLE.reduce((s, r) => s + r.days, 0)

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** Trailing 6 month labels ending at the current month (from TODAY). */
const TREND_MONTHS = (() => {
  const m = new Date(TODAY + 'T00:00:00').getMonth()
  return Array.from({ length: 6 }, (_, i) => MONTH_ABBR[(m - 5 + i + 12) % 12])
})()

const analytics = computed(() => {
  const total = state.tickets.length || 1
  const onTrack = state.tickets.filter((t) => t.sla === 'On track').length
  const slaPct = Math.round((onTrack / total) * 100)
  const live = state.tickets.filter((t) => t.stage === 'Live').length
  // live "current load" per stage → bottleneck = busiest non-terminal stage
  const load: Record<TicketStage, number> = {} as Record<TicketStage, number>
  for (const s of TICKET_STAGES) load[s] = 0
  for (const t of state.tickets) load[t.stage]++
  let bottleneck = STATIC_CYCLE[0]
  for (const row of STATIC_CYCLE) if (row.days > bottleneck.days) bottleneck = row
  return {
    slaPct,
    atRisk: atRiskTickets.value.length,
    live,
    avgCycle: `${AVG_CYCLE_DAYS.toFixed(1)} d`,
    cycleByStage: STATIC_CYCLE,
    bottleneck,
    stageLoad: load,
    // Historical trends: illustrative seed (a prototype has no past data to derive
    // from). The final SLA bar ties to the live number; months derive from TODAY.
    slaTrend: [78, 82, 80, 85, 88, slaPct],
    throughputTrend: [3, 4, 2, 5, 4, 3],
    trendMonths: TREND_MONTHS,
  }
})

function campaignName(id: string): string {
  return campaigns.value.find((c) => c.id === id)?.name ?? id
}

export const ASSIGNEE_OPTIONS = [...OWNER_OPTIONS, 'Unassigned']

// ---- actions -------------------------------------------------------------

/** Accept a brief → atomically fan out one DevOps ticket per team and go in_production. */
async function acceptBrief(campaignId: string) {
  const c = campaigns.value.find((x) => x.id === campaignId)
  if (!c) return
  const newTickets = ticketsFor(campaignId).length ? [] : generateTickets(c)
  const { error } = await supabase.rpc('accept_brief', {
    p_campaign_id: campaignId,
    p_tickets: newTickets.map(ticketToRow),
  })
  if (error) {
    console.error('acceptBrief', error)
    return
  }
  c.status = 'in_production'
  if (newTickets.length) state.tickets.push(...newTickets)
}

/** Send a brief back to the owner for changes. */
async function requestChanges(campaignId: string) {
  const c = campaigns.value.find((x) => x.id === campaignId)
  if (!c) return
  const prev = c.status
  c.status = 'ready'
  const { error } = await supabase.from('campaigns').update({ status: 'ready' }).eq('id', campaignId)
  if (error) {
    c.status = prev
    console.error('requestChanges', error)
  }
}

async function setTicketStage(id: string, stage: TicketStage) {
  const t = state.tickets.find((x) => x.id === id)
  if (!t) return
  const prev = { stage: t.stage, sla: t.sla }
  t.stage = stage
  if (stage === 'Live') t.sla = 'On track'
  const { error } = await supabase.from('devops_tickets').update({ stage: t.stage, sla: t.sla }).eq('id', id)
  if (error) {
    t.stage = prev.stage
    t.sla = prev.sla
    console.error('setTicketStage', error)
  }
}

async function setTicketSla(id: string, sla: TicketSla) {
  const t = state.tickets.find((x) => x.id === id)
  if (!t) return
  const prev = t.sla
  t.sla = sla
  const { error } = await supabase.from('devops_tickets').update({ sla }).eq('id', id)
  if (error) {
    t.sla = prev
    console.error('setTicketSla', error)
  }
}

async function setTicketAssignee(id: string, assignee: string) {
  const t = state.tickets.find((x) => x.id === id)
  if (!t) return
  const prev = t.assignee
  t.assignee = assignee
  const { error } = await supabase.from('devops_tickets').update({ assignee }).eq('id', id)
  if (error) {
    t.assignee = prev
    console.error('setTicketAssignee', error)
  }
}

export function useCoordinator() {
  return {
    tickets: computed(() => state.tickets),
    loadTickets,
    resetTickets,
    inFlight,
    triage,
    myCampaigns,
    upcomingGoLives,
    dashboardKpis,
    pipelineCounts,
    portfolioRows,
    teamWorkload,
    analytics,
    // derived helpers
    ticketsFor,
    campaignStage,
    campaignStageIndex,
    campaignProgress,
    campaignSla,
    riskCount,
    slaBreakdown,
    campaignName,
    // actions
    acceptBrief,
    requestChanges,
    setTicketStage,
    setTicketSla,
    setTicketAssignee,
  }
}
