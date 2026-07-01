import { describe, expect, it } from 'vitest'

import { getSessionUser } from '@/lib/auth/get-session-user'

describe('getSessionUser', () => {
  it('returns the verified auth user id from claims', async () => {
    const createClient = async () => ({
      auth: {
        getClaims: async () => ({
          data: {
            claims: {
              sub: 'user-123'
            }
          },
          error: null
        })
      }
    })

    await expect(getSessionUser(createClient as never)).resolves.toEqual({
      id: 'user-123'
    })
  })

  it('returns null when claims are unavailable', async () => {
    const createClient = async () => ({
      auth: {
        getClaims: async () => ({
          data: null,
          error: null
        })
      }
    })

    await expect(getSessionUser(createClient as never)).resolves.toEqual({
      id: null
    })
  })
})
