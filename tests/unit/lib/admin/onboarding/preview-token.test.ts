import { describe, expect, it } from 'vitest'

import {
  signProvisioningPreview,
  verifyProvisioningPreview
} from '@/lib/admin/onboarding/preview-token'

describe('provisioning preview token', () => {
  it('round-trips a signed provisioning payload', () => {
    const token = signProvisioningPreview(
      {
        organisationId: 'org-1',
        acceptedSerials: ['AB12CD34'],
        generatedAt: '2026-07-01T12:00:00.000Z'
      },
      'test-secret'
    )

    expect(
      verifyProvisioningPreview(token, 'test-secret', new Date('2026-07-01T12:05:00.000Z'))
    ).toEqual({
      organisationId: 'org-1',
      acceptedSerials: ['AB12CD34'],
      generatedAt: '2026-07-01T12:00:00.000Z'
    })
  })

  it('rejects tampered tokens', () => {
    const token = signProvisioningPreview(
      {
        organisationId: 'org-1',
        acceptedSerials: ['AB12CD34'],
        generatedAt: '2026-07-01T12:00:00.000Z'
      },
      'test-secret'
    )

    expect(
      verifyProvisioningPreview(`${token}tampered`, 'test-secret', new Date('2026-07-01T12:05:00.000Z'))
    ).toBeNull()
  })
})
