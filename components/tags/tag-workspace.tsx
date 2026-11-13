'use client'

import React, { useState, useTransition } from 'react'
import { formatItemClassification } from '@/lib/tags/item-classification'

type TagRow = {
  id: string
  serial: string
  assignedStudentName: string | null
  active: boolean
  itemKind: string | null
  laptopOwnership: string | null
}

type StudentOption = {
  id: string
  fullName: string
}

type ActionResponse<T> = {
  ok: boolean
  message: string
  data: T
}

type BulkAssignResult = {
  assignedCount: number
  errors: Array<{
    rowNumber: number
    serial: string
    reason: string
  }>
}

type TagWorkspaceProps = {
  tags: TagRow[]
  students: StudentOption[]
  assignTagToStudentAction: (input: { tagId: string; studentId: string; itemKind: 'phone_pouch' | 'hero_laptop'; laptopOwnership?: 'student' | 'school' }) => Promise<ActionResponse<Record<string, never>>>
  bulkAssignTagsAction: (input: FormData) => Promise<ActionResponse<BulkAssignResult>>
}

export function TagWorkspace({
  tags,
  students,
  assignTagToStudentAction,
  bulkAssignTagsAction
}: TagWorkspaceProps) {
  const [selectedTagId, setSelectedTagId] = useState(tags.find((tag) => !tag.assignedStudentName)?.id ?? '')
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? '')
  const [itemKind, setItemKind] = useState<'phone_pouch' | 'hero_laptop'>('phone_pouch')
  const [laptopOwnership, setLaptopOwnership] = useState<'student' | 'school'>('student')
  const [manualMessage, setManualMessage] = useState<string | null>(null)
  const [bulkMessage, setBulkMessage] = useState<string | null>(null)
  const [bulkErrors, setBulkErrors] = useState<BulkAssignResult['errors']>([])
  const [isPending, startTransition] = useTransition()

  function handleManualAssign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(async () => {
      const result = await assignTagToStudentAction({
        tagId: selectedTagId,
        studentId: selectedStudentId,
        itemKind,
        laptopOwnership: itemKind === 'hero_laptop' ? laptopOwnership : undefined
      })

      setManualMessage(result.message)
    })
  }

  function handleBulkAssign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await bulkAssignTagsAction(formData)

      setBulkMessage(result.message)
      setBulkErrors(result.data.errors)
    })
  }

  return (
    <div>
      <section aria-labelledby="tags-table-heading">
        <h2 id="tags-table-heading">Tags</h2>
        {tags.length === 0 ? (
          <p>No tags provisioned for this school yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Serial</th>
                <th>Status</th>
                <th>Student</th>
                <th>Item</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{tag.serial}</td>
                  <td>{tag.assignedStudentName ? 'Assigned' : 'Unassigned'}</td>
                  <td>{tag.assignedStudentName ?? '—'}</td>
                  <td>{formatItemClassification(tag.itemKind, tag.laptopOwnership)}</td>
                  <td>{tag.active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="manual-tag-assignment-heading">
        <h2 id="manual-tag-assignment-heading">Manual assignment</h2>
        {tags.length === 0 || students.length === 0 ? (
          <p>Provision tags and add students before assigning.</p>
        ) : (
          <form noValidate onSubmit={handleManualAssign}>
            <label>
              Tag
              <select
                value={selectedTagId}
                onChange={(event) => setSelectedTagId(event.target.value)}
                required
              >
                <option value="">Select a tag</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.serial} {tag.assignedStudentName ? '(Assigned)' : '(Unassigned)'}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Student
              <select
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                required
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Item type
              <select value={itemKind} onChange={(event) => setItemKind(event.target.value as 'phone_pouch' | 'hero_laptop')}>
                <option value="phone_pouch">Phone pouch</option>
                <option value="hero_laptop">BYOD laptop</option>
              </select>
            </label>
            {itemKind === 'hero_laptop' ? (
              <label>
                Laptop owner
                <select value={laptopOwnership} onChange={(event) => setLaptopOwnership(event.target.value as 'student' | 'school')}>
                  <option value="student">Student owned</option>
                  <option value="school">School owned</option>
                </select>
              </label>
            ) : null}
            <button type="submit" disabled={isPending || !selectedTagId || !selectedStudentId}>
              {isPending ? 'Assigning…' : 'Assign tag'}
            </button>
          </form>
        )}

        {manualMessage ? <p role="status">{manualMessage}</p> : null}
      </section>

      <section aria-labelledby="bulk-tag-assignment-heading">
        <h2 id="bulk-tag-assignment-heading">Bulk CSV assignment</h2>
        <p>
          Upload CSV with headers <code>serial,first_name,last_name,date_of_birth,home_postcode</code>.
          <code>date_of_birth</code> must be DD-MM-YYYY. <code>home_postcode</code> is matched uppercase with spaces removed.
        </p>
        <p>
          To classify items, add optional <code>item_kind,laptop_ownership</code> columns.
          Use <code>hero_laptop,student</code> or <code>hero_laptop,school</code> for laptops;
          use <code>phone_pouch</code> with blank ownership for pouches. Leaving both blank
          preserves the tag&apos;s current classification. Inactive tags and duplicate serials are rejected.
        </p>
        <p><a href="/templates/tag-assignments.csv" download>Download the CSV template</a></p>
        <form noValidate onSubmit={handleBulkAssign}>
          <label>
            CSV file
            <input name="csvFile" type="file" accept=".csv,text/csv" required />
          </label>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Assigning…' : 'Run bulk assignment'}
          </button>
        </form>

        {bulkMessage ? <p role="status">{bulkMessage}</p> : null}

        {bulkErrors.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Row</th>
                <th>Serial</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {bulkErrors.map((error) => (
                <tr key={`${error.rowNumber}-${error.serial}-${error.reason}`}>
                  <td>{error.rowNumber}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{error.serial || '—'}</td>
                  <td>{error.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </div>
  )
}
