import type {
  ClassifiedProvisioningRow,
  ExistingProvisionedTag,
  ParsedProvisioningCsv,
  ParsedProvisioningRow,
  ProvisioningSummary,
  UidColumnMatch
} from '@/lib/admin/onboarding/contracts'
import { TAG_SERIAL_PATTERN, TAG_UID_COLUMN_CANDIDATES } from '@/lib/admin/onboarding/contracts'

function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }

      continue
    }

    if (character === ',' && !inQuotes) {
      cells.push(current)
      current = ''
      continue
    }

    current += character
  }

  cells.push(current)
  return cells
}

function parseCsvLines(csvText: string) {
  return csvText
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0)
}

export function normalizeTagSerial(value: string) {
  const serial = value.trim().toUpperCase()

  if (!serial || !TAG_SERIAL_PATTERN.test(serial)) {
    return null
  }

  return serial
}

export function detectUidColumn(headers: string[]): UidColumnMatch | null {
  const index = headers.findIndex((header) =>
    TAG_UID_COLUMN_CANDIDATES.includes(header.trim().toLowerCase() as (typeof TAG_UID_COLUMN_CANDIDATES)[number])
  )

  if (index < 0) {
    return null
  }

  return {
    header: headers[index],
    index
  }
}

export function parseProvisioningCsv(csvText: string): ParsedProvisioningCsv {
  const lines = parseCsvLines(csvText)

  if (lines.length < 2) {
    throw new Error('We could not parse this CSV.')
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim())
  const uidColumn = detectUidColumn(headers)

  if (!uidColumn) {
    throw new Error('We could not find a supported UID column in this CSV.')
  }

  const rows: ParsedProvisioningRow[] = lines.slice(1).map((line, rowOffset) => {
    const values = parseCsvLine(line)
    const sourceValue = values[uidColumn.index] ?? ''

    return {
      rowNumber: rowOffset + 2,
      sourceValue,
      normalizedSerial: normalizeTagSerial(sourceValue)
    }
  })

  const normalizedSerials = Array.from(
    new Set(rows.flatMap((row) => (row.normalizedSerial ? [row.normalizedSerial] : [])))
  )

  return {
    headers,
    uidColumn,
    rows,
    normalizedSerials
  }
}

export function classifyProvisioningRows(
  rows: ParsedProvisioningRow[],
  existingTags: ExistingProvisionedTag[],
  targetOrganisationId: string
) {
  const existingBySerial = new Map(existingTags.map((tag) => [tag.serial, tag]))
  const seenInFile = new Set<string>()
  const classifiedRows: ClassifiedProvisioningRow[] = []
  const acceptedSerials: string[] = []
  const summary: ProvisioningSummary = {
    totalRows: rows.length,
    validRows: 0,
    duplicateRows: 0,
    invalidRows: 0,
    conflictRows: 0
  }

  for (const row of rows) {
    if (!row.normalizedSerial) {
      const isBlank = row.sourceValue.trim().length === 0
      classifiedRows.push({
        ...row,
        status: 'invalid',
        reason: isBlank ? 'blank_uid' : 'malformed_uid'
      })
      summary.invalidRows += 1
      continue
    }

    if (seenInFile.has(row.normalizedSerial)) {
      classifiedRows.push({
        ...row,
        status: 'duplicate',
        reason: 'duplicate_in_file'
      })
      summary.duplicateRows += 1
      continue
    }

    seenInFile.add(row.normalizedSerial)

    const existingTag = existingBySerial.get(row.normalizedSerial)

    if (existingTag) {
      if (existingTag.organisationId === targetOrganisationId) {
        classifiedRows.push({
          ...row,
          status: 'duplicate',
          reason: 'already_provisioned_to_school'
        })
        summary.duplicateRows += 1
      } else {
        classifiedRows.push({
          ...row,
          status: 'conflict',
          reason: 'allocated_to_another_school'
        })
        summary.conflictRows += 1
      }

      continue
    }

    classifiedRows.push({
      ...row,
      status: 'accepted',
      reason: 'accepted'
    })
    acceptedSerials.push(row.normalizedSerial)
    summary.validRows += 1
  }

  return {
    rows: classifiedRows,
    acceptedSerials,
    summary
  }
}
