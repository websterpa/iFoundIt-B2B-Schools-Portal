import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { readSupabasePublicConfig } from '@/lib/supabase/config'

type CookieRecord = {
  name: string
  value: string
  options?: {
    domain?: string
    expires?: Date
    httpOnly?: boolean
    maxAge?: number
    path?: string
    sameSite?: 'lax' | 'strict' | 'none' | boolean
    secure?: boolean
  }
}

type CookieAdapter = {
  getAll: () => { name: string; value: string }[] | null
  setAll?: (cookiesToSet: CookieRecord[]) => void
}

export function createSupabaseServerClientWithCookies(cookieAdapter: CookieAdapter) {
  const { supabaseUrl, supabaseAnonKey } = readSupabasePublicConfig()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieAdapter
  })
}

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createSupabaseServerClientWithCookies({
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      } catch {
        // Server Components may not be able to write cookies. Middleware handles refresh.
      }
    }
  })
}
