import { NextResponse } from 'next/server'

import { getAdminContext } from '@/lib/auth/get-admin-context'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { resolvePortalPath } from '@/lib/auth/resolve-portal-path'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const sessionUser = await getSessionUser()

  if (!sessionUser.id) {
    return NextResponse.json({
      authenticated: false,
      authorised: false,
      userId: null,
      role: null,
      organisationId: null,
      redirectTo: null
    })
  }

  const supabase = createSupabaseServiceClient()
  const adminContext = await getAdminContext(sessionUser.id, {
    async loadAdminUser(userId) {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, organisation_id, role')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data) {
        return null
      }

      return {
        id: data.id,
        organisationId: data.organisation_id,
        role: data.role
      }
    }
  })

  return NextResponse.json({
    authenticated: true,
    authorised: Boolean(adminContext),
    userId: sessionUser.id,
    role: adminContext?.role ?? null,
    organisationId: adminContext?.organisationId ?? null,
    redirectTo: adminContext ? resolvePortalPath(adminContext) : '/unauthorised'
  })
}
