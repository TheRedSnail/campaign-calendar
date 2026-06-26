import type { CampaignStatus } from '../types'
import type { AppRole } from '../types/database'

export const TODAY = '2026-06-24'

/** Human labels for the four roles (used in the header + admin screen). */
export const ROLE_LABELS: Record<AppRole, string> = {
  campaign_owner: 'Campaign owner',
  campaign_coordinator: 'Campaign coordinator',
  run_team: 'RUN team',
  admin: 'Admin',
}

// The lists below are FALLBACK DEFAULTS only. At runtime the admin-managed values come from
// the DB via composables/useOptions.ts; these seed the database and keep the app working
// offline / before the first fetch. Edit values in the /admin settings, not here.

/** SBU codes from the existing Henkel ticket system (see briefs.md). */
export const SBU_DEFAULTS = [
  'ACA',
  'ACE',
  'ACC',
  'AMC',
  'AME',
  'AMI',
  'AMO',
  'APC',
  'APP',
  'AQC',
]

export const BRAND_DEFAULTS: string[] = ['Next Henkel Adhesives', 'Bekron', 'Fester', 'OSI']

export const TYPE_DEFAULTS = [
  'Product relaunch',
  'Product launch',
  'Webinar',
  'Nurture',
  'Demand gen',
  'Event',
  'Newsletter',
]

export const PRIORITY_DEFAULTS = ['Low', 'Medium', 'High', 'Critical']

export const LANGUAGE_DEFAULTS = [
  'English (UK)',
  'English (US)',
  'German',
  'French',
  'Dutch',
  'Spanish',
  'Italian',
]

/** Country / region scope from the existing ticket system (see briefs.md). */
export const REGION_DEFAULTS = [
  'Global',
  'Regional - APAC',
  'Regional - Middle East and Africa',
  'Regional – Eastern Europe',
  'Regional – North America',
  'Regional – Western Europe',
  'Regional- Latin America',
  'Algeria',
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Bulgaria',
  'Canada',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Croatia',
  'Czech Republic',
  'Denmark',
  'El Salvador',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Guatemala',
  'Honduras',
  'Hungary',
  'India',
  'Indonesia',
  'Ireland',
  'Israel',
  'Italy',
  'Japan',
  'Kenya',
  'Latvia',
  'Lithuania',
  'Malaysia',
  'Mexico',
  'Morocco',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Norway',
  'Pakistan',
  'Panama',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Romania',
  'Serbia',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sweden',
  'Switzerland',
  'Taiwan',
  'Thailand',
  'Tunisia',
  'Turkey',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Vietnam',
]

/** Country = the scoping dimension for owners (one) and RUN-team users (many). Same list. */
export const COUNTRY_DEFAULTS = REGION_DEFAULTS

/** Websites a campaign can target (see briefs.md). */
export const WEBSITE_DEFAULTS = [
  'Agorex',
  'Bekron',
  'Beta Website',
  'Bonderite',
  'Cascola',
  'Ceresit',
  'Cimsec',
  'Contacts Henkel Adhesives',
  'Fester',
  'Glooly',
  'Henkel Brand Hub',
  'Henkel FQCE',
  'Humidity Absorber',
  'LePage',
  'Loctite',
  'Makroflex',
  'Metylan',
  'Moment',
  'Next Henkel Adhesives',
  'Oneweb',
  'OSI',
  'Other / External',
  'Pattex',
  'Perfax',
  'Polybit',
  'Pritt',
  'Resistol',
  'Rubson',
  'Sista',
  'Solvite',
  'Tangit',
  'Teroson',
  'Thomsit',
  'YouJustDo',
]

export const CHANNEL_DEFAULTS = [
  'Email',
  'LinkedIn',
  'Distributor portal',
  'Web',
  'Social',
  'SEM',
  'Print / PDF',
  'Display banner',
]

/** Email program types asked for in the ticket system (see briefs.md). */
export const EMAIL_PROGRAM_DEFAULTS = [
  'Email blast',
  'Newsletter',
  'Content download',
  'Masterclass on demand',
  'Discover nurture',
  'New nurture journey',
  'Request a consultation',
  'Request a quote',
  'Request a sample',
  'Event',
  'Webinar (live)',
]

/** Hidden/prefilled request type sent to DevOps for an email program (see briefs.md). */
export const EMAIL_REQUEST_TYPE = 'Create a new Marketo program based on an existing flow/journey'

/** Tracking-pixel vendors (see briefs.md). */
export const PIXEL_VENDOR_DEFAULTS = [
  'Facebook (meta)',
  'Google ads',
  'Bing',
  'Youtube',
  'Instagram (meta)',
  'TikTok',
  'Snapchat',
  'Pinterest',
  'X (Twitter)',
  'LinkedIn',
  'Other (please describe in comments)',
]

export const PIXEL_TYPE_OPTIONS = ['Page View', 'Conversion']

export const OWNER_DEFAULTS = [
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
  live: { label: 'Live', bg: 'bg-green-500', text: 'text-white', dot: 'bg-green-500', hex: '#1D7A55' },
  ended: { label: 'Ended', bg: 'bg-gray-700', text: 'text-white', dot: 'bg-gray-700', hex: '#4D3938' },
}

/** Statuses shown in the calendar legend (order matters). */
export const LEGEND_STATUSES: CampaignStatus[] = ['draft', 'in_progress', 'ready', 'briefed', 'live', 'ended']
