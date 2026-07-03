const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const DEMO_REQUEST_HONEYPOT_FIELD_NAME = 'website'
export const DEMO_REQUEST_TIMESTAMP_FIELD_NAME = 'loaded_at'
export const DEMO_REQUEST_MINIMUM_SUBMISSION_AGE_SECONDS = 2

export const ROLE_OPTIONS = [
  'Headteacher',
  'Deputy or Assistant Head',
  'Business Manager or SBM',
  'IT or Network Manager',
  'Trust COO or CFO',
  'Other'
] as const

export const ROLLOUT_SCOPE_OPTIONS = [
  'Whole school',
  'Specific year group(s)',
  'Trust or group of schools'
] as const

export const SCHOOL_TYPE_OPTIONS = [
  'Academy (single)',
  'Multi-Academy Trust',
  'Local Authority maintained',
  'Free School',
  'Independent or Private',
  'Sixth Form or FE College'
] as const

export const TRUST_SCHOOL_COUNT_OPTIONS = ['2 to 5', '6 to 10', '11 to 20', '21 or more'] as const

export const PUPIL_COUNT_OPTIONS = [
  'Under 300',
  '300 to 600',
  '600 to 1,000',
  '1,000 to 1,500',
  '1,500 or more'
] as const

export const PHONE_POLICY_OPTIONS = [
  'Banned or confiscated',
  'Allowed with restrictions',
  'No formal policy'
] as const

export const LOST_PROPERTY_OPTIONS = ['No system in place', 'Handled by staff time', 'Other'] as const

export const PURCHASE_TIMELINE_OPTIONS = [
  'This term',
  'Next term',
  'Next academic year',
  'Just researching'
] as const

export const BUDGET_AUTHORITY_OPTIONS = [
  'Sole decision maker',
  'Part of a decision-making group',
  'No budget authority'
] as const

export type RoleOption = (typeof ROLE_OPTIONS)[number]
export type RolloutScopeOption = (typeof ROLLOUT_SCOPE_OPTIONS)[number]
export type SchoolTypeOption = (typeof SCHOOL_TYPE_OPTIONS)[number]
export type TrustSchoolCountOption = (typeof TRUST_SCHOOL_COUNT_OPTIONS)[number]
export type PupilCountOption = (typeof PUPIL_COUNT_OPTIONS)[number]
export type PhonePolicyOption = (typeof PHONE_POLICY_OPTIONS)[number]
export type LostPropertyOption = (typeof LOST_PROPERTY_OPTIONS)[number]
export type PurchaseTimelineOption = (typeof PURCHASE_TIMELINE_OPTIONS)[number]
export type BudgetAuthorityOption = (typeof BUDGET_AUTHORITY_OPTIONS)[number]

export type DemoRequestInput = {
  fullName: string
  schoolName: string
  role: string
  email: string
  rolloutScope: string
  schoolType: string
  trustName?: string
  schoolsInTrust?: string
  pupilCount: string
  phonePolicy: string
  lostPropertyHandling: string
  purchaseTimeline: string
  budgetAuthority: string
  marketingConsent: boolean
  message?: string
  [DEMO_REQUEST_HONEYPOT_FIELD_NAME]?: string
  [DEMO_REQUEST_TIMESTAMP_FIELD_NAME]?: string
}

export type ValidDemoRequestInput = {
  fullName: string
  schoolName: string
  role: RoleOption
  email: string
  rolloutScope: RolloutScopeOption
  schoolType: SchoolTypeOption
  trustName: string | null
  schoolsInTrust: TrustSchoolCountOption | null
  pupilCount: PupilCountOption
  phonePolicy: PhonePolicyOption
  lostPropertyHandling: LostPropertyOption
  purchaseTimeline: PurchaseTimelineOption
  budgetAuthority: BudgetAuthorityOption
  marketingConsent: true
  message: string | null
}

type ValidationIssue =
  | 'invalid_payload'
  | 'honeypot_filled'
  | 'submitted_too_fast'
  | 'validation_failed'

type ValidationFailure = {
  ok: false
  issue: ValidationIssue
  message: string
}

type ValidationSuccess = {
  ok: true
  value: ValidDemoRequestInput
}

export type DemoRequestValidationResult = ValidationFailure | ValidationSuccess

function normaliseOptionalText(input: unknown) {
  const value = typeof input === 'string' ? input.trim() : ''
  return value.length > 0 ? value : null
}

