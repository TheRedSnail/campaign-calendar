import type { Brand, CampaignStatus } from '../types'
import type { AppRole } from '../types/database'

export const TODAY = '2026-06-24'

/** Human labels for the four roles (used in the header + admin screen). */
export const ROLE_LABELS: Record<AppRole, string> = {
  campaign_owner: 'Campaign owner',
  campaign_coordinator: 'Campaign coordinator',
  run_team: 'RUN team',
  admin: 'Admin',
}

export const SBU_OPTIONS = [
  'Industrial',
  'Automotive',
  'Electronics',
  'Packaging',
  'General Manufacturing',
]

export const BRAND_OPTIONS: Brand[] = ['Loctite', 'Technomelt', 'Teroson', 'Bonderite']

export const TYPE_OPTIONS = [
  'Product relaunch',
  'Product launch',
  'Webinar',
  'Nurture',
  'Demand gen',
  'Event',
  'Newsletter',
]

export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical']

export const LANGUAGE_OPTIONS = [
  'English (UK)',
  'English (US)',
  'German',
  'French',
  'Dutch',
  'Spanish',
  'Italian',
]

export const REGION_OPTIONS = [
  'Germany',
  'France',
  'Netherlands',
  'Italy',
  'Spain',
  'Poland',
  'United Kingdom',
  'United States',
  'China',
  'Japan',
]

/** Country = the scoping dimension for owners (one) and RUN-team users (many). Same list. */
export const COUNTRY_OPTIONS = REGION_OPTIONS

export const CHANNEL_OPTIONS = [
  'Email',
  'LinkedIn',
  'Distributor portal',
  'Web',
  'Social',
  'SEM',
  'Print / PDF',
  'Display banner',
]

export const OWNER_OPTIONS = [
  'Markus Weber',
  'M. Roth',
  'S. Klein',
  'J. Stoker',
  'L. Vogel',
  'P. Adler',
  'A. Weber',
]

export interface StatusMeta {
  label: string
  /** Tailwind background utility for solid fills (pills / bars) */
  bg: string
  /** Tailwind text utility */
  text: string
  /** Tailwind background utility for the legend / status dot */
  dot: string
  hex: string
}

export const STATUS_META: Record<CampaignStatus, StatusMeta> = {
  draft: { label: 'Draft', bg: 'bg-gray-400', text: 'text-white', dot: 'bg-gray-400', hex: '#696969' },
  in_progress: { label: 'In progress', bg: 'bg-amber-500', text: 'text-white', dot: 'bg-amber-500', hex: '#9A6800' },
  ready: { label: 'Ready', bg: 'bg-green-600', text: 'text-white', dot: 'bg-green-600', hex: '#175641' },
  briefed: { label: 'Briefed', bg: 'bg-blue-600', text: 'text-white', dot: 'bg-blue-600', hex: '#245E6F' },
  in_production: { label: 'In production', bg: 'bg-blue-600', text: 'text-white', dot: 'bg-blue-600', hex: '#245E6F' },
}

/** Statuses shown in the calendar legend (order matters). */
export const LEGEND_STATUSES: CampaignStatus[] = ['draft', 'in_progress', 'ready', 'briefed']
