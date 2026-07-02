import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SuperadminOnboardingWorkspace } from '@/components/admin/superadmin-onboarding-workspace'

describe('SuperadminOnboardingWorkspace', () => {
  it('renders the school setup and tag provisioning panels', () => {
    render(
      <SuperadminOnboardingWorkspace
        schools={[{ id: 'org-1', name: 'School One', slug: 'school-one' }]}
        createSchoolAction={vi.fn()}
        previewProvisioningAction={vi.fn()}
        commitProvisioningAction={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: /school setup/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /tag provisioning/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/csv file/i)).toBeInTheDocument()
  })

  it('submits the school setup form through the provided action', async () => {
    const user = userEvent.setup()
    const createSchoolAction = vi.fn().mockResolvedValue({
      ok: true,
      message: 'School created. Pending admin is waiting for invite/reset.',
      data: {
        school: {
          id: 'org-2',
          name: 'School Two',
          slug: 'school-two'
        },
        pendingAdminStatus: 'pending_invite'
      }
    })

    render(
      <SuperadminOnboardingWorkspace
        schools={[{ id: 'org-1', name: 'School One', slug: 'school-one' }]}
        createSchoolAction={createSchoolAction}
        previewProvisioningAction={vi.fn()}
        commitProvisioningAction={vi.fn()}
      />
    )

    await user.type(screen.getByLabelText(/school name/i), 'School Two')
    await user.type(screen.getByLabelText(/school slug/i), 'school-two')
    await user.type(screen.getByLabelText(/^contact email/i), 'office@schooltwo.org')
    await user.type(screen.getByLabelText(/pending school-admin full name/i), 'Alex Carter')
    await user.type(screen.getByLabelText(/pending school-admin email/i), 'alex@schooltwo.org')
    await user.click(screen.getByRole('button', { name: /create school/i }))

    await waitFor(() => {
      expect(createSchoolAction).toHaveBeenCalledWith({
        name: 'School Two',
        slug: 'school-two',
        contactEmail: 'office@schooltwo.org',
        contactPhone: '',
        address: '',
        pendingAdminFullName: 'Alex Carter',
        pendingAdminEmail: 'alex@schooltwo.org'
      })
    })
  })

  it('previews and commits provisioning through the provided actions', async () => {
    const user = userEvent.setup()
    const previewProvisioningAction = vi.fn().mockResolvedValue({
      ok: true,
      message: '1 tags are ready to provision. Review the skipped rows before you commit.',
      data: {
        uidColumnHeader: 'UID',
        previewToken: 'preview-token',
        summary: {
          totalRows: 1,
          validRows: 1,
          duplicateRows: 0,
          invalidRows: 0,
          conflictRows: 0
        },
        rows: [
          {
            rowNumber: 2,
            sourceValue: 'AB12CD34',
            normalizedSerial: 'AB12CD34',
            status: 'accepted',
            reason: 'accepted'
          }
        ]
      }
    })
    const commitProvisioningAction = vi.fn().mockResolvedValue({
      ok: true,
      message: '1 tags were provisioned. 0 duplicate rows were skipped. 0 rows were invalid. 0 rows were already allocated to another school.',
      data: {
        insertedCount: 1,
        duplicateCount: 0,
        invalidCount: 0,
        conflictCount: 0,
        inventorySnapshot: {
          organisationId: 'org-1',
          provisionedInventoryCount: 1,
          unassignedInventoryCount: 1
        }
      }
    })

    render(
      <SuperadminOnboardingWorkspace
        schools={[{ id: 'org-1', name: 'School One', slug: 'school-one' }]}
        createSchoolAction={vi.fn()}
        previewProvisioningAction={previewProvisioningAction}
        commitProvisioningAction={commitProvisioningAction}
      />
    )

    const file = new File(['UID\nAB12CD34'], 'tags.csv', { type: 'text/csv' })
    const fileInput = screen.getByLabelText(/csv file/i) as HTMLInputElement

    await user.selectOptions(screen.getByLabelText(/^school$/i), 'org-1')
    await user.upload(fileInput, file)
    expect(fileInput.files).toHaveLength(1)
    expect(fileInput.files?.[0]).toStrictEqual(file)
    await user.click(screen.getByRole('button', { name: /review import/i }))

    await waitFor(() => {
      expect(previewProvisioningAction).toHaveBeenCalledTimes(1)
    })

    await user.click(screen.getByRole('button', { name: /provision accepted tags/i }))

    await waitFor(() => {
      expect(commitProvisioningAction).toHaveBeenCalledWith({
        organisationId: 'org-1',
        previewToken: 'preview-token'
      })
    })
  })
})
