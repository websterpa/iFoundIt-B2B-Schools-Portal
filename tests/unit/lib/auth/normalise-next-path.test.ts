import { describe, expect, it } from 'vitest'

import { normaliseNextPath } from '@/lib/auth/normalise-next-path'

describe('normaliseNextPath', () => {
  it('keeps safe internal paths', () => {
    expect(normaliseNextPath('/setup-password')).toBe('/setup-password')
  })

  it('falls back when the path is external', () => {
    expect(normaliseNextPath('https://evil.example/steal')).toBe('/dashboard')
  })

  it('falls back when the path does not start with a slash', () => {
    expect(normaliseNextPath('setup-password')).toBe('/dashboard')
  })
})
