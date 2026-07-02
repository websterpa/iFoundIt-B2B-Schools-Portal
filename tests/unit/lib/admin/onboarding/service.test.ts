import { describe, expect, it, vi } from 'vitest'

import {
  commitTagProvisioning,
  createSchoolWithPendingAdmin,
  previewTagProvisioning
} from '@/lib/admin/onboarding/service'

function createDeps() {
  return {
    loadAdminContext: vi.fn().mockResolvedValue({
      id: 'user-1',
      organisationId: null,
      role: 'ifoundit_superadmin' as const
    }),
    insertOrganisation: vi.fn().mockResolvedValue({
      id: 'org-1',
      name: 'Example School',
      slug: 'example-school',
      contactEmail: 'office@example.org',
      contactPhone: null,
      address: null
    }),
    insertPendingAdmin: vi.fn().mockResolvedValue({
      id: 'pending-1',
      organisationId: 'org-1',
      fullName: 'Alex Carter',
      email: 'alex@example.org',
      status: 'pending_invite' as const
    }),
    listTagsBySerial: vi.fn().mockResolvedValue([]),
    insertTags: vi.fn().mockResolvedValue(undefined),
    loadInventorySnapshot: vi.fn().mockResolvedValue({
      organisationId: 'org-1',
      provisionedInventoryCount: 2,
      unassignedInventoryCount: 2
    }),
    previewSecret: 'test-secret',
    now: () => new Date('2026-07-01T12:00:00.000Z')
  }
}

describe('onboarding service', () => {
  it('rejects school creation for non-superadmins', async () => {
    const deps = createDeps()
    deps.loadAdminContext.mockResolvedValueOnce({
      id: 'user-1',
      organisationId: 'org-1',
      role: 'school_admin'
    })

    await expect(
      createSchoolWithPendingAdmin(
        {
          actorUserId: 'user-1',
          name: 'Example School',
          slug: 'example-school',
          contactEmail: 'office@example.org',
          pendingAdminFullName: 'Alex Carter',
          pendingAdminEmail: 'alex@example.org'
        },
        deps
      )
    ).rejects.toThrow(/superadmin/i)
  })

  it('creates a school and pending admin record when the input is valid', async () => {
    const deps = createDeps()

    const result = await createSchoolWithPendingAdmin(
      {
        actorUserId: 'user-1',
        name: 'Example School',
        slug: 'example-school',
        contactEmail: 'office@example.org',
        pendingAdminFullName: 'Alex Carter',
        pendingAdminEmail: 'alex@example.org'
      },
      deps
    )

    expect(result.organisation.id).toBe('org-1')
    expect(result.pendingAdmin.status).toBe('pending_invite')
  })

  it('fails closed when no organisation is selected for preview', async () => {
    const deps = createDeps()

    await expect(
      previewTagProvisioning(
        {
          actorUserId: 'user-1',
          organisationId: '',
          csvText: 'uid\nAB12CD34'
        },
        deps
      )
    ).rejects.toThrow(/select a school/i)
  })

  it('summarizes preview rows before provisioning', async () => {
    const deps = createDeps()
    deps.listTagsBySerial.mockResolvedValueOnce([
      { serial: 'ZXCVBN12', organisationId: 'org-2', active: true }
    ])

    const result = await previewTagProvisioning(
      {
        actorUserId: 'user-1',
        organisationId: 'org-1',
        csvText: ['uid', 'AB12CD34', 'bad-uid', 'ZXCVBN12'].join('\n')
      },
      deps
    )

    expect(result.summary.validRows).toBe(1)
    expect(result.summary.conflictRows).toBe(1)
    expect(result.summary.invalidRows).toBe(1)
  })

  it('revalidates previewed rows before inserting tags', async () => {
    const deps = createDeps()

    const preview = await previewTagProvisioning(
      {
        actorUserId: 'user-1',
        organisationId: 'org-1',
        csvText: ['uid', 'AB12CD34', 'ZXCVBN12'].join('\n')
      },
      deps
    )

    deps.listTagsBySerial.mockResolvedValueOnce([
      { serial: 'ZXCVBN12', organisationId: 'org-2', active: true }
    ])

    const result = await commitTagProvisioning(
      {
        actorUserId: 'user-1',
        organisationId: 'org-1',
        previewToken: preview.previewToken
      },
      deps
    )

    expect(deps.insertTags).toHaveBeenCalledWith([
      { organisationId: 'org-1', serial: 'AB12CD34', active: true }
    ])
    expect(result.insertedCount).toBe(1)
    expect(result.conflictCount).toBe(1)
  })
})
