import { supabase } from '../lib/supabase'
import type { AppRole } from '../types/database'
import type { Profile } from './useAuth'

export interface UserInput {
  email: string
  password?: string
  full_name: string
  role: AppRole
  sbus: string[]
  countries: string[]
  is_global: boolean
}

/** All profiles (admins can read every row via the profiles_admin_all policy). */
export async function listUsers(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at')
  if (error) {
    console.error('listUsers', error)
    return []
  }
  return data ?? []
}

type AdminResult = { ok?: true; id?: string; error?: string }

/** Invoke the admin-users Edge Function (service-role lives server-side). */
async function callAdmin(body: Record<string, unknown>): Promise<AdminResult> {
  const { data, error } = await supabase.functions.invoke('admin-users', { body })
  if (error) {
    let msg = error.message
    // The function returns a JSON { error } body on 4xx — surface it.
    const ctx = (error as { context?: Response }).context
    if (ctx && typeof ctx.json === 'function') {
      try {
        const j = await ctx.json()
        if (j?.error) msg = j.error
      } catch { /* keep msg */ }
    }
    return { error: msg }
  }
  if (data?.error) return { error: data.error }
  return data as AdminResult
}

export function useAdmin() {
  return {
    listUsers,
    createUser: (p: UserInput) => callAdmin({ action: 'create', ...p }),
    updateUser: (id: string, p: Partial<UserInput>) => callAdmin({ action: 'update', id, ...p }),
    resetPassword: (id: string, password: string) => callAdmin({ action: 'reset_password', id, password }),
    deleteUser: (id: string) => callAdmin({ action: 'delete', id }),
  }
}
