import type {
  CampaignAssets,
  EmailAsset,
  LandingFormAsset,
  LocalizationAsset,
  TrackingPixel,
  TrackingPixelsAsset,
} from '../types'
import { EMAIL_REQUEST_TYPE } from './options'

// Campaign + ticket seed data now lives in Supabase (see supabase/migrations). This file
// keeps only the blank-asset factory used when creating a new campaign and when mapping a
// DB row whose `assets` jsonb is missing/partial (see data/mappers.ts).

const blankEmail = (): EmailAsset => ({
  selected: false,
  program: '',
  description: '',
  briefingDoc: '',
  requestType: EMAIL_REQUEST_TYPE,
})
const blankLandingForm = (): LandingFormAsset => ({ selected: false, description: '', externalLinks: '', briefingDoc: '' })
export const blankPixel = (): TrackingPixel => ({
  vendor: '',
  pixelId: '',
  pixelType: '',
  script: '',
  paths: [{ url: '', comment: '' }],
  briefingDoc: '',
})
const blankTrackingPixels = (): TrackingPixelsAsset => ({ selected: false, pixels: [blankPixel()] })
const blankLocalization = (): LocalizationAsset => ({ selected: false, languages: [] })

export const emptyAssets = (): CampaignAssets => ({
  emails: blankEmail(),
  landingPages: blankLandingForm(),
  forms: blankLandingForm(),
  trackingPixels: blankTrackingPixels(),
  localization: blankLocalization(),
})

/**
 * Coerce an arbitrary `assets` value (a jsonb column that may be null, partial, or written by an
 * older brief-form schema — e.g. `emailBriefing` instead of `emails`, or a `trackingPixels` without
 * `pixels`) into a complete `CampaignAssets`. Every top-level key is guaranteed present, so callers
 * like `assetsSectionDone` can safely read `assets.emails.selected` etc. (see data/mappers.ts).
 */
export const normalizeAssets = (raw: unknown): CampaignAssets => {
  const base = emptyAssets()
  if (!raw || typeof raw !== 'object') return base
  const a = raw as Partial<Record<keyof CampaignAssets, object>>
  return {
    emails: { ...base.emails, ...a.emails },
    landingPages: { ...base.landingPages, ...a.landingPages },
    forms: { ...base.forms, ...a.forms },
    trackingPixels: { ...base.trackingPixels, ...a.trackingPixels },
    localization: { ...base.localization, ...a.localization },
  }
}
