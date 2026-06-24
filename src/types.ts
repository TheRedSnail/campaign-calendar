export type CampaignStatus =
  | 'draft'
  | 'in_progress'
  | 'ready'
  | 'briefed'
  | 'in_production'

export type Brand = 'Loctite' | 'Technomelt' | 'Teroson' | 'Bonderite'

export interface CampaignAssets {
  emailBriefing: boolean
  landingPages: boolean
  forms: boolean
  trackingPixels: boolean
  translations: boolean
}

export interface Recipient {
  name: string
  role: string
}

export type ElementStage = 'Briefed' | 'Drafting' | 'In review' | 'Approved' | 'Live'
export type ElementStatus = 'On track' | 'At risk' | 'Overdue'

export interface ProductionElement {
  id: string
  name: string
  channel: string
  owner: string
  stage: ElementStage
  status: ElementStatus
  daysInStage: number
  due: string
  progress: number
}

export interface ProductionStage {
  label: ElementStage
  status: CampaignStatus
  caption: string
  avgAfter?: string
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
  stages: ProductionStage[]
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
