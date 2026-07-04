'use client'

import React, { useMemo, useState, useTransition } from 'react'

import type { ActionResponse, InventorySnapshot, SchoolOption } from '@/lib/admin/onboarding/contracts'
import type {
  CommitProvisioningResult,
  ProvisioningPreviewResult
} from '@/lib/admin/onboarding/service'

type CommitProvisioningPayload = {
  organisationId: string
  previewToken: string
}

type SuperadminTagProvisioningPanelProps = {
  schools: SchoolOption[]
  previewProvisioningAction: (
    input: FormData
  ) => Promise<ActionResponse<ProvisioningPreviewResult>>
  commitProvisioningAction: (
    input: CommitProvisioningPayload
  ) => Promise<ActionResponse<CommitProvisioningResult>>
}

function formatProvisioningReason(reason: ProvisioningPreviewResult['rows'][number]['reason']) {
  switch (reason) {
    case 'accepted':
      return 'Accepted'
    case 'blank_uid':
      return 'Blank UID'
    case 'malformed_uid':
      return 'Malformed UID'
    case 'duplicate_in_file':
      return 'Duplicate in file'
    case 'already_provisioned_to_school':
      return 'Already provisioned to this school'
    case 'allocated_to_another_school':
      return 'Allocated to another school'
    default:
      return reason
  }
}

export function SuperadminTagProvisioningPanel({
  schools,
  previewProvisioningAction,
  commitProvisioningAction
}: SuperadminTagProvisioningPanelProps) {
  const [selectedOrganisationId, setSelectedOrganisationId] = useState(schools[0]?.id ?? '')
  const [previewMessage, setPreviewMessage] = useState<string | null>(null)
  const [commitMessage, setCommitMessage] = useState<string | null>(null)
  const [previewSchoolId, setPreviewSchoolId] = useState<string | null>(null)
  const [previewResult, setPreviewResult] = useState<ProvisioningPreviewResult | null>(null)
  const [inventorySnapshot, setInventorySnapshot] = useState<InventorySnapshot | null>(null)
  const [isPending, startTransition] = useTransition()

  const previewSchoolName = useMemo(
    () => schools.find((school) => school.id === previewSchoolId)?.name ?? 'selected school',
    [previewSchoolId, schools]
  )

  function handlePreviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const organisationId = String(formData.get('organisationId') ?? '')

    startTransition(async () => {
      const result = await previewProvisioningAction(formData)

      setPreviewMessage(result.message)
      setCommitMessage(null)

      if (!result.ok) {
        setPreviewResult(null)
        return
      }

      setPreviewSchoolId(organisationId)
      setPreviewResult(result.data)
    })
  }

  function handleCommitClick() {
    if (!previewResult || !previewSchoolId) {
      return
    }

    startTransition(async () => {
      const result = await commitProvisioningAction({
        organisationId: previewSchoolId,
        previewToken: previewResult.previewToken
      })

      setCommitMessage(result.message)

      if (!result.ok) {
        return
      }

      setPreviewResult(null)
      setInventorySnapshot(result.data.inventorySnapshot)
    })
  }

  return (
    <section aria-labelledby="superadmin-tags-heading">
      <h2 id="superadmin-tags-heading">Tag provisioning</h2>
      <p>Provision supplier NFC serials into school inventory. Bulk actions support up to 500 rows.</p>

      <form noValidate onSubmit={handlePreviewSubmit}>
        <label>
          School
          <select
            name="organisationId"
            value={selectedOrganisationId}
            onChange={(event) => setSelectedOrganisationId(event.target.value)}
            required
          >
            <option value="">Select a school</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          CSV file
          <input name="csvFile" type="file" accept=".csv,text/csv" required />
        </label>

        <button type="submit" disabled={isPending}>
          {isPending ? 'Reviewing…' : 'Review import'}
        </button>
      </form>

      {previewMessage ? <p role="status">{previewMessage}</p> : null}

      {previewResult ? (
        <div>
          <h3>Import review for {previewSchoolName}</h3>
          <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            UID column: {previewResult.uidColumnHeader}
          </p>
          <p>
            {previewResult.summary.validRows} valid rows. {previewResult.summary.duplicateRows}{' '}
            duplicate rows. {previewResult.summary.invalidRows} invalid rows.{' '}
            {previewResult.summary.conflictRows} cross-school conflicts.
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Row</th>
                <th scope="col">Serial</th>
                <th scope="col">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {previewResult.rows.map((row) => (
                <tr key={`${row.rowNumber}-${row.sourceValue}`}>
                  <td>{row.rowNumber}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {row.normalizedSerial ?? (row.sourceValue || 'Blank')}
                  </td>
                  <td>{formatProvisioningReason(row.reason)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            disabled={isPending || previewResult.summary.validRows === 0}
            onClick={handleCommitClick}
          >
            Provision accepted tags
          </button>
        </div>
      ) : null}

      {commitMessage ? <p role="status">{commitMessage}</p> : null}

      {inventorySnapshot ? (
        <p role="status">
          Current provisioned inventory: {inventorySnapshot.provisionedInventoryCount}. Current
          unassigned inventory: {inventorySnapshot.unassignedInventoryCount}.
        </p>
      ) : null}
    </section>
  )
}
