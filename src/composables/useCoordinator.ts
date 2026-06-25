import { computed, reactive } from 'vue'
import type { Campaign, DevOpsTicket, TicketSla, TicketStage } from '../types'
import { useCampaigns } from './useCampaigns'
import { OWNER_OPTIONS, TODAY } from '../data/options'
import {
  generateTickets,
  seedTickets,
  STAGE_DOT,
  TEAM_ORDER,
  TICKET_STAGES,
} from '../data/coordinator'

const { campaigns } = useCampaigns()

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

interface CoordState {
  tickets: DevOpsTicket[]
}

const state = reactive<CoordState>({
  tickets: clone(seedTickets),
})

// ---- helpers -------------------------------------------------------------

const stageIndex = (s: TicketStage) => TICKET_STAGES.indexOf(s)
const SLA_RANK: Record<TicketSla, number> = { 'On track': 0, 'At risk': 1, Overdue: 2 }

export function ticketsFor(id: string): DevOpsTicket[] {
  return state.tickets.filter((t) => t.campaignId === id)
}

/** Least-advanced stage across a campaign's tickets (the stage it's "at"). */
export function campaignStage(c: Campaign): TicketStage {
  const ts = ticketsFor(c.id)
  if (!ts.length) return 'Briefed'
  return ts.reduce((min, t) => (stageIndex(t.stage) < stageIndex(min) ? t.stage : min), ts[0].stage)
}

/** 0–100 from the average stage index across tickets. */
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
    const d = daysBetween(TODAY, c.endDate)
    return d >= 0 && d <= 7
  })
  return {
    briefsToAction: triage.value.length,
    inFlight: inFlight.value.length,
    atRisk: atRiskTickets.value.length,
    atRiskCampaigns: riskCampaigns.size,
    goLivesThisWeek: goLives.length,
    nextGoLive: [...inFlight.value].sort((a, b) => a.endDate.localeCompare(b.endDate))[0] ?? null,
  }
})

const myCampaigns = computed(() =>
  campaigns.value
    .filter((c) => (c.status === 'in_production' || c.status === 'briefed') && c.coordinator === 'Jan Stoker')
    .sort((a, b) => SLA_RANK[campaignSla(b)] - SLA_RANK[campaignSla(a)]),
)

const upcomingGoLives = computed(() =>
  [...inFlight.value].sort((a, b) => a.endDate.localeCompare(b.endDate)).slice(0, 5),
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
    .sort((a, b) => SLA_RANK[b.sla] - SLA_RANK[a.sla] || a.campaign.endDate.localeCompare(b.campaign.endDate)),
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
    avgCycle: '9.4 d',
    cycleByStage: STATIC_CYCLE,
    bottleneck,
    stageLoad: load,
    // illustrative 6-month trends; final SLA bar ties to the live number
    slaTrend: [78, 82, 80, 85, 88, slaPct],
    throughputTrend: [3, 4, 2, 5, 4, 3],
    trendMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  }
})

function campaignName(id: string): string {
  return campaigns.value.find((c) => c.id === id)?.name ?? id
}

export const ASSIGNEE_OPTIONS = [...OWNER_OPTIONS, 'Unassigned']

// ---- actions -------------------------------------------------------------

/** Accept a brief → fan out one DevOps ticket per operational team, go in_production. */
function acceptBrief(campaignId: string) {
  const c = campaigns.value.find((x) => x.id === campaignId)
  if (!c) return
  if (!ticketsFor(campaignId).length) state.tickets.push(...generateTickets(c))
  c.status = 'in_production'
}

/** Send a brief back to the owner for changes. */
function requestChanges(campaignId: string) {
  const c = campaigns.value.find((x) => x.id === campaignId)
  if (c) c.status = 'ready'
}

function setTicketStage(id: string, stage: TicketStage) {
  const t = state.tickets.find((x) => x.id === id)
  if (!t) return
  t.stage = stage
  if (stage === 'Live') t.sla = 'On track'
}

function setTicketSla(id: string, sla: TicketSla) {
  const t = state.tickets.find((x) => x.id === id)
  if (t) t.sla = sla
}

function setTicketAssignee(id: string, assignee: string) {
  const t = state.tickets.find((x) => x.id === id)
  if (t) t.assignee = assignee
}

export function useCoordinator() {
  return {
    tickets: computed(() => state.tickets),
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
    campaignProgress,
    campaignSla,
    riskCount,
    campaignName,
    // actions
    acceptBrief,
    requestChanges,
    setTicketStage,
    setTicketSla,
    setTicketAssignee,
  }
}
