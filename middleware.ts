import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { normaliseNextPath } from '@/lib/auth/normalise-next-path'
import { updateSupabaseSession } from '@/lib/supabase/middleware'

const SCHOOL_PREFIXES = ['/dashboard', '/students', '/tags', '/events', '/settings']
const SUPERADMIN_PREFIXES = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const needsSchoolAuth = SCHOOL_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const needsSuperadminAuth = SUPERADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (!needsSchoolAuth && !needsSuperadminAuth) {
    return NextResponse.next()
  }

  const response = await updateSupabaseSession(request)
  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token'))

  if (!hasSupabaseAuthCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', normaliseNextPath(pathname))
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/students/:path*', '/tags/:path*', '/events/:path*', '/settings/:path*', '/admin/:path*']
}
