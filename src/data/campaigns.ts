import type { BriefingAsset, CampaignAssets, LocalizationAsset, TrackingAsset } from '../types'

// Campaign + ticket seed data now lives in Supabase (see supabase/migrations). This file
// keeps only the blank-asset factory used when creating a new campaign and when mapping a
// DB row whose `assets` jsonb is missing/partial (see data/mappers.ts).

const blankBriefing = (): BriefingAsset => ({ selected: false, brief: '', reference: '', briefingDoc: '' })
const blankTracking = (): TrackingAsset => ({ selected: false, provider: '', pixelId: '', events: '' })
const blankLocalization = (): LocalizationAsset => ({ selected: false, languages: [] })

export const emptyAssets = (): CampaignAssets => ({
  emailBriefing: blankBriefing(),
  landingPages: blankBriefing(),
  forms: blankBriefing(),
  trackingPixels: blankTracking(),
  localization: blankLocalization(),
})
