'use client'

import React, { useState, useTransition } from 'react'

import type { ActionResponse, InventorySnapshot, SchoolOption } from '@/lib/admin/onboarding/contracts'
import type {
  CommitProvisioningResult,
  ProvisioningPreviewResult
} from '@/lib/admin/onboarding/service'

type CreateSchoolPayload = {
  name: string
  slug: string
  contactEmail: string
  contactPhone: string
  address: string
  pendingAdminFullName: string
  pendingAdminEmail: string
}

type CommitProvisioningPayload = {
  organisationId: string
  previewToken: string
}

type CreateSchoolResult = {
  school: SchoolOption
  pendingAdminStatus: string
}

type SuperadminOnboardingWorkspaceProps = {
  schools: SchoolOption[]
  createSchoolAction: (
    input: CreateSchoolPayload
  ) => Promise<ActionResponse<CreateSchoolResult>>
  previewProvisioningAction: (
    input: FormData
  ) => Promise<ActionResponse<ProvisioningPreviewResult>>
  commitProvisioningAction: (
    input: CommitProvisioningPayload
  ) => Promise<ActionResponse<CommitProvisioningResult>>
}

function sortSchools(schools: SchoolOption[]) {
  return [...schools].sort((left, right) => left.name.localeCompare(right.name))
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

function InventorySummary({ snapshot }: { snapshot: InventorySnapshot }) {
  return (
    <p role="status">
      Current provisioned inventory: {snapshot.provisionedInventoryCount}. Current unassigned
      inventory: {snapshot.unassignedInventoryCount}.
    </p>
  )
}

export function SuperadminOnboardingWorkspace({
  schools: initialSchools,
  createSchoolAction,
  previewProvisioningAction,
  commitProvisioningAction
}: SuperadminOnboardingWorkspaceProps) {
  const [schools, setSchools] = useState(() => sortSchools(initialSchools))
  const [selectedOrganisationId, setSelectedOrganisationId] = useState(initialSchools[0]?.id ?? '')
  const [createMessage, setCreateMessage] = useState<string | null>(null)
  const [previewMessage, setPreviewMessage] = useState<string | null>(null)
  const [commitMessage, setCommitMessage] = useState<string | null>(null)
  const [previewSchoolId, setPreviewSchoolId] = useState<string | null>(null)
  const [previewResult, setPreviewResult] = useState<ProvisioningPreviewResult | null>(null)
  const [inventorySnapshot, setInventorySnapshot] = useState<InventorySnapshot | null>(null)
  const [isPending, startTransition] = useTransition()

  const previewSchoolName =
    schools.find((school) => school.id === previewSchoolId)?.name ?? 'selected school'

  function handleCreateSchoolSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const payload = {
      name: String(new FormData(form).get('name') ?? ''),
      slug: String(new FormData(form).get('slug') ?? ''),
      contactEmail: String(new FormData(form).get('contactEmail') ?? ''),
      contactPhone: String(new FormData(form).get('contactPhone') ?? ''),
      address: String(new FormData(form).get('address') ?? ''),
      pendingAdminFullName: String(new FormData(form).get('pendingAdminFullName') ?? ''),
      pendingAdminEmail: String(new FormData(form).get('pendingAdminEmail') ?? '')
    }

    startTransition(async () => {
      const result = await createSchoolAction(payload)

      setCreateMessage(result.message)

      if (!result.ok) {
        return
      }

      setSchools((currentSchools) => sortSchools([...currentSchools, result.data.school]))
      setSelectedOrganisationId((currentValue) => currentValue || result.data.school.id)
      form.reset()
    })
  }

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
    <div>
      <section aria-labelledby="school-setup-heading">
        <h2 id="school-setup-heading">School setup</h2>
        <p>Create the school record first, then keep the pending admin in a waiting state.</p>
        <form noValidate onSubmit={handleCreateSchoolSubmit}>
          <label>
            School name
            <input name="name" type="text" required />
          </label>
          <label>
            School slug
            <input name="slug" type="text" required />
          </label>
          <label>
            Contact email
            <input name="contactEmail" type="email" required />
          </label>
          <label>
            Contact phone
            <input name="contactPhone" type="text" />
          </label>
          <label>
            Address
            <textarea name="address" rows={3} />
          </label>
          <label>
            Pending school-admin full name
            <input name="pendingAdminFullName" type="text" required />
          </label>
          <label>
            Pending school-admin email
            <input name="pendingAdminEmail" type="email" required />
          </label>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Create school'}
          </button>
        </form>
        {createMessage ? <p role="status">{createMessage}</p> : null}
      </section>

      <section aria-labelledby="tag-provisioning-heading">
        <h2 id="tag-provisioning-heading">Tag provisioning</h2>
        <p>Review the supplier CSV before you commit accepted UIDs into school inventory.</p>
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
            <p>Detected UID column: {previewResult.uidColumnHeader}</p>
            <p>
              {previewResult.summary.validRows} valid rows. {previewResult.summary.duplicateRows}{' '}
              duplicate rows. {previewResult.summary.invalidRows} invalid rows.{' '}
              {previewResult.summary.conflictRows} cross-school conflicts.
            </p>
            <table>
              <thead>
                <tr>
                  <th scope="col">Row</th>
                  <th scope="col">UID</th>
                  <th scope="col">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {previewResult.rows.map((row) => (
                  <tr key={`${row.rowNumber}-${row.sourceValue}`}>
                    <td>{row.rowNumber}</td>
                    <td>{row.normalizedSerial ?? (row.sourceValue || 'Blank')}</td>
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
        {inventorySnapshot ? <InventorySummary snapshot={inventorySnapshot} /> : null}
      </section>
    </div>
  )
}
