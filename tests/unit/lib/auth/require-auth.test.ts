import { describe, expect, it } from 'vitest'

import { requireAuth } from '@/lib/auth/require-auth'

describe('requireAuth', () => {
  it('returns false when there is no authenticated user id', () => {
    expect(requireAuth(null)).toBe(false)
  })

  it('returns true when a user id is present', () => {
    expect(requireAuth('user-123')).toBe(true)
  })
})
