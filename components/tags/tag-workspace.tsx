'use client'

import React, { useState, useTransition } from 'react'

type TagRow = {
  id: string
  serial: string
  assignedStudentName: string | null
  active: boolean
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
  assignTagToStudentAction: (input: { tagId: string; studentId: string }) => Promise<ActionResponse<Record<string, never>>>
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
  const [manualMessage, setManualMessage] = useState<string | null>(null)
  const [bulkMessage, setBulkMessage] = useState<string | null>(null)
  const [bulkErrors, setBulkErrors] = useState<BulkAssignResult['errors']>([])
  const [isPending, startTransition] = useTransition()

  function handleManualAssign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(async () => {
      const result = await assignTagToStudentAction({
        tagId: selectedTagId,
        studentId: selectedStudentId
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
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{tag.serial}</td>
                  <td>{tag.assignedStudentName ? 'Assigned' : 'Unassigned'}</td>
                  <td>{tag.assignedStudentName ?? '—'}</td>
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
          Upload CSV with headers `serial,first_name,last_name,date_of_birth,home_postcode`.
          `date_of_birth` must be DD-MM-YYYY. `home_postcode` is matched uppercase with spaces removed.
        </p>
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
