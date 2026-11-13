'use client'

import React, { useMemo, useState, useTransition } from 'react'
import Papa from 'papaparse'
import { TrustedContactEditor } from '@/components/students/trusted-contact-editor'
import type { TrustedContact, ContactActions } from '@/lib/students/trusted-contacts'
import { formatItemClassification } from '@/lib/tags/item-classification'
import {
  formatIsoDobToDdMmYyyy,
  normalizeUkPostcodeForMatch,
  parseDobDdMmYyyyToIso
} from '@/lib/students/normalization'

type StudentRow = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string | null
  homePostcode: string | null
  yearGroup: string | null
  className: string | null
  active: boolean
  parentEmail: string | null
  trustedContacts: TrustedContact[]
  tagStatus: 'assigned' | 'unassigned'
  items: Array<{ id: string; serial: string; itemKind: string | null; laptopOwnership: string | null; active: boolean }>
}

type CreateStudentPayload = {
  firstName: string
  lastName: string
  dateOfBirth: string
  homePostcode: string
  yearGroup: string
  className: string
  active: boolean
}

type ImportStudentPayload = {
  rows: Array<{
    firstName: string
    lastName: string
    dateOfBirth: string | null
    homePostcode: string | null
    yearGroup: string | null
    className: string | null
    active: boolean
  }>
}

type ActionResponse<T> = {
  ok: boolean
  message: string
  data: T
}

type ImportStudentsResult = {
  insertedCount: number
  invalidCount: number
  duplicateCount: number
}

type StudentWorkspaceProps = {
  students: StudentRow[]
  createStudentAction: (input: CreateStudentPayload) => Promise<ActionResponse<Record<string, never>>>
  importStudentsAction: (input: ImportStudentPayload) => Promise<ActionResponse<ImportStudentsResult>>
  contactActions: ContactActions
}

type PreviewRow = {
  rowNumber: number
  firstName: string
  lastName: string
  dateOfBirth: string | null
  homePostcode: string | null
  yearGroup: string | null
  className: string | null
  status: 'accepted' | 'missing_required' | 'invalid_dob' | 'invalid_postcode' | 'duplicate_in_file'
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, '_')
}

