import { createClient } from '@supabase/supabase-js'

import { readServerEnv } from '@/lib/env'
import { readSupabasePublicConfig } from '@/lib/supabase/config'

export function createSupabaseServiceClient() {
  const { supabaseUrl } = readSupabasePublicConfig()
  const { supabaseServiceRoleKey } = readServerEnv({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
