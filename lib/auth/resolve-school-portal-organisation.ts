import type { SupabaseClient } from '@supabase/supabase-js'

import { readSuperadminSchoolContext } from '@/lib/auth/superadmin-school-context'
import type { AdminContext } from '@/lib/types/auth'

export type SchoolPortalOrganisationResult = {
  organisationId: string | null
  reason: 'ok' | 'missing_context' | 'invalid_context'
}

type ResolveArgs = {
  adminContext: AdminContext
  supabase: SupabaseClient
  queryOrganisationId?: string | null
}

export async function resolveSchoolPortalOrganisation(
  args: ResolveArgs
): Promise<SchoolPortalOrganisationResult> {
  const { adminContext, supabase, queryOrganisationId } = args

  if (adminContext.role === 'school_admin') {
    if (!adminContext.organisationId) {
      return { organisationId: null, reason: 'invalid_context' }
    }

    return {
      organisationId: adminContext.organisationId,
      reason: 'ok'
    }
  }

  const organisationId = queryOrganisationId?.trim() || readSuperadminSchoolContext()?.trim() || ''

  if (!organisationId) {
    return {
      organisationId: null,
      reason: 'missing_context'
    }
  }

  const { data, error } = await supabase
    .from('organisations')
    .select('id')
    .eq('id', organisationId)
    .maybeSingle()

  if (error || !data) {
    return {
      organisationId: null,
      reason: 'invalid_context'
    }
  }

  return {
    organisationId: data.id,
    reason: 'ok'
  }
}
