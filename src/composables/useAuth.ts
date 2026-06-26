import { computed, reactive, toRefs } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AppRole, Database } from '../types/database'

export type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  session: Session | null
  profile: Profile | null
  ready: boolean // true once the initial session lookup has resolved
}

const state = reactive<AuthState>({ session: null, profile: null, ready: false })

async function fetchProfile(id: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
  return data ?? null
}

let initPromise: Promise<void> | null = null

/** Resolve the current session + profile exactly once. The router guard awaits this so a
 *  hard reload of a deep route doesn't race the async session lookup (empty-calendar bug). */
export function initAuth(): Promise<void> {
  if (initPromise) return initPromise
  initPromise = (async () => {
    const { data } = await supabase.auth.getSession()
    state.session = data.session
    state.profile = data.session ? await fetchProfile(data.session.user.id) : null
    state.ready = true
    supabase.auth.onAuthStateChange(async (_event, session) => {
      state.session = session
      state.profile = session ? await fetchProfile(session.user.id) : null
    })
  })()
  return initPromise
}

const role = computed<AppRole | null>(() => state.profile?.role ?? null)
const isAdmin = computed(() => role.value === 'admin')
const isOwner = computed(() => role.value === 'campaign_owner')
const canSeeCoordinator = computed(
  () => role.value === 'campaign_coordinator' || role.value === 'run_team' || role.value === 'admin',
)
const displayName = computed(() => state.profile?.full_name || state.session?.user.email || 'Account')
/** Where a freshly-authenticated user should land — coordinators open their dashboard. */
const landingPath = computed(() => (role.value === 'campaign_coordinator' ? '/coordinator' : '/'))

async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (!error) {
    const { data } = await supabase.auth.getSession()
    state.session = data.session
    state.profile = data.session ? await fetchProfile(data.session.user.id) : null
  }
  return { error }
}

async function logout() {
  await supabase.auth.signOut()
  state.session = null
  state.profile = null
}

export function useAuth() {
  return {
    ...toRefs(state),
    role,
    isAdmin,
    isOwner,
    canSeeCoordinator,
    displayName,
    landingPath,
    initAuth,
    login,
    logout,
  }
}
