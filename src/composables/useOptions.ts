import { computed, reactive } from 'vue'
import { supabase } from '../lib/supabase'
import {
  SBU_DEFAULTS,
  BRAND_DEFAULTS,
  TYPE_DEFAULTS,
  PRIORITY_DEFAULTS,
  LANGUAGE_DEFAULTS,
  WEBSITE_DEFAULTS,
  CHANNEL_DEFAULTS,
  EMAIL_PROGRAM_DEFAULTS,
  PIXEL_VENDOR_DEFAULTS,
  OWNER_DEFAULTS,
  REGION_DEFAULTS,
  COUNTRY_DEFAULTS,
} from '../data/options'
import type { Database } from '../types/database'

export type OptionRow = Database['public']['Tables']['app_options']['Row']
export type RegionRow = Database['public']['Tables']['regions']['Row']
export type CountryRow = Database['public']['Tables']['countries']['Row']

/** The flat-list kinds stored in app_options (the editable brief dropdowns). */
export type OptionKind =
  | 'sbu'
  | 'brand'
  | 'campaign_type'
  | 'priority'
  | 'language'
  | 'website'
  | 'channel'
  | 'email_program'
  | 'pixel_vendor'
  | 'owner'

/** Display labels + bundled fallback for each kind (used offline / before the first fetch). */
export const OPTION_KINDS: { kind: OptionKind; label: string; fallback: string[] }[] = [
  { kind: 'sbu', label: 'SBU', fallback: SBU_DEFAULTS },
  { kind: 'brand', label: 'Brand', fallback: BRAND_DEFAULTS },
  { kind: 'campaign_type', label: 'Campaign type', fallback: TYPE_DEFAULTS },
  { kind: 'priority', label: 'Priority', fallback: PRIORITY_DEFAULTS },
  { kind: 'language', label: 'Language', fallback: LANGUAGE_DEFAULTS },
  { kind: 'website', label: 'Website', fallback: WEBSITE_DEFAULTS },
  { kind: 'channel', label: 'Channel', fallback: CHANNEL_DEFAULTS },
  { kind: 'email_program', label: 'Email program', fallback: EMAIL_PROGRAM_DEFAULTS },
  { kind: 'pixel_vendor', label: 'Pixel vendor', fallback: PIXEL_VENDOR_DEFAULTS },
  { kind: 'owner', label: 'Owner', fallback: OWNER_DEFAULTS },
]

const FALLBACKS = Object.fromEntries(
  OPTION_KINDS.map((k) => [k.kind, k.fallback]),
) as Record<OptionKind, string[]>

interface OptionsState {
  options: OptionRow[]
  regions: RegionRow[]
  countries: CountryRow[]
  loaded: boolean
}

// Module-level reactive store (same pattern as useCampaigns) — populated once after auth.
const state = reactive<OptionsState>({
  options: [],
  regions: [],
  countries: [],
  loaded: false,
})

/** Load every admin-managed list + geography. Awaited in main.ts before the first navigation. */
export async function loadOptions() {
  const [opt, reg, cty] = await Promise.all([
    supabase.from('app_options').select('*').order('sort_order'),
    supabase.from('regions').select('*').order('sort_order'),
    supabase.from('countries').select('*').order('sort_order'),
  ])
  if (opt.error) console.error('loadOptions:app_options', opt.error)
  else state.options = opt.data ?? []
  if (reg.error) console.error('loadOptions:regions', reg.error)
  else state.regions = reg.data ?? []
  if (cty.error) console.error('loadOptions:countries', cty.error)
  else state.countries = cty.data ?? []
  state.loaded = true
}

/** Clear on logout so the next user re-fetches (values are public, but keep state tidy). */
export function resetOptions() {
  state.options = []
  state.regions = []
  state.countries = []
  state.loaded = false
}

/** Active values for a flat list, ordered; falls back to bundled defaults when empty. */
function activeValues(kind: OptionKind): string[] {
  const rows = state.options
    .filter((o) => o.kind === kind && o.active)
    .sort((a, b) => a.sort_order - b.sort_order)
  return rows.length ? rows.map((o) => o.value) : FALLBACKS[kind]
}

/** All rows (incl. inactive) for a kind — for the admin editor. */
export function optionRows(kind: OptionKind): OptionRow[] {
  return state.options
    .filter((o) => o.kind === kind)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
}

// ---- flat dropdown lists -------------------------------------------------
const sbus = computed(() => activeValues('sbu'))
const brands = computed(() => activeValues('brand'))
const campaignTypes = computed(() => activeValues('campaign_type'))
const priorities = computed(() => activeValues('priority'))
const languages = computed(() => activeValues('language'))
const websites = computed(() => activeValues('website'))
const channels = computed(() => activeValues('channel'))
const emailPrograms = computed(() => activeValues('email_program'))
const pixelVendors = computed(() => activeValues('pixel_vendor'))
const owners = computed(() => activeValues('owner'))
const assignees = computed(() => [...owners.value, 'Unassigned'])

// ---- geography -----------------------------------------------------------
const activeRegions = computed(() =>
  state.regions.filter((r) => r.active).slice().sort((a, b) => a.sort_order - b.sort_order),
)
const activeCountries = computed(() =>
  state.countries.filter((c) => c.active).slice().sort((a, b) => a.sort_order - b.sort_order),
)

/** Single-country dropdowns (campaign country, owner/RUN scope). */
const countryOptions = computed(() =>
  activeCountries.value.length ? activeCountries.value.map((c) => c.name) : COUNTRY_DEFAULTS,
)

/** Region targeting multi-select: Global + region buckets + every country (legacy shape). */
const regionOptions = computed(() => {
  if (!activeRegions.value.length && !activeCountries.value.length) return REGION_DEFAULTS
  return ['Global', ...activeRegions.value.map((r) => r.name), ...countryOptions.value]
})

/** region name → member country names (the managed mapping; 'Global' = all). */
const regionToCountries = computed<Record<string, string[]>>(() => {
  const byId: Record<string, string> = {}
  for (const r of state.regions) byId[r.id] = r.name
  const map: Record<string, string[]> = {}
  for (const c of state.countries) {
    if (!c.region_id) continue
    const name = byId[c.region_id]
    if (!name) continue
    ;(map[name] ??= []).push(c.name)
  }
  return map
})

export function useOptions() {
  return {
    state,
    loaded: computed(() => state.loaded),
    loadOptions,
    resetOptions,
    optionRows,
    // flat dropdown lists
    sbus,
    brands,
    campaignTypes,
    priorities,
    languages,
    websites,
    channels,
    emailPrograms,
    pixelVendors,
    owners,
    assignees,
    // geography
    regions: activeRegions,
    countries: activeCountries,
    countryOptions,
    regionOptions,
    regionToCountries,
  }
}
