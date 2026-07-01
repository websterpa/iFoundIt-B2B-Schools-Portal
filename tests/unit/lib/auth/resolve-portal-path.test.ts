import { describe, expect, it } from 'vitest'

import { resolvePortalPath } from '@/lib/auth/resolve-portal-path'

describe('resolvePortalPath', () => {
  it('routes school admins to the dashboard', () => {
    expect(
      resolvePortalPath({
        id: 'user-1',
        organisationId: 'org-1',
        role: 'school_admin'
      })
    ).toBe('/dashboard')
  })

  it('routes superadmins to the admin portal', () => {
    expect(
      resolvePortalPath({
        id: 'user-1',
        organisationId: null,
        role: 'ifoundit_superadmin'
      })
    ).toBe('/admin')
  })
})
