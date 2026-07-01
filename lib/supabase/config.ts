import { readPublicEnv } from '@/lib/env'

export function readSupabasePublicConfig() {
  const { supabaseUrl, supabaseAnonKey } = readPublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  return { supabaseUrl, supabaseAnonKey }
}
