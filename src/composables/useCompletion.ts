import { computed, type Ref } from 'vue'
import type { AssetKey, Campaign, CampaignAssets } from '../types'

export interface SectionStatus {
  key: string
  label: string
  done: number
  total: number
  complete: boolean
}

const filled = (v: unknown) => {
  if (Array.isArray(v)) return v.length > 0
  return typeof v === 'string' ? v.trim().length > 0 : Boolean(v)
}

const text = (v?: string) => (v ?? '').trim().length > 0

/** Is a single selected asset fully configured (selected + its details filled)? */
export function assetComplete(key: AssetKey, assets: CampaignAssets): boolean {
  const a = assets[key]
  if (!a.selected) return false
  if (key === 'localization') return assets.localization.languages.length > 0
  if (key === 'trackingPixels') {
    const t = assets.trackingPixels
    return text(t.provider) && text(t.pixelId)
  }
  const b = assets[key] as CampaignAssets['emailBriefing']
  return text(b.brief) && text(b.briefingDoc)
}

const ASSET_KEYS: AssetKey[] = ['emailBriefing', 'landingPages', 'forms', 'trackingPixels', 'localization']

/** Assets & briefings = ONE field: at least one selected AND every selected one complete. */
export function assetsSectionDone(c: Campaign): boolean {
  const selected = ASSET_KEYS.filter((k) => c.assets[k].selected)
  return selected.length > 0 && selected.every((k) => assetComplete(k, c.assets))
}

/** Required-field model — totals to 16 fields across six sections. */
export function computeSections(c: Campaign): SectionStatus[] {
  const basics = [c.name, c.sbu, c.brand, c.campaignType, c.priority, c.language, c.costCenter]
  const schedule = [c.startDate, c.endDate]
  const targeting = [c.regions, c.channels]
  const goal = [c.goal, c.cta]
  const ownership = [c.owner, c.ownerEmail]

  const build = (key: string, label: string, fields: unknown[]): SectionStatus => {
    const done = fields.filter(filled).length
    return { key, label, done, total: fields.length, complete: done === fields.length }
  }

  const assetsDone = assetsSectionDone(c) ? 1 : 0

  return [
    build('basics', 'Basics', basics),
    build('schedule', 'Schedule', schedule),
    build('targeting', 'Targeting', targeting),
    build('goal', 'Goal / CTA', goal),
    build('ownership', 'Ownership', ownership),
    { key: 'assets', label: 'Assets & briefings', done: assetsDone, total: 1, complete: assetsDone === 1 },
  ]
}

export function useCompletion(campaign: Ref<Campaign | null>) {
  const sections = computed<SectionStatus[]>(() =>
    campaign.value ? computeSections(campaign.value) : [],
  )
  const done = computed(() => sections.value.reduce((sum, s) => sum + s.done, 0))
  const total = computed(() => sections.value.reduce((sum, s) => sum + s.total, 0))
  const canBrief = computed(() => total.value > 0 && done.value === total.value)
  const percent = computed(() => (total.value ? Math.round((done.value / total.value) * 100) : 0))

  return { sections, done, total, canBrief, percent }
}
