import { describe, expect, it } from 'vitest'

import { parseBulkAssignmentCsv } from '@/lib/tags/bulk-assignment-csv'

describe('bulk assignment csv parser', () => {
  it('parses quoted values and embedded commas', () => {
    const parsed = parseBulkAssignmentCsv(
      [
        'serial,first_name,last_name,date_of_birth,home_postcode',
        '"AB12CD34","Anne, Marie","Smith","05-01-2014","SW1A 1AA"'
      ].join('\n')
    )

    expect(parsed.malformed).toBe(false)
    expect(parsed.hasHeaders).toBe(true)
    expect(parsed.rows).toEqual([
      {
        rowNumber: 2,
        serial: 'AB12CD34',
        firstName: 'Anne, Marie',
        lastName: 'Smith',
        dateOfBirth: '05-01-2014',
        homePostcode: 'SW1A 1AA'
      }
    ])
  })

  it('marks malformed csv when quoted values are unterminated', () => {
    const parsed = parseBulkAssignmentCsv(
      [
        'serial,first_name,last_name,date_of_birth,home_postcode',
        '"AB12CD34","Alice,"Smith","05-01-2014","SW1A 1AA"'
      ].join('\n')
    )

    expect(parsed.malformed).toBe(true)
    expect(parsed.hasHeaders).toBe(false)
    expect(parsed.rows).toEqual([])
  })

  it('drops fully empty rows', () => {
    const parsed = parseBulkAssignmentCsv(
      [
        'serial,first_name,last_name,date_of_birth,home_postcode',
        '',
        'AB12CD34,Alice,Smith,05-01-2014,SW1A 1AA',
        ',,,,',
        'ZX98YU76,Bob,Jones,,EC1A 1BB'
      ].join('\n')
    )

    expect(parsed.rows).toHaveLength(2)
    expect(parsed.rows[0]?.rowNumber).toBe(3)
    expect(parsed.rows[1]?.rowNumber).toBe(5)
  })

  it('preserves duplicate serial rows for fail-closed validation', () => {
    const parsed = parseBulkAssignmentCsv(
      [
        'serial,first_name,last_name,date_of_birth,home_postcode',
        'AB12CD34,Alice,Smith,05-01-2014,SW1A 1AA',
        'AB12CD34,Bob,Jones,11-02-2013,EC1A 1BB'
      ].join('\n')
    )

    expect(parsed.rows.map((row) => row.serial)).toEqual(['AB12CD34', 'AB12CD34'])
  })
})
