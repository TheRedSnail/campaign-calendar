import { computed, reactive, toRefs } from 'vue'
import type { Campaign, CampaignStatus } from '../types'
import { emptyAssets, seedCampaigns } from '../data/campaigns'
import { computeSections } from './useCompletion'

export type ViewMode = 'month' | 'timeline'

export interface Filters {
  sbu: string[]
  brand: string[]
  region: string[]
  owner: string[]
  channel: string[]
  status: CampaignStatus[]
  search: string
}

interface CampaignState {
  campaigns: Campaign[]
  filters: Filters
  currentMonth: string // yyyy-mm-01
  viewMode: ViewMode
  selectedId: string | null
  drawerOpen: boolean
  briefOpen: boolean
  nextBriefSeq: number
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

const state = reactive<CampaignState>({
  campaigns: clone(seedCampaigns),
  filters: { sbu: [], brand: [], region: [], owner: [], channel: [], status: [], search: '' },
  currentMonth: '2026-06-01',
  viewMode: 'month',
  selectedId: null,
  drawerOpen: false,
  briefOpen: false,
  nextBriefSeq: 2041,
})

const selected = computed<Campaign | null>(
  () => state.campaigns.find((c) => c.id === state.selectedId) ?? null,
)

const hasFilters = computed(() => {
  const f = state.filters
  return (
    f.sbu.length || f.brand.length || f.region.length || f.owner.length ||
    f.channel.length || f.status.length || f.search.trim().length
  )
})

const filtered = computed<Campaign[]>(() => {
  const f = state.filters
  const q = f.search.trim().toLowerCase()
  return state.campaigns.filter((c) => {
    if (f.sbu.length && !f.sbu.includes(c.sbu)) return false
    if (f.brand.length && !f.brand.includes(c.brand)) return false
    if (f.owner.length && !f.owner.includes(c.owner)) return false
    if (f.status.length && !f.status.includes(c.status)) return false
    if (f.region.length && !c.regions.some((r) => f.region.includes(r))) return false
    if (f.channel.length && !c.channels.some((ch) => f.channel.includes(ch))) return false
    if (q && !c.name.toLowerCase().includes(q)) return false
    return true
  })
})

function openDrawer(id: string) {
  state.selectedId = id
  state.drawerOpen = true
}

function closeDrawer() {
  state.drawerOpen = false
}

function newCampaign() {
  const id = `new-${state.campaigns.length + 1}-${state.nextBriefSeq}`
  const blank: Campaign = {
    id,
    name: '',
    brand: 'Loctite',
    sbu: '',
    status: 'draft',
    progress: 0,
    startDate: '',
    endDate: '',
    campaignType: '',
    priority: '',
    language: '',
    costCenter: '',
    regions: [],
    channels: [],
    goal: '',
    cta: '',
    owner: '',
    ownerEmail: '',
    notes: '',
    assets: emptyAssets(),
    recipients: [],
  }
  state.campaigns.push(blank)
  openDrawer(id)
}

/** Recompute the derived calendar status from filled fields (draft → ready). */
function recomputeStatus(c: Campaign) {
  if (c.status === 'briefed' || c.status === 'in_production') return
  const sections = computeSections(c)
  const done = sections.reduce((s, x) => s + x.done, 0)
  const total = sections.reduce((s, x) => s + x.total, 0)
  if (done === total) c.status = 'ready'
  else if (done > Math.floor(total / 3)) c.status = 'in_progress'
  else c.status = 'draft'
  c.progress = Math.round((done / total) * 100)
}

function touchSelected() {
  if (selected.value) recomputeStatus(selected.value)
}

function openBrief() {
  state.briefOpen = true
}

function briefCampaign() {
  const c = selected.value
  if (!c) return
  c.status = 'briefed'
  c.progress = 100
  c.briefId = `ADH-${state.nextBriefSeq++}`
  c.briefedAt = '24 Jun 2026 · 14:32'
}

export function useCampaigns() {
  return {
    ...toRefs(state),
    selected,
    filtered,
    hasFilters,
    openDrawer,
    closeDrawer,
    newCampaign,
    openBrief,
    briefCampaign,
    touchSelected,
  }
}
