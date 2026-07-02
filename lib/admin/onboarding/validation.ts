const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type SchoolSetupInput = {
  name: string
  slug: string
  contactEmail: string
  contactPhone?: string
  address?: string
  pendingAdminFullName: string
  pendingAdminEmail: string
}

export type ValidSchoolSetupInput = {
  name: string
  slug: string
  contactEmail: string
  contactPhone: string | null
  address: string | null
  pendingAdminFullName: string
  pendingAdminEmail: string
}

type ValidationResult =
  | {
      ok: true
      value: ValidSchoolSetupInput
    }
  | {
      ok: false
      message: string
    }

function normaliseOptionalField(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value)
}

export function validateSchoolSetupInput(input: SchoolSetupInput): ValidationResult {
  const name = input.name.trim()
  const slug = input.slug.trim().toLowerCase()
  const contactEmail = input.contactEmail.trim().toLowerCase()
  const pendingAdminFullName = input.pendingAdminFullName.trim()
  const pendingAdminEmail = input.pendingAdminEmail.trim().toLowerCase()
  const contactPhone = normaliseOptionalField(input.contactPhone)
  const address = normaliseOptionalField(input.address)

  if (!name) {
    return { ok: false, message: 'School name is required.' }
  }

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      message: 'Use lowercase letters, numbers, and hyphens for the school slug.'
    }
  }

  if (!isValidEmail(contactEmail)) {
    return { ok: false, message: 'Enter a valid school contact email address.' }
  }

  if (!pendingAdminFullName) {
    return { ok: false, message: 'Pending school-admin full name is required.' }
  }

  if (!isValidEmail(pendingAdminEmail)) {
    return { ok: false, message: 'Enter a valid pending school-admin email address.' }
  }

  return {
    ok: true,
    value: {
      name,
      slug,
      contactEmail,
      contactPhone,
      address,
      pendingAdminFullName,
      pendingAdminEmail
    }
  }
}
