import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Surface a clear error instead of a silent empty calendar if env is missing.
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — see .env.example')
}

export const supabase = createClient<Database>(url, anonKey)
