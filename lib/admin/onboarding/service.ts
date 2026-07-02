import { requireRole } from '@/lib/auth/require-role'
import type {
  ClassifiedProvisioningRow,
  ExistingProvisionedTag,
  InventorySnapshot,
  PendingSchoolAdminStatus,
  SchoolOption
} from '@/lib/admin/onboarding/contracts'
import type { AdminContext } from '@/lib/types/auth'
import { classifyProvisioningRows, parseProvisioningCsv } from '@/lib/admin/onboarding/csv'
import { signProvisioningPreview, verifyProvisioningPreview } from '@/lib/admin/onboarding/preview-token'
import type { SchoolSetupInput } from '@/lib/admin/onboarding/validation'
import { validateSchoolSetupInput } from '@/lib/admin/onboarding/validation'

type OrganisationRecord = SchoolOption & {
  contactEmail: string
  contactPhone: string | null
  address: string | null
}

type PendingSchoolAdminRecord = {
  id: string
  organisationId: string
  fullName: string
  email: string
  status: PendingSchoolAdminStatus
}

type TagInsertRecord = {
  organisationId: string
  serial: string
  active: boolean
}

export type CreateSchoolWorkflowInput = SchoolSetupInput & {
  actorUserId: string
}

export type PreviewProvisioningInput = {
  actorUserId: string
  organisationId: string
  csvText: string
}

export type CommitProvisioningInput = {
  actorUserId: string
  organisationId: string
  previewToken: string
}

export type ProvisioningPreviewResult = {
  uidColumnHeader: string
  rows: ClassifiedProvisioningRow[]
  summary: {
    totalRows: number
    validRows: number
    duplicateRows: number
    invalidRows: number
    conflictRows: number
  }
  previewToken: string
}

export type CommitProvisioningResult = {
  insertedCount: number
  duplicateCount: number
  invalidCount: number
  conflictCount: number
  inventorySnapshot: InventorySnapshot
}

export type ServiceDeps = {
  loadAdminContext: (userId: string) => Promise<AdminContext | null>
  insertOrganisation: (input: {
    name: string
    slug: string
    contactEmail: string
    contactPhone: string | null
    address: string | null
  }) => Promise<OrganisationRecord>
  insertPendingAdmin: (input: {
    organisationId: string
    fullName: string
    email: string
    status: PendingSchoolAdminStatus
  }) => Promise<PendingSchoolAdminRecord>
  listTagsBySerial: (serials: string[]) => Promise<ExistingProvisionedTag[]>
  insertTags: (rows: TagInsertRecord[]) => Promise<void>
  loadInventorySnapshot: (organisationId: string) => Promise<InventorySnapshot>
  previewSecret?: string
  now?: () => Date
}

async function assertSuperadmin(actorUserId: string, deps: ServiceDeps) {
  const adminContext = await deps.loadAdminContext(actorUserId)

  if (!requireRole(adminContext, ['ifoundit_superadmin'])) {
    throw new Error('This action is restricted to iFoundIt superadmins.')
  }
}

function buildRowsFromAcceptedSerials(serials: string[]) {
  return serials.map((serial, index) => ({
    rowNumber: index + 1,
    sourceValue: serial,
    normalizedSerial: serial
  }))
}

export async function createSchoolWithPendingAdmin(
  input: CreateSchoolWorkflowInput,
  deps: ServiceDeps
) {
  await assertSuperadmin(input.actorUserId, deps)

  const validated = validateSchoolSetupInput(input)

  if (!validated.ok) {
    throw new Error(validated.message)
  }

  const organisation = await deps.insertOrganisation({
    name: validated.value.name,
    slug: validated.value.slug,
    contactEmail: validated.value.contactEmail,
    contactPhone: validated.value.contactPhone,
    address: validated.value.address
  })

  const pendingAdmin = await deps.insertPendingAdmin({
    organisationId: organisation.id,
    fullName: validated.value.pendingAdminFullName,
    email: validated.value.pendingAdminEmail,
    status: 'pending_invite'
  })

  return {
    organisation,
    pendingAdmin
  }
}

export async function previewTagProvisioning(
  input: PreviewProvisioningInput,
  deps: ServiceDeps
): Promise<ProvisioningPreviewResult> {
  await assertSuperadmin(input.actorUserId, deps)

  if (!input.organisationId.trim()) {
    throw new Error('Select a school before importing tags.')
  }

  const parsedCsv = parseProvisioningCsv(input.csvText)
  const existingTags = await deps.listTagsBySerial(parsedCsv.normalizedSerials)
  const classification = classifyProvisioningRows(
    parsedCsv.rows,
    existingTags,
    input.organisationId
  )

  return {
    uidColumnHeader: parsedCsv.uidColumn.header,
    rows: classification.rows,
    summary: classification.summary,
    previewToken: signProvisioningPreview(
      {
        organisationId: input.organisationId,
        acceptedSerials: classification.acceptedSerials,
        generatedAt: (deps.now ?? (() => new Date()))().toISOString()
      },
      deps.previewSecret
    )
  }
}

export async function commitTagProvisioning(
  input: CommitProvisioningInput,
  deps: ServiceDeps
): Promise<CommitProvisioningResult> {
  await assertSuperadmin(input.actorUserId, deps)

  if (!input.organisationId.trim()) {
    throw new Error('Select a school before importing tags.')
  }

  const preview = verifyProvisioningPreview(
    input.previewToken,
    deps.previewSecret,
    (deps.now ?? (() => new Date()))()
  )

  if (!preview || preview.organisationId !== input.organisationId) {
    throw new Error('Preview expired. Upload the CSV again.')
  }

  const existingTags = await deps.listTagsBySerial(preview.acceptedSerials)
  const classification = classifyProvisioningRows(
    buildRowsFromAcceptedSerials(preview.acceptedSerials),
    existingTags,
    input.organisationId
  )

  if (classification.acceptedSerials.length > 0) {
    await deps.insertTags(
      classification.acceptedSerials.map((serial) => ({
        organisationId: input.organisationId,
        serial,
        active: true
      }))
    )
  }

  const inventorySnapshot = await deps.loadInventorySnapshot(input.organisationId)

  return {
    insertedCount: classification.acceptedSerials.length,
    duplicateCount: classification.summary.duplicateRows,
    invalidCount: classification.summary.invalidRows,
    conflictCount: classification.summary.conflictRows,
    inventorySnapshot
  }
}
