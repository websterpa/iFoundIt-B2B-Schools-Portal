import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { parseProvisioningCsv } from '@/lib/admin/onboarding/csv'

describe('supplier fixture csv compatibility', () => {
  it('parses the iFoundIt supplier CSV fixture without dropping UID SCAN rows', () => {
    const fixturePath = resolve(process.cwd(), 'tests/fixtures/supplier/uid-scan.csv')
    const csvText = readFileSync(fixturePath, 'utf8')

    const parsed = parseProvisioningCsv(csvText)

    expect(parsed.uidColumn).toEqual({ header: 'UID SCAN', index: 2 })
    expect(parsed.rows.length).toBeGreaterThan(0)
    expect(parsed.normalizedSerials.length).toBeGreaterThan(0)

    for (const row of parsed.rows) {
      expect(row.normalizedSerial).toMatch(/^[A-Z0-9]{8,}$/)
    }
  })
})
