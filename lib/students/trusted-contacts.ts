export type TrustedContact = {
  id: string
  displayName: string | null
  relationship: string | null
  email: string
  phone: string | null
  approved: boolean
  enabled: boolean
}

export type TrustedContactInput = {
  studentId: string
  contactId?: string
  displayName: string
  relationship: string
  email: string
  phone: string
  approved: boolean
  enabled: boolean
}

export type ContactResult = { ok: boolean; message: string; data: Record<string, never> }
export type ContactActions = {
  save: (input: TrustedContactInput) => Promise<ContactResult>
  remove: (input: { studentId: string; contactId: string }) => Promise<ContactResult>
}
