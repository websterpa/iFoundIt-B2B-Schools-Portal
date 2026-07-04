import { describe, expect, it } from 'vitest'

import {
  normalizeUkPostcodeForMatch,
  parseDobDdMmYyyyToIso
} from '@/lib/students/normalization'

describe('student normalization', () => {
  it('parses DD-MM-YYYY dates to ISO', () => {
    expect(parseDobDdMmYyyyToIso('05-01-2014')).toBe('2014-01-05')
    expect(parseDobDdMmYyyyToIso(' 29-02-2024 ')).toBe('2024-02-29')
  })

  it('rejects invalid DD-MM-YYYY values', () => {
    expect(parseDobDdMmYyyyToIso('31-02-2014')).toBeNull()
    expect(parseDobDdMmYyyyToIso('2014-01-05')).toBeNull()
    expect(parseDobDdMmYyyyToIso('5-1-2014')).toBeNull()
  })

  it('normalizes supported UK postcode patterns', () => {
    expect(normalizeUkPostcodeForMatch('sw1a 1aa')).toBe('SW1A1AA')
    expect(normalizeUkPostcodeForMatch(' EC1A 1BB ')).toBe('EC1A1BB')
    expect(normalizeUkPostcodeForMatch('gir 0aa')).toBe('GIR0AA')
  })

  it('rejects invalid UK postcodes', () => {
    expect(normalizeUkPostcodeForMatch('ABCDE')).toBeNull()
    expect(normalizeUkPostcodeForMatch('12345')).toBeNull()
    expect(normalizeUkPostcodeForMatch('SW1A@1AA')).toBeNull()
  })
})
