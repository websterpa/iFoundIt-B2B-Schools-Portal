import type { EmailOtpType } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { normaliseNextPath } from '@/lib/auth/normalise-next-path'
import { createSupabaseServerClientWithCookies } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const nextPath = normaliseNextPath(requestUrl.searchParams.get('next'))

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = nextPath
  redirectTo.search = ''

  let response = NextResponse.redirect(redirectTo)

  if (tokenHash && type) {
    const supabase = createSupabaseServerClientWithCookies({
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      }
    })

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type
    })

    if (!error) {
      return response
    }
  }

  const errorRedirect = request.nextUrl.clone()
  errorRedirect.pathname = '/unauthorised'
  errorRedirect.search = ''

  return NextResponse.redirect(errorRedirect)
}
