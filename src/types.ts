export type CampaignStatus =
  | 'draft'
  | 'in_progress'
  | 'ready'
  | 'briefed'
  | 'in_production'

export type Brand = 'Loctite' | 'Technomelt' | 'Teroson' | 'Bonderite'

/** Email briefing, Landing pages, Forms — a question + an uploaded briefing doc. */
export interface BriefingAsset {
  selected: boolean
  brief: string
  reference?: string // optional, e.g. a landing-page reference URL
  briefingDoc: string // uploaded file name ('' = none; mock — no real upload)
}

/** Tracking pixel — placeholder text boxes (exact fields TBD). */
export interface TrackingAsset {
  selected: boolean
  provider: string
  pixelId: string
  events: string
}

/** Localization — add the languages the campaign needs. */
export interface LocalizationAsset {
  selected: boolean
  languages: string[]
}

export interface CampaignAssets {
  emailBriefing: BriefingAsset
  landingPages: BriefingAsset
  forms: BriefingAsset
  trackingPixels: TrackingAsset
  localization: LocalizationAsset
}

export type AssetKey = keyof CampaignAssets

export interface Recipient {
  name: string
  role: string
}

export type ProgressDot = 'gray' | 'blue' | 'amber' | 'green'

/** The 5 Azure DevOps work-item stages a ticket moves through (brief → go-live). */
export type TicketStage =
  | 'Briefed'
  | 'Accepted'
  | 'In progress'
  | 'Ready for UAT'
  | 'Live'

export type TicketSla = 'On track' | 'At risk' | 'Overdue'

/** One Azure DevOps work item — created per operational team when a brief is accepted. */
export interface DevOpsTicket {
  id: string // e.g. 'ADH-2041-EMAIL'
  campaignId: string
  team: string // operational team (derived from channels)
  title: string // deliverable summary
  stage: TicketStage
  sla: TicketSla
  assignee: string
  dueDate: string // display string, e.g. '08 Jul'
  /** Last state synced FROM Azure DevOps (read-only writeback; see supabase/functions/devops-webhook). */
  devopsId?: number
  devopsState?: string
  devopsUrl?: string
}

export interface Campaign {
  id: string
  name: string
  brand: Brand
  sbu: string
  status: CampaignStatus
  progress: number
  startDate: string // ISO yyyy-mm-dd
  endDate: string

  // Basics
  campaignType: string
  priority: string
  language: string
  costCenter: string

  /** Primary market — drives RUN-team visibility and is preselected from the owner's profile. */
  country: string

  // Targeting
  regions: string[]
  channels: string[]

  // Goal / CTA
  goal: string
  cta: string

  // Ownership
  owner: string
  ownerEmail: string

  /** Campaign coordinator (marketing-ops PM) — the single point of contact. */
  coordinator?: string

  notes: string
  assets: CampaignAssets

  recipients: Recipient[]
  briefId?: string
  briefedAt?: string

  /** Canonical production schedule (ISO yyyy-mm-dd) for in-flight campaigns.
   *  Drives both the production-Gantt axis and the coordinator go-live math. */
  briefedDate?: string
  goLiveDate?: string

  /** Last state synced FROM Azure DevOps for this campaign's CMPG work item (read-only). */
  devopsId?: number
  devopsState?: string
  devopsUrl?: string
}
