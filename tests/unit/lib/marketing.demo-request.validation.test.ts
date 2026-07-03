import { describe, expect, it } from 'vitest'

import { validateDemoRequestInput } from '@/lib/marketing/demo-request/validation'

function basePayload() {
  return {
    fullName: 'Alex Morgan',
    schoolName: 'Northbridge Academy',
    role: 'Headteacher',
    email: 'alex@northbridge.example.org',
    rolloutScope: 'Whole school',
    schoolType: 'Academy (single)',
    pupilCount: '300 to 600',
    phonePolicy: 'Allowed with restrictions',
    lostPropertyHandling: 'Handled by staff time',
    purchaseTimeline: 'Next term',
    budgetAuthority: 'Part of a decision-making group',
    marketingConsent: true,
    message: 'We are exploring September rollout.',
    website: '',
    loaded_at: String(Date.now() - 5_000)
  }
}

describe('validateDemoRequestInput', () => {
  it('accepts a valid non-trust submission and normalises optional trust fields to null', () => {
    const result = validateDemoRequestInput(basePayload())

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.value.trustName).toBeNull()
      expect(result.value.schoolsInTrust).toBeNull()
    }
  })

  it('requires trust details for trust-led submissions', () => {
    const result = validateDemoRequestInput({
      ...basePayload(),
      schoolType: 'Multi-Academy Trust'
    })

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        issue: 'validation_failed'
      })
    )
  })

  it('blocks honeypot submissions', () => {
    const result = validateDemoRequestInput({
      ...basePayload(),
      website: 'https://spam.invalid'
    })

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        issue: 'honeypot_filled'
      })
    )
  })

  it('blocks submissions that arrive too fast', () => {
    const result = validateDemoRequestInput({
      ...basePayload(),
      loaded_at: String(Date.now())
    })

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        issue: 'submitted_too_fast'
      })
    )
  })
})
