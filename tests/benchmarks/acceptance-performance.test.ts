import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { parseCsvRecords } from '@/lib/csv/parse'
import {
  normalizeName,
  normalizeNullable,
  normalizeUkPostcodeForMatch,
  parseDobDdMmYyyyToIso
} from '@/lib/students/normalization'
import { parseBulkAssignmentCsv } from '@/lib/tags/bulk-assignment-csv'

function fixture(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('acceptance performance gates', () => {
  it('processes 1,000-row student import fixture in under 10 seconds', () => {
    const csv = fixture('tests/fixtures/performance/student-import-1000.csv')
    const records = parseCsvRecords(csv)

    const start = performance.now()
    const seen = new Set<string>()

    for (const columns of records.slice(1)) {
      const firstName = normalizeName(columns[0] ?? '')
      const lastName = normalizeName(columns[1] ?? '')
      const dob = parseDobDdMmYyyyToIso(columns[2] ?? '')
      const postcodeNormalized = normalizeUkPostcodeForMatch(columns[3] ?? '')
      const yearGroup = normalizeNullable(columns[4] ?? '')
      const className = normalizeNullable(columns[5] ?? '')

      if (!firstName || !lastName || !dob || !postcodeNormalized) {
        continue
      }

      const key = [
        firstName.toLowerCase(),
        lastName.toLowerCase(),
        dob,
        postcodeNormalized,
        yearGroup ?? '',
        className ?? ''
      ].join('::')

      seen.add(key)
    }

    const durationMs = performance.now() - start
    console.log(`student_import_1000_ms=${durationMs.toFixed(2)}`)
    expect(seen.size).toBeGreaterThan(0)
    expect(durationMs).toBeLessThan(10_000)
  })

  it('processes 500-row bulk tag assignment fixture in under 15 seconds', () => {
    const csv = fixture('tests/fixtures/performance/tag-bulk-assignment-500.csv')
    const parsed = parseBulkAssignmentCsv(csv)

    const mockStudents = parsed.rows.map((row, index) => ({
      id: `student-${index}`,
      key: `${normalizeName(row.firstName).toLowerCase()}::${normalizeName(row.lastName).toLowerCase()}`,
      date_of_birth: parseDobDdMmYyyyToIso(row.dateOfBirth),
      home_postcode_normalized: normalizeUkPostcodeForMatch(row.homePostcode)
    }))

    const studentsByName = new Map<string, typeof mockStudents>()

    for (const student of mockStudents) {
      const current = studentsByName.get(student.key) ?? []
      current.push(student)
      studentsByName.set(student.key, current)
    }

    const start = performance.now()
    let assignedCount = 0

    for (const row of parsed.rows) {
      const firstName = normalizeName(row.firstName)
      const lastName = normalizeName(row.lastName)
      const dob = parseDobDdMmYyyyToIso(row.dateOfBirth)
      const postcodeNormalized = normalizeUkPostcodeForMatch(row.homePostcode)

      if (!firstName || !lastName || (!dob && !postcodeNormalized)) {
        continue
      }

      const matches = (studentsByName.get(`${firstName.toLowerCase()}::${lastName.toLowerCase()}`) ?? []).filter(
        (candidate) => {
          if (dob && candidate.date_of_birth !== dob) {
            return false
          }

          if (postcodeNormalized && candidate.home_postcode_normalized !== postcodeNormalized) {
            return false
          }

          return true
        }
      )

      if (matches.length === 1) {
        assignedCount += 1
      }
    }

    const durationMs = performance.now() - start
    console.log(`bulk_tag_assignment_500_ms=${durationMs.toFixed(2)}`)
    expect(parsed.malformed).toBe(false)
    expect(parsed.rows).toHaveLength(500)
    expect(assignedCount).toBeGreaterThan(0)
    expect(durationMs).toBeLessThan(15_000)
  })
})
