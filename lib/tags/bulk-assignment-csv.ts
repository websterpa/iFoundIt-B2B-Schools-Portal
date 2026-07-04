import { parseCsvRecords } from '@/lib/csv/parse'

export type BulkAssignmentCsvRow = {
  rowNumber: number
  serial: string
  firstName: string
  lastName: string
  dateOfBirth: string
  homePostcode: string
}

export type BulkAssignmentCsvParseResult = {
  rows: BulkAssignmentCsvRow[]
  hasHeaders: boolean
  malformed: boolean
}

export function parseBulkAssignmentCsv(csvText: string): BulkAssignmentCsvParseResult {
  let records: string[][]

  try {
    records = parseCsvRecords(csvText)
  } catch {
    return {
      rows: [],
      hasHeaders: false,
      malformed: true
    }
  }

  if (records.length < 2) {
    return {
      rows: [],
      hasHeaders: false,
      malformed: false
    }
  }

  const headers = records[0].map((header) => header.trim().toLowerCase())
  const serialIndex = headers.indexOf('serial')
  const firstNameIndex = headers.indexOf('first_name')
  const lastNameIndex = headers.indexOf('last_name')
  const dateOfBirthIndex = headers.indexOf('date_of_birth')
  const homePostcodeIndex = headers.indexOf('home_postcode')

  if (
    serialIndex === -1 ||
    firstNameIndex === -1 ||
    lastNameIndex === -1 ||
    dateOfBirthIndex === -1 ||
    homePostcodeIndex === -1
  ) {
    return {
      rows: [],
      hasHeaders: false,
      malformed: false
    }
  }

  const rows = records.flatMap((columns, index) => {
    if (index === 0) {
      return []
    }

    const serial = (columns[serialIndex] ?? '').trim().toUpperCase()
    const firstName = (columns[firstNameIndex] ?? '').trim()
    const lastName = (columns[lastNameIndex] ?? '').trim()
    const dateOfBirth = (columns[dateOfBirthIndex] ?? '').trim()
    const homePostcode = (columns[homePostcodeIndex] ?? '').trim()

    if (!serial && !firstName && !lastName && !dateOfBirth && !homePostcode) {
      return []
    }

    return [
      {
        rowNumber: index + 1,
        serial,
        firstName,
        lastName,
        dateOfBirth,
        homePostcode
      }
    ]
  })

  return {
    rows,
    hasHeaders: true,
    malformed: false
  }
}
