import type { Campaign, DevOpsTicket, Recipient, TicketSla, TicketStage } from '../types'
import type { Database } from '../types/database'
import { normalizeAssets } from './campaigns'

type CampaignRow = Database['public']['Tables']['campaigns']['Row']
type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
type TicketRow = Database['public']['Tables']['devops_tickets']['Row']
type TicketInsert = Database['public']['Tables']['devops_tickets']['Insert']

const str = (v: string | null | undefined) => v ?? ''
/** A `date`/`text` column that is empty in the UI must become SQL NULL, not ''. */
const nullable = (v: string | undefined) => (v && v.length ? v : null)

// ---- campaigns -----------------------------------------------------------

export function rowToCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    name: str(row.name),
    brand: (row.brand || 'Next Henkel Adhesives') as Campaign['brand'],
    sbu: str(row.sbu),
    country: str(row.country),
    website: str(row.website),
    status: row.status,
    progress: row.progress ?? 0,
    startDate: str(row.start_date),
    endDate: str(row.end_date),
    campaignType: str(row.campaign_type),
    priority: str(row.priority),
    language: str(row.language),
    costCenter: str(row.cost_center),
    regions: row.regions ?? [],
    channels: row.channels ?? [],
    goal: str(row.goal),
    cta: str(row.cta),
    owner: str(row.owner),
    ownerEmail: str(row.owner_email),
    watchers: row.watchers ?? [],
    coordinator: row.coordinator ?? undefined,
    notes: str(row.notes),
    assets: normalizeAssets(row.assets),
    recipients: (row.recipients as unknown as Recipient[]) ?? [],
    briefId: row.brief_id ?? undefined,
    briefedAt: row.briefed_at ?? undefined,
    briefedDate: row.briefed_date ?? undefined,
    goLiveDate: row.go_live_date ?? undefined,
    devopsId: row.devops_id ?? undefined,
    devopsState: row.devops_state ?? undefined,
    devopsUrl: row.devops_url ?? undefined,
  }
}

/** Build a DB row patch. Omits `id`/`created_by` so the server owns them on insert. */
export function campaignToRow(c: Campaign): CampaignInsert {
  return {
    name: c.name,
    brand: c.brand,
    sbu: c.sbu,
    country: c.country,
    website: c.website,
    status: c.status,
    progress: c.progress,
    start_date: nullable(c.startDate),
    end_date: nullable(c.endDate),
    campaign_type: c.campaignType,
    priority: c.priority,
    language: c.language,
    cost_center: c.costCenter,
    regions: c.regions,
    channels: c.channels,
    goal: c.goal,
    cta: c.cta,
    owner: c.owner,
    owner_email: c.ownerEmail,
    watchers: c.watchers,
    coordinator: c.coordinator ?? null,
    notes: c.notes,
    assets: c.assets as unknown as CampaignInsert['assets'],
    recipients: c.recipients as unknown as CampaignInsert['recipients'],
    brief_id: c.briefId ?? null,
    briefed_at: c.briefedAt ?? null,
    briefed_date: nullable(c.briefedDate),
    go_live_date: nullable(c.goLiveDate),
  }
}

// ---- tickets -------------------------------------------------------------

export function rowToTicket(row: TicketRow): DevOpsTicket {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    team: row.team,
    title: str(row.title),
    stage: row.stage as TicketStage,
    sla: row.sla as TicketSla,
    assignee: str(row.assignee),
    dueDate: str(row.due_date),
    devopsId: row.devops_id ?? undefined,
    devopsState: row.devops_state ?? undefined,
    devopsUrl: row.devops_url ?? undefined,
  }
}

export function ticketToRow(t: DevOpsTicket): TicketInsert {
  return {
    id: t.id,
    campaign_id: t.campaignId,
    team: t.team,
    title: t.title,
    stage: t.stage,
    sla: t.sla,
    assignee: t.assignee,
    due_date: t.dueDate,
  }
}

export function campaignToAzure(c: Campaign) {

  return {
    cam_name: c.name,
    sbu: c.sbu, // from sbus
    brand: c.brand, // from websites
    cam_type: c.campaignType,
    priority: c.priority,
    language: c.language,
    cost_center: c.costCenter,
    start_date: c.startDate, //date
    end_date: c.endDate, //date
    region: c.regions.join(),
    channels: c.regions.join(),
    goal: c.goal,
    cta: c.cta,
    owner: c.owner, //user name
    owner_email: c.ownerEmail,// user email
    files: [],
    "briefing_email": c.assets.emails.selected,
    "briefing_form": c.assets.forms.selected,
    "briefing_translation": c.assets.localization.selected,
    "briefing_website": c.assets.landingPages.selected,
    "briefing_tracking": c.assets.trackingPixels.selected,
    notes: c.notes // passed into desription
  }
}