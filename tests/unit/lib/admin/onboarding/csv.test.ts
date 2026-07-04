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

  it('accepts supplier UID SCAN header format', () => {
    const parsed = parseProvisioningCsv(
      [
        'Product,URL,UID SCAN,ENCODING DATA',
        'ST721,https://ifoundit.io/scanned-tag/,047C755A161E90,https://ifoundit.io/scanned-tag/047C755A161E90'
      ].join('\n')
    )

    expect(parsed.uidColumn).toEqual({ header: 'UID SCAN', index: 2 })
    expect(parsed.rows[0]?.normalizedSerial).toBe('047C755A161E90')
  })

  it('extracts serial from ENCODING DATA URL values', () => {
    const parsed = parseProvisioningCsv(
      [
        'Product,URL,ENCODING DATA',
        'ST721,https://ifoundit.io/scanned-tag/,https://ifoundit.io/scanned-tag/04E01F5A161E90'
      ].join('\n')
    )

    expect(parsed.uidColumn).toEqual({ header: 'ENCODING DATA', index: 2 })
    expect(parsed.rows[0]?.normalizedSerial).toBe('04E01F5A161E90')
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
