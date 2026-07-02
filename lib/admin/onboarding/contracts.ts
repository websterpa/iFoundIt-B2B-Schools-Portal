export const PENDING_SCHOOL_ADMIN_STATUSES = [
  'pending_invite',
  'activated',
  'cancelled'
] as const

export const TAG_UID_COLUMN_CANDIDATES = ['uid', 'tag_uid', 'serial'] as const
export const TAG_SERIAL_PATTERN = /^[A-Z0-9]{8,}$/
export const PROVISIONING_PREVIEW_MAX_AGE_MINUTES = 15

export type PendingSchoolAdminStatus = (typeof PENDING_SCHOOL_ADMIN_STATUSES)[number]

export type UidColumnMatch = {
  header: string
  index: number
}

export type ParsedProvisioningRow = {
  rowNumber: number
  sourceValue: string
  normalizedSerial: string | null
}

export type ParsedProvisioningCsv = {
  headers: string[]
  uidColumn: UidColumnMatch
  rows: ParsedProvisioningRow[]
  normalizedSerials: string[]
}

export type ExistingProvisionedTag = {
  serial: string
  organisationId: string
  active: boolean
}

export type ClassifiedProvisioningRowStatus = 'accepted' | 'duplicate' | 'invalid' | 'conflict'

export type ClassifiedProvisioningRowReason =
  | 'accepted'
  | 'blank_uid'
  | 'malformed_uid'
  | 'duplicate_in_file'
  | 'already_provisioned_to_school'
  | 'allocated_to_another_school'

export type ClassifiedProvisioningRow = ParsedProvisioningRow & {
  status: ClassifiedProvisioningRowStatus
  reason: ClassifiedProvisioningRowReason
}

export type ProvisioningSummary = {
  totalRows: number
  validRows: number
  duplicateRows: number
  invalidRows: number
  conflictRows: number
}

export type ProvisioningPreviewTokenPayload = {
  organisationId: string
  acceptedSerials: string[]
  generatedAt: string
}

export type SchoolOption = {
  id: string
  name: string
  slug: string
}

export type InventorySnapshot = {
  organisationId: string
  provisionedInventoryCount: number
  unassignedInventoryCount: number
}

export type ActionResponse<T> =
  | {
      ok: true
      message: string
      data: T
    }
  | {
      ok: false
      message: string
    }
