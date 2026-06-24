import { computed, type Ref } from 'vue'
import type { Campaign } from '../types'

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

/** Required-field model — totals to 20 fields across six sections. */
export function computeSections(c: Campaign): SectionStatus[] {
  const basics = [c.name, c.sbu, c.brand, c.campaignType, c.priority, c.language, c.costCenter]
  const schedule = [c.startDate, c.endDate]
  const targeting = [c.regions, c.channels]
  const goal = [c.goal, c.cta]
  const ownership = [c.owner, c.ownerEmail]
  const assets = Object.values(c.assets)

  const build = (key: string, label: string, fields: unknown[]): SectionStatus => {
    const done = fields.filter(filled).length
    return { key, label, done, total: fields.length, complete: done === fields.length }
  }

  return [
    build('basics', 'Basics', basics),
    build('schedule', 'Schedule', schedule),
    build('targeting', 'Targeting', targeting),
    build('goal', 'Goal / CTA', goal),
    build('ownership', 'Ownership', ownership),
    build('assets', 'Assets & briefings', assets),
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
