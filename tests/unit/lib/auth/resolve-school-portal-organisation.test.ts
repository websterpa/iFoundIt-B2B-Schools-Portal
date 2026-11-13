import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import { resolveSchoolPortalOrganisation } from '@/lib/auth/resolve-school-portal-organisation'

vi.mock('@/lib/auth/superadmin-school-context', () => ({
  readSuperadminSchoolContext: vi.fn(() => 'org-from-cookie')
}))

describe('resolveSchoolPortalOrganisation', () => {
  function buildSupabaseMock(
    maybeSingle: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>
  ) {
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle
          })
        })
      })
    } as unknown as SupabaseClient
  }

  it('returns school admin organisation directly', async () => {
    const result = await resolveSchoolPortalOrganisation({
      adminContext: {
        id: 'user-1',
        role: 'school_admin',
        organisationId: 'org-1'
      },
      supabase: buildSupabaseMock(async () => ({ data: { id: 'org-1' }, error: null }))
    })

    expect(result).toEqual({
      organisationId: 'org-1',
      reason: 'ok'
    })
  })

  it('returns missing_context when superadmin has no context', async () => {
    const { readSuperadminSchoolContext } = await import('@/lib/auth/superadmin-school-context')
    vi.mocked(readSuperadminSchoolContext).mockReturnValueOnce(null)

    const result = await resolveSchoolPortalOrganisation({
      adminContext: {
        id: 'user-1',
        role: 'ifoundit_superadmin',
        organisationId: null
      },
      supabase: buildSupabaseMock(async () => ({ data: null, error: null }))
    })

    expect(result).toEqual({
      organisationId: null,
      reason: 'missing_context'
    })
  })

  it('returns invalid_context when context points to unknown organisation', async () => {
    const result = await resolveSchoolPortalOrganisation({
      adminContext: {
        id: 'user-1',
        role: 'ifoundit_superadmin',
        organisationId: null
      },
      supabase: buildSupabaseMock(async () => ({ data: null, error: { message: 'not found' } }))
    })

    expect(result).toEqual({
      organisationId: null,
      reason: 'invalid_context'
    })
  })
})