function matchesOption<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.includes(value)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function validateDemoRequestInput(input: unknown): DemoRequestValidationResult {
  if (!isObject(input)) {
    return {
      ok: false,
      issue: 'invalid_payload',
      message: 'We could not read your submission payload.'
    }
  }

  const honeypot = normaliseOptionalText(input[DEMO_REQUEST_HONEYPOT_FIELD_NAME])

  if (honeypot) {
    return {
      ok: false,
      issue: 'honeypot_filled',
      message: 'Submission rejected.'
    }
  }

  const loadedAtRaw = normaliseOptionalText(input[DEMO_REQUEST_TIMESTAMP_FIELD_NAME])
  const loadedAt = loadedAtRaw ? Number(loadedAtRaw) : Number.NaN

  if (!Number.isFinite(loadedAt)) {
    return {
      ok: false,
      issue: 'submitted_too_fast',
      message: 'Please wait a moment, then submit again.'
    }
  }

  const ageMs = Date.now() - loadedAt

  if (ageMs < DEMO_REQUEST_MINIMUM_SUBMISSION_AGE_SECONDS * 1000) {
    return {
      ok: false,
      issue: 'submitted_too_fast',
      message: 'Please wait a moment, then submit again.'
    }
  }

  const fullName = normaliseOptionalText(input.fullName)
  const schoolName = normaliseOptionalText(input.schoolName)
  const role = normaliseOptionalText(input.role)
  const emailRaw = normaliseOptionalText(input.email)
  const rolloutScope = normaliseOptionalText(input.rolloutScope)
  const schoolType = normaliseOptionalText(input.schoolType)
  const trustName = normaliseOptionalText(input.trustName)
  const schoolsInTrust = normaliseOptionalText(input.schoolsInTrust)
  const pupilCount = normaliseOptionalText(input.pupilCount)
  const phonePolicy = normaliseOptionalText(input.phonePolicy)
  const lostPropertyHandling = normaliseOptionalText(input.lostPropertyHandling)
  const purchaseTimeline = normaliseOptionalText(input.purchaseTimeline)
  const budgetAuthority = normaliseOptionalText(input.budgetAuthority)
  const message = normaliseOptionalText(input.message)

  const marketingConsent = input.marketingConsent === true

  if (!fullName || !schoolName || !role || !emailRaw || !rolloutScope || !schoolType) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Fill in all required fields before submitting.'
    }
  }

  const email = emailRaw.toLowerCase()

  if (!EMAIL_PATTERN.test(email)) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Enter a valid email address.'
    }
  }

  if (!matchesOption(role, ROLE_OPTIONS)) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Select a valid role.'
    }
  }

  if (!matchesOption(rolloutScope, ROLLOUT_SCOPE_OPTIONS)) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Select a valid roll-out scope.'
    }
  }

  if (!matchesOption(schoolType, SCHOOL_TYPE_OPTIONS)) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Select a valid school type.'
    }
  }

  if (!pupilCount || !matchesOption(pupilCount, PUPIL_COUNT_OPTIONS)) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Select a valid pupil count.'
    }
  }

  if (!phonePolicy || !matchesOption(phonePolicy, PHONE_POLICY_OPTIONS)) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Select a valid phone policy.'
    }
  }

  if (!lostPropertyHandling || !matchesOption(lostPropertyHandling, LOST_PROPERTY_OPTIONS)) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Select valid lost property handling.'
    }
  }

  if (!purchaseTimeline || !matchesOption(purchaseTimeline, PURCHASE_TIMELINE_OPTIONS)) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Select a valid purchase timeline.'
    }
  }

  if (!budgetAuthority || !matchesOption(budgetAuthority, BUDGET_AUTHORITY_OPTIONS)) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Select a valid budget authority.'
    }
  }

  if (!marketingConsent) {
    return {
      ok: false,
      issue: 'validation_failed',
      message: 'Marketing consent is required before submitting.'
    }
  }

  const trustDetailsRequired =
    schoolType === 'Multi-Academy Trust' || rolloutScope === 'Trust or group of schools'

  if (trustDetailsRequired) {
    if (!trustName) {
      return {
        ok: false,
        issue: 'validation_failed',
        message: 'Trust name is required for trust-led enquiries.'
      }
    }

    if (!schoolsInTrust || !matchesOption(schoolsInTrust, TRUST_SCHOOL_COUNT_OPTIONS)) {
      return {
        ok: false,
        issue: 'validation_failed',
        message: 'Select the number of schools in trust.'
      }
    }
  }

  return {
    ok: true,
    value: {
      fullName,
      schoolName,
      role,
      email,
      rolloutScope,
      schoolType,
      trustName: trustDetailsRequired ? trustName : null,
      schoolsInTrust: trustDetailsRequired ? (schoolsInTrust as TrustSchoolCountOption) : null,
      pupilCount,
      phonePolicy,
      lostPropertyHandling,
      purchaseTimeline,
      budgetAuthority,
      marketingConsent: true,
      message
    }
  }
}
