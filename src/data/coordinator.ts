import type { Campaign, DevOpsTicket, ProgressDot, TicketSla, TicketStage } from '../types'

/** The 5 Azure DevOps work-item stages, in order. */
export const TICKET_STAGES: TicketStage[] = [
  'Briefed',
  'Accepted',
  'In progress',
  'Ready for UAT',
  'Live',
]

/** Stage → progress-dot colour (matches the calendar status tokens). */
export const STAGE_DOT: Record<TicketStage, ProgressDot> = {
  Briefed: 'gray',
  Accepted: 'blue',
  'In progress': 'amber',
  'Ready for UAT': 'blue',
  Live: 'green',
}

export const SLA_LIST: TicketSla[] = ['On track', 'At risk', 'Overdue']

/** Channel → operational team. Drives the DevOps ticket fan-out. */
export const CHANNEL_TEAM: Record<string, string> = {
  Email: 'CRM / Email',
  Web: 'Web & Landing',
  LinkedIn: 'Social',
  Social: 'Social',
  SEM: 'Paid Media',
  'Display banner': 'Paid Media',
  'Print / PDF': 'Creative / Print',
  'Distributor portal': 'Partner Ops',
}

/** Canonical team order (used for stable sorting + matrix columns). */
export const TEAM_ORDER = [
  'CRM / Email',
  'Web & Landing',
  'Social',
  'Paid Media',
  'Creative / Print',
  'Partner Ops',
]

export const TEAM_SLUG: Record<string, string> = {
  'CRM / Email': 'EMAIL',
  'Web & Landing': 'WEB',
  Social: 'SOCIAL',
  'Paid Media': 'PAID',
  'Creative / Print': 'PRINT',
  'Partner Ops': 'PARTNER',
}

export const TEAM_DEFAULT_ASSIGNEE: Record<string, string> = {
  'CRM / Email': 'S. Klein',
  'Web & Landing': 'A. Weber',
  Social: 'L. Vogel',
  'Paid Media': 'P. Adler',
  'Creative / Print': 'M. Roth',
  'Partner Ops': 'Markus Weber',
}

export const TEAM_DELIVERABLE: Record<string, string> = {
  'CRM / Email': 'Email build & send',
  'Web & Landing': 'Landing page + form + tracking',
  Social: 'Organic + paid social assets',
  'Paid Media': 'Search & display campaigns',
  'Creative / Print': 'Creative & print collateral',
  'Partner Ops': 'Distributor portal assets',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 'yyyy-mm-dd' → 'DD Mon'. */
export function fmtDate(iso: string): string {
  if (!iso) return '—'
  const [, m, d] = iso.split('-')
  const mi = Number(m) - 1
  return `${Number(d)} ${MONTHS[mi] ?? ''}`.trim()
}

/** Distinct operational teams a campaign needs, derived from its channels (stable order). */
export function teamsForChannels(channels: string[]): string[] {
  const set = new Set<string>()
  for (const ch of channels) {
    const t = CHANNEL_TEAM[ch]
    if (t) set.add(t)
  }
  const ordered = TEAM_ORDER.filter((t) => set.has(t))
  // Fallback so a channel-less campaign still produces work.
  return ordered.length ? ordered : ['CRM / Email']
}

/** Build the ticket set for a campaign that has just been accepted. */
export function generateTickets(campaign: Campaign): DevOpsTicket[] {
  const prefix = campaign.briefId ?? 'ADH-0000'
  const due = fmtDate(campaign.endDate)
  return teamsForChannels(campaign.channels).map((team) => ({
    id: `${prefix}-${TEAM_SLUG[team] ?? 'GEN'}`,
    campaignId: campaign.id,
    team,
    title: TEAM_DELIVERABLE[team] ?? 'Campaign work item',
    stage: 'Briefed' as TicketStage,
    sla: 'On track' as TicketSla,
    assignee: TEAM_DEFAULT_ASSIGNEE[team] ?? 'Unassigned',
    dueDate: due,
  }))
}

const t = (
  id: string,
  campaignId: string,
  team: string,
  stage: TicketStage,
  sla: TicketSla,
  assignee: string,
  dueDate: string,
): DevOpsTicket => ({ id, campaignId, team, title: TEAM_DELIVERABLE[team], stage, sla, assignee, dueDate })

/** Tickets for the campaigns that start life already in production (see campaigns.ts). */
export const seedTickets: DevOpsTicket[] = [
  // Loctite 243 Relaunch — the hero campaign; Web & Landing is the overdue bottleneck.
  t('ADH-2031-EMAIL', 'loctite-243-relaunch', 'CRM / Email', 'Ready for UAT', 'On track', 'S. Klein', '02 Jul'),
  t('ADH-2031-WEB', 'loctite-243-relaunch', 'Web & Landing', 'Briefed', 'Overdue', 'Unassigned', '30 Jun'),
  t('ADH-2031-PAID', 'loctite-243-relaunch', 'Paid Media', 'Live', 'On track', 'P. Adler', '24 Jun'),
  t('ADH-2031-SOCIAL', 'loctite-243-relaunch', 'Social', 'In progress', 'On track', 'L. Vogel', '01 Jul'),
  // Technomelt EMEA Push
  t('ADH-2034-EMAIL', 'technomelt-emea-push', 'CRM / Email', 'In progress', 'On track', 'S. Klein', '03 Jul'),
  t('ADH-2034-PAID', 'technomelt-emea-push', 'Paid Media', 'In progress', 'At risk', 'P. Adler', '03 Jul'),
  // Teroson Q3 Industrial Push
  t('ADH-2036-EMAIL', 'teroson-q3-industrial-push', 'CRM / Email', 'In progress', 'On track', 'S. Klein', '08 Jul'),
  t('ADH-2036-SOCIAL', 'teroson-q3-industrial-push', 'Social', 'In progress', 'On track', 'L. Vogel', '08 Jul'),
]
