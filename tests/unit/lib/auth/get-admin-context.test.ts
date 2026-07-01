import { describe, expect, it } from 'vitest'

import { getAdminContext } from '@/lib/auth/get-admin-context'

describe('getAdminContext', () => {
  it('returns organisation and role for a valid admin user', async () => {
    const db = {
      loadAdminUser: async (userId: string) => ({
        id: userId,
        organisationId: 'org-123',
        role: 'school_admin' as const
      })
    }

    await expect(getAdminContext('user-123', db)).resolves.toEqual({
      id: 'user-123',
      organisationId: 'org-123',
      role: 'school_admin'
    })
  })

  it('returns null when no admin mapping exists', async () => {
    const db = {
      loadAdminUser: async () => null
    }

    await expect(getAdminContext('missing-user', db)).resolves.toBeNull()
  })

  it('returns null when the role is not recognised', async () => {
    const db = {
      loadAdminUser: async (userId: string) => ({
        id: userId,
        organisationId: 'org-123',
        role: 'district_admin'
      })
    }

    await expect(getAdminContext('user-123', db as never)).resolves.toBeNull()
  })

  it('returns null when a school admin is missing an organisation id', async () => {
    const db = {
      loadAdminUser: async (userId: string) => ({
        id: userId,
        organisationId: null,
        role: 'school_admin' as const
      })
    }

    await expect(getAdminContext('user-123', db)).resolves.toBeNull()
  })
})
