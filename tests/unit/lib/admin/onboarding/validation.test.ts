import { describe, expect, it } from 'vitest'

import { validateSchoolSetupInput } from '@/lib/admin/onboarding/validation'

describe('school setup validation', () => {
  it('normalizes valid school setup input', () => {
    const result = validateSchoolSetupInput({
      name: ' Example School ',
      slug: 'example-school',
      contactEmail: ' OFFICE@example.org ',
      contactPhone: ' 01234 567890 ',
      address: ' 1 School Road ',
      pendingAdminFullName: ' Alex Carter ',
      pendingAdminEmail: ' Alex@example.org '
    })

    expect(result).toEqual({
      ok: true,
      value: {
        name: 'Example School',
        slug: 'example-school',
        contactEmail: 'office@example.org',
        contactPhone: '01234 567890',
        address: '1 School Road',
        pendingAdminFullName: 'Alex Carter',
        pendingAdminEmail: 'alex@example.org'
      }
    })
  })

  it('rejects invalid school slugs', () => {
    expect(
      validateSchoolSetupInput({
        name: 'Example School',
        slug: 'Bad Slug',
        contactEmail: 'office@example.org',
        pendingAdminFullName: 'Alex Carter',
        pendingAdminEmail: 'alex@example.org'
      })
    ).toEqual({
      ok: false,
      message: 'Use lowercase letters, numbers, and hyphens for the school slug.'
    })
  })
})
