import { supabase } from '../lib/supabase'
import { loadOptions, type OptionKind } from './useOptions'

// Admin writes to the config tables. RLS (the *_admin_all policies) enforces admin-only on the
// server, so these are plain client calls — no Edge Function needed (unlike admin-users, which
// touches auth.users). Every successful write refreshes the shared useOptions store.

export type AdminResult = { error?: string }

async function run(p: PromiseLike<{ error: { message: string } | null }>): Promise<AdminResult> {
  const { error } = await p
  if (error) return { error: error.message }
  await loadOptions()
  return {}
}

export function useOptionsAdmin() {
  return {
    // ---- flat option lists (app_options) ----
    addOption: (kind: OptionKind, value: string, sortOrder: number) =>
      run(supabase.from('app_options').insert({ kind, value, label: value, sort_order: sortOrder })),

    /** Edit an existing value (rename / reorder / activate). Keyed by the old value string. */
    updateOption: (
      kind: OptionKind,
      oldValue: string,
      patch: { value?: string; label?: string; sort_order?: number; active?: boolean },
    ) =>
      run(
        supabase
          .from('app_options')
          .update({ ...patch, ...(patch.value !== undefined ? { label: patch.value } : {}) })
          .eq('kind', kind)
          .eq('value', oldValue),
      ),

    setOptionActive: (kind: OptionKind, value: string, active: boolean) =>
      run(supabase.from('app_options').update({ active }).eq('kind', kind).eq('value', value)),

    // ---- regions ----
    addRegion: (name: string, sortOrder: number) =>
      run(supabase.from('regions').insert({ name, sort_order: sortOrder })),
    updateRegion: (id: string, patch: { name?: string; sort_order?: number; active?: boolean }) =>
      run(supabase.from('regions').update(patch).eq('id', id)),

    // ---- countries ----
    addCountry: (name: string, regionId: string | null, sortOrder: number) =>
      run(supabase.from('countries').insert({ name, region_id: regionId, sort_order: sortOrder })),
    updateCountry: (
      id: string,
      patch: { name?: string; region_id?: string | null; sort_order?: number; active?: boolean },
    ) => run(supabase.from('countries').update(patch).eq('id', id)),
  }
}
