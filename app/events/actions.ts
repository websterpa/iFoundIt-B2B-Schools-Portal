'use server'

import { revalidatePath } from 'next/cache'

import { getSessionUser } from '@/lib/auth/get-session-user'
import { loadAdminContextForUser } from '@/lib/auth/load-admin-context'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { resolveSchoolPortalOrganisation } from '@/lib/auth/resolve-school-portal-organisation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type ActionResponse<T> = {
  ok: boolean
  message: string
  data: T
}

function ok<T>(message: string, data: T): ActionResponse<T> {
  return {
    ok: true,
    message,
    data
  }
}

function fail<T>(message: string, data: T): ActionResponse<T> {
  return {
    ok: false,
    message,
    data
  }
}

export async function resolveFoundEventAction(input: {
  eventId: string
}): Promise<ActionResponse<Record<string, never>>> {
  try {
    const sessionUser = await getSessionUser()

    if (!requireAuth(sessionUser.id) || !sessionUser.id) {
      throw new Error('Sign in again to continue.')
    }

    const supabase = createSupabaseServerClient()
    const adminContext = await loadAdminContextForUser(supabase, sessionUser.id)

    if (!adminContext || !requireRole(adminContext, ['school_admin', 'ifoundit_superadmin'])) {
      throw new Error('You are not allowed to resolve events.')
    }

    const organisationContext = await resolveSchoolPortalOrganisation({
      adminContext,
      supabase
    })

    if (organisationContext.reason !== 'ok' || !organisationContext.organisationId) {
      throw new Error('Select a school context before resolving events.')
    }

    const { error } = await supabase
      .from('found_events')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: sessionUser.id
      })
      .eq('id', input.eventId)
      .eq('organisation_id', organisationContext.organisationId)

    if (error) {
      return fail(error.message, {})
    }

    revalidatePath('/events')

    return ok('Event marked as resolved.', {})
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not resolve event.', {})
  }
}
