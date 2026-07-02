import { describe, expect, it } from 'vitest'

import {
  classifyProvisioningRows,
  detectUidColumn,
  normalizeTagSerial,
  parseProvisioningCsv
} from '@/lib/admin/onboarding/csv'

describe('onboarding csv helpers', () => {
  it('normalizes uppercase serial values', () => {
    expect(normalizeTagSerial(' ab12cd34 ')).toBe('AB12CD34')
  })

  it('detects the supported uid column', () => {
    expect(detectUidColumn(['Name', 'UID'])).toEqual({ header: 'UID', index: 1 })
  })

  it('classifies valid, duplicate, invalid, and cross-school conflict rows', () => {
    const parsed = parseProvisioningCsv(
      ['UID', 'ab12cd34', 'AB12CD34', 'bad-uid', 'ZXCVBN12'].join('\n')
    )

    const classification = classifyProvisioningRows(
      parsed.rows,
      [{ serial: 'ZXCVBN12', organisationId: 'org-2', active: true }],
      'org-1'
    )

    expect(classification.summary).toEqual({
      totalRows: 4,
      validRows: 1,
      duplicateRows: 1,
      invalidRows: 1,
      conflictRows: 1
    })
  })

  it('fails closed when no supported uid column exists', () => {
    expect(() => parseProvisioningCsv(['name,tag', 'School,A1B2C3D4'].join('\n'))).toThrow(
      /supported uid column/i
    )
  })
})