function normalizeText(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

function parseActiveValue(value: string) {
  const normalized = value.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'y'
}

function buildStudentKey(input: {
  firstName: string
  lastName: string
  dateOfBirth: string
  homePostcode: string
  yearGroup: string
  className: string
}) {
  return `${input.firstName.toLowerCase()}::${input.lastName.toLowerCase()}::${input.dateOfBirth.toLowerCase()}::${input.homePostcode.toLowerCase()}::${input.yearGroup.toLowerCase()}::${input.className.toLowerCase()}`
}

function statusChip(status: StudentRow['tagStatus']) {
  return status === 'assigned' ? 'Assigned' : 'Unassigned'
}

export function StudentWorkspace({
  students,
  createStudentAction,
  importStudentsAction,
  contactActions
}: StudentWorkspaceProps) {
  const [createMessage, setCreateMessage] = useState<string | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [acceptedRows, setAcceptedRows] = useState<ImportStudentPayload['rows']>([])
  const [isPending, startTransition] = useTransition()

  const previewSummary = useMemo(() => {
    const acceptedCount = previewRows.filter((row) => row.status === 'accepted').length
    const missingRequiredCount = previewRows.filter((row) => row.status === 'missing_required').length
    const duplicateCount = previewRows.filter((row) => row.status === 'duplicate_in_file').length

    return {
      acceptedCount,
      missingRequiredCount,
      duplicateCount,
      totalCount: previewRows.length
    }
  }, [previewRows])

  function handleCreateStudentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload: CreateStudentPayload = {
      firstName: String(formData.get('firstName') ?? ''),
      lastName: String(formData.get('lastName') ?? ''),
      dateOfBirth: String(formData.get('dateOfBirth') ?? ''),
      homePostcode: String(formData.get('homePostcode') ?? ''),
      yearGroup: String(formData.get('yearGroup') ?? ''),
      className: String(formData.get('className') ?? ''),
      active: formData.get('active') === 'on'
    }

    startTransition(async () => {
      const result = await createStudentAction(payload)
      setCreateMessage(result.message)

      if (result.ok) {
        form.reset()
      }
    })
  }

  async function handleCsvPreview(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const csvText = await file.text()

    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader
    })

    const seen = new Set<string>()
    const nextPreviewRows: PreviewRow[] = []
    const nextAcceptedRows: ImportStudentPayload['rows'] = []

    parseResult.data.forEach((row, index) => {
      const firstName = normalizeText(row.first_name)
      const lastName = normalizeText(row.last_name)
      const dateOfBirth = normalizeText(row.date_of_birth)
      const parsedDob = parseDobDdMmYyyyToIso(dateOfBirth)
      const homePostcode = normalizeText(row.home_postcode)
      const normalizedHomePostcode = normalizeUkPostcodeForMatch(homePostcode)
      const yearGroup = normalizeText(row.year_group || row.year)
      const className = normalizeText(row.class_name || row.class)
      const active = parseActiveValue(normalizeText(row.active))

      if (!firstName || !lastName) {
        nextPreviewRows.push({
          rowNumber: index + 2,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || null,
          homePostcode: homePostcode || null,
          yearGroup: yearGroup || null,
          className: className || null,
          status: 'missing_required'
        })
        return
      }

      if (dateOfBirth && !parsedDob) {
        nextPreviewRows.push({
          rowNumber: index + 2,
          firstName,
          lastName,
          dateOfBirth,
          homePostcode: homePostcode || null,
          yearGroup: yearGroup || null,
          className: className || null,
          status: 'invalid_dob'
        })
        return
      }

      if (homePostcode && !normalizedHomePostcode) {
        nextPreviewRows.push({
          rowNumber: index + 2,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || null,
          homePostcode,
          yearGroup: yearGroup || null,
          className: className || null,
          status: 'invalid_postcode'
        })
        return
      }

      const rowKey = buildStudentKey({
        firstName,
        lastName,
        dateOfBirth,
        homePostcode: normalizedHomePostcode ?? '',
        yearGroup,
        className
      })

      if (seen.has(rowKey)) {
        nextPreviewRows.push({
          rowNumber: index + 2,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || null,
          homePostcode: homePostcode || null,
          yearGroup: yearGroup || null,
          className: className || null,
          status: 'duplicate_in_file'
        })
        return
      }

      seen.add(rowKey)

      nextPreviewRows.push({
        rowNumber: index + 2,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || null,
        homePostcode: homePostcode || null,
        yearGroup: yearGroup || null,
        className: className || null,
        status: 'accepted'
      })

      nextAcceptedRows.push({
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || null,
        homePostcode: homePostcode || null,
        yearGroup: yearGroup || null,
        className: className || null,
        active
      })
    })

    setPreviewRows(nextPreviewRows)
    setAcceptedRows(nextAcceptedRows)
    setImportMessage(null)
  }

  function handleImportCommit() {
    startTransition(async () => {
      const result = await importStudentsAction({
        rows: acceptedRows
      })

      setImportMessage(result.message)

      if (result.ok) {
        setPreviewRows([])
        setAcceptedRows([])
      }
    })
  }

  return (
    <div>
      <section aria-labelledby="students-table-heading">
        <h2 id="students-table-heading">Students</h2>
        {students.length === 0 ? (
          <p>No students added yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>First name</th>
                <th>Last name</th>
                <th>DOB</th>
                <th>Postcode</th>
                <th>Year</th>
                <th>Class</th>
                <th>Tag status</th>
                <th>Tagged items</th>
                <th>Active</th>
                <th>Trusted Contacts</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.firstName}</td>
                  <td>{student.lastName}</td>
                  <td>{formatIsoDobToDdMmYyyy(student.dateOfBirth) ?? '—'}</td>
                  <td>{student.homePostcode ?? '—'}</td>
                  <td>{student.yearGroup ?? '—'}</td>
                  <td>{student.className ?? '—'}</td>
                  <td>{statusChip(student.tagStatus)}</td>
                  <td>{student.items.length ? (
                    <details>
                      <summary>{student.items.length} {student.items.length === 1 ? 'item' : 'items'}</summary>
                      <ul>{student.items.map((item) => (
                        <li key={item.id}>
                          {formatItemClassification(item.itemKind, item.laptopOwnership)}
                          {' · '}<code>{item.serial}</code>{' · '}{item.active ? 'Active' : 'Inactive'}
                        </li>
                      ))}</ul>
                    </details>
                  ) : 'No tagged items'}</td>
                  <td>{student.active ? 'Active' : 'Inactive'}</td>
                  <td>
                    <TrustedContactEditor studentId={student.id} contacts={student.trustedContacts} legacyEmail={student.parentEmail} actions={contactActions} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>


      <section aria-labelledby="student-create-heading">
        <h2 id="student-create-heading">Add one student</h2>
        <form noValidate onSubmit={handleCreateStudentSubmit}>
          <label>
            First name
            <input name="firstName" type="text" required />
          </label>
          <label>
            Last name
            <input name="lastName" type="text" required />
          </label>
          <label>
            Date of birth (DD-MM-YYYY)
            <input name="dateOfBirth" type="text" placeholder="DD-MM-YYYY" />
          </label>
          <label>
            Home postcode
            <input name="homePostcode" type="text" />
          </label>
          <label>
            Year
            <input name="yearGroup" type="text" />
          </label>
          <label>
            Class
            <input name="className" type="text" />
          </label>
          <label>
            Active
            <input name="active" type="checkbox" defaultChecked />
          </label>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save student'}
          </button>
        </form>
        {createMessage ? <p role="status">{createMessage}</p> : null}
      </section>

      <section aria-labelledby="student-import-heading">
        <h2 id="student-import-heading">CSV import</h2>
        <p>
          Upload CSV with headers `first_name,last_name,date_of_birth,home_postcode,year_group,class_name,active`.
          Date of birth must be DD-MM-YYYY.
        </p>
        <label>
          CSV file
          <input type="file" accept=".csv,text/csv" onChange={handleCsvPreview} />
        </label>

        {previewRows.length > 0 ? (
          <div>
            <p>
              {previewSummary.acceptedCount} accepted. {previewSummary.missingRequiredCount}{' '}
              missing required names. {previewSummary.duplicateCount} duplicates in file.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>First name</th>
                  <th>Last name</th>
                  <th>DOB</th>
                  <th>Postcode</th>
                  <th>Year</th>
                  <th>Class</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={`${row.rowNumber}-${row.firstName}-${row.lastName}`}>
                    <td>{row.rowNumber}</td>
                    <td>{row.firstName || '—'}</td>
                    <td>{row.lastName || '—'}</td>
                    <td>{row.dateOfBirth ?? '—'}</td>
                    <td>{row.homePostcode ?? '—'}</td>
                    <td>{row.yearGroup ?? '—'}</td>
                    <td>{row.className ?? '—'}</td>
                    <td>
                      {row.status === 'accepted'
                        ? 'Accepted'
                        : row.status === 'missing_required'
                          ? 'Missing first/last name'
                          : row.status === 'invalid_dob'
                            ? 'Invalid DOB (use DD-MM-YYYY)'
                            : row.status === 'invalid_postcode'
                              ? 'Invalid postcode'
                              : 'Duplicate in file'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              disabled={isPending || acceptedRows.length === 0}
              onClick={handleImportCommit}
            >
              {isPending ? 'Importing…' : 'Commit import'}
            </button>
          </div>
        ) : null}

        {importMessage ? <p role="status">{importMessage}</p> : null}
      </section>
    </div>
  )
}
