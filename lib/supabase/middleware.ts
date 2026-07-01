import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import { readSupabasePublicConfig } from '@/lib/supabase/config'

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  })

  const { supabaseUrl, supabaseAnonKey } = readSupabasePublicConfig()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(
        cookiesToSet: Array<{
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
        }>
      ) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({
          request
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      }
    }
  })

  await supabase.auth.getClaims()

  return response
}
