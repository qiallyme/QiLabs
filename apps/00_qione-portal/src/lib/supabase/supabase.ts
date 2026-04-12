import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at?: string
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name as string || user.email?.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url as string,
    created_at: user.created_at,
  }
}

export async function signOut() {
  return supabase.auth.signOut()
}
