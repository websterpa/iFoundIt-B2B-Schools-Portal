import { describe, expect, it } from 'vitest'

import { requireRole } from '@/lib/auth/require-role'

describe('requireRole', () => {
  it('allows a matching role', () => {
    expect(
      requireRole(
        { id: 'user-1', organisationId: 'org-1', role: 'school_admin' },
        ['school_admin']
      )
    ).toBe(true)
  })

  it('denies access when context is missing', () => {
    expect(requireRole(null, ['school_admin'])).toBe(false)
  })

  it('denies access when role is not allowed', () => {
    expect(
      requireRole(
        { id: 'user-1', organisationId: null, role: 'ifoundit_superadmin' },
        ['school_admin']
      )
    ).toBe(false)
  })
})
