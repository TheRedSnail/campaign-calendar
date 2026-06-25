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

/** Simplified per-element production-timeline stages. */
export type ElementStage =
  | 'Briefed'
  | 'In progress'
  | 'QA'
  | 'Business review'
  | 'Ready for UAT'
  | 'Live'

export type ElementStatus = 'On track' | 'At risk' | 'Complete'

export type ProgressDot = 'gray' | 'blue' | 'amber' | 'green'

/** A stage in the overarching campaign-progress stepper (broader statuses). */
export interface CampaignProgressStage {
  label: string
  dot: ProgressDot
  count: string // e.g. "5/5"
  avgAfter?: string // Ø time to the next stage
}

/**
 * A row in the production-timeline Gantt. Positions are business-day indices
 * along the timeline axis (0 = brief date, see AXIS in ProductionView).
 */
export interface ProductionElement {
  name: string
  status: ElementStatus
  currentStage: ElementStage
  start: number
  doneEnd: number // end of the completed (blue) portion
  currentEnd: number // end of the current-stage (amber) portion
  end: number // end of the upcoming (gray) portion
  marker: 'open' | 'done' | 'risk'
}

export interface ProductionData {
  briefedDate: string
  goLiveDate: string
  overallProgress: number
  avgThroughput: string
  avgThroughputCaption: string
  sla: string
  slaCaption: string
  timeToGoLive: string
  timeToGoLiveCaption: string
  progressStages: CampaignProgressStage[]
  elements: ProductionElement[]
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

  // Targeting
  regions: string[]
  channels: string[]

  // Goal / CTA
  goal: string
  cta: string

  // Ownership
  owner: string
  ownerEmail: string

  notes: string
  assets: CampaignAssets

  recipients: Recipient[]
  briefId?: string
  briefedAt?: string

  production?: ProductionData
}
