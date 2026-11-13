'use server'

import { revalidatePath } from 'next/cache'

import { getSessionUser } from '@/lib/auth/get-session-user'
import { loadAdminContextForUser } from '@/lib/auth/load-admin-context'
import { requireAuth } from '@/lib/auth/require-auth'
import { resolveSchoolPortalOrganisation } from '@/lib/auth/resolve-school-portal-organisation'
import { requireRole } from '@/lib/auth/require-role'
import {
  normalizeName,
  normalizeNullable,
  normalizeUkPostcodeForMatch,
  parseDobDdMmYyyyToIso
} from '@/lib/students/normalization'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { schoolNotificationEmail } from '@/lib/finder/notification-email'
import type { TrustedContactInput } from '@/lib/students/trusted-contacts'

type StudentImportRowInput = {
  firstName: string
  lastName: string
  dateOfBirth: string | null
  homePostcode: string | null
  yearGroup: string | null
  className: string | null
  active: boolean
}

type ActionResponse<T> = {
  ok: boolean
  message: string
  data: T
}

type EmptyResult = Record<string, never>

type ImportStudentsResult = {
  insertedCount: number
  invalidCount: number
  duplicateCount: number
}

function ok<T>(message: string, data: T): ActionResponse<T> {
  return {
    ok: true,
    message,
    data
  }
}

function fail<T>(message: string, data: T): ActionResponse<T> {
  return {
    ok: false,
    message,
    data
  }
}

function buildStudentKey(row: {
  firstName: string
  lastName: string
  dateOfBirth: string | null
  homePostcodeNormalized: string | null
  yearGroup: string | null
  className: string | null
}) {
  return [
    row.firstName.trim().toLowerCase(),
    row.lastName.trim().toLowerCase(),
    row.dateOfBirth ?? '',
    row.homePostcodeNormalized ?? '',
    row.yearGroup?.trim().toLowerCase() ?? '',
    row.className?.trim().toLowerCase() ?? ''
  ].join('::')
}

async function resolveActionOrganisationId(): Promise<string> {
  const sessionUser = await getSessionUser()

  if (!requireAuth(sessionUser.id) || !sessionUser.id) {
    throw new Error('Sign in again to continue.')
  }

  const supabase = createSupabaseServerClient()
  const adminContext = await loadAdminContextForUser(supabase, sessionUser.id)

  if (!adminContext || !requireRole(adminContext, ['school_admin', 'ifoundit_superadmin'])) {
    throw new Error('You are not allowed to manage students.')
  }

  const organisationContext = await resolveSchoolPortalOrganisation({
    adminContext,
    supabase
  })

  if (organisationContext.reason !== 'ok' || !organisationContext.organisationId) {
    throw new Error('Select a school context before managing students.')
  }

  return organisationContext.organisationId
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function saveTrustedContactAction(input: TrustedContactInput): Promise<ActionResponse<EmptyResult>> {
  try {
    const organisationId = await resolveActionOrganisationId()
    const email = typeof input.email === 'string' ? schoolNotificationEmail(input.email) : null
    if (!uuidPattern.test(input.studentId) || (input.contactId !== undefined && !uuidPattern.test(input.contactId)) ||
      !email || typeof input.displayName !== 'string' || input.displayName.length > 120 ||
      typeof input.relationship !== 'string' || input.relationship.length > 80 ||
      typeof input.phone !== 'string' || input.phone.length > 60 ||
      typeof input.approved !== 'boolean' || typeof input.enabled !== 'boolean') {
      return fail('Enter valid contact details, approval and notification preferences.', {})
    }
    const supabase = createSupabaseServerClient()
    const { data: student, error: studentError } = await supabase.from('students').select('id')
      .eq('id', input.studentId).eq('organisation_id', organisationId).maybeSingle()
    if (studentError || !student) return fail('Student is not available in this school.', {})
    const now = new Date().toISOString()
    const values = {
      display_name: input.displayName.trim() || null,
      relationship: input.relationship.trim() || null,
      email, phone: input.phone.trim() || null,
      approved: input.approved, approved_at: input.approved ? now : null,
      notifications_enabled: input.enabled, opted_in_at: input.enabled ? now : null,
      updated_at: now
    }
    if (input.contactId) {
      const { data: existing, error } = await supabase.from('student_trusted_contacts')
        .select('email, approved_at, opted_in_at').eq('id', input.contactId)
        .eq('student_id', input.studentId).eq('organisation_id', organisationId).maybeSingle()
      if (error || !existing) return fail('Contact is not available for this student.', {})
      if (existing.email !== email && (input.approved || input.enabled)) {
        return fail('Save a changed email with approval and opt-in off, then confirm permission for the new address.', {})
      }
      values.approved_at = input.approved ? existing.approved_at ?? now : null
      values.opted_in_at = input.enabled ? existing.opted_in_at ?? now : null
      const { data, error: updateError } = await supabase.from('student_trusted_contacts').update(values)
        .eq('id', input.contactId).eq('student_id', input.studentId).eq('organisation_id', organisationId).select('id').maybeSingle()
      if (updateError || !data) return fail('Contact could not be saved. Check for a duplicate email.', {})
    } else {
      const { error } = await supabase.from('student_trusted_contacts').insert({
        ...values, student_id: input.studentId, organisation_id: organisationId
      })
      if (error) return fail('Contact could not be added. Check for a duplicate email.', {})
    }
    revalidatePath('/students')
    return ok('Trusted contact saved.', {})
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not save trusted contact.', {})
  }
}

export async function deleteTrustedContactAction(input: { studentId: string; contactId: string }): Promise<ActionResponse<EmptyResult>> {
  try {
    const organisationId = await resolveActionOrganisationId()
    if (!uuidPattern.test(input.studentId) || !uuidPattern.test(input.contactId)) return fail('Invalid contact selection.', {})
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.from('student_trusted_contacts').delete()
      .eq('id', input.contactId).eq('student_id', input.studentId).eq('organisation_id', organisationId).select('id').maybeSingle()
    if (error || !data) return fail('Contact is not available for this student.', {})
    revalidatePath('/students')
    return ok('Trusted contact deleted. Future alerts to this contact have stopped.', {})
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not delete trusted contact.', {})
  }
}

export async function createStudentAction(input: {
  firstName: string
  lastName: string
  dateOfBirth: string
  homePostcode: string
  yearGroup: string
  className: string
  active: boolean
}): Promise<ActionResponse<EmptyResult>> {
  try {
    const organisationId = await resolveActionOrganisationId()
    const firstName = normalizeName(input.firstName)
    const lastName = normalizeName(input.lastName)
    const dateOfBirth = parseDobDdMmYyyyToIso(input.dateOfBirth)
    const homePostcode = normalizeNullable(input.homePostcode)
    const homePostcodeNormalized = normalizeUkPostcodeForMatch(input.homePostcode)

    if (!firstName || !lastName) {
      return fail('First name and last name are required.', {})
    }

    if (homePostcode && !homePostcodeNormalized) {
      return fail('Home postcode must be a valid UK postcode.', {})
    }

    if (input.dateOfBirth.trim() && !dateOfBirth) {
      return fail('Date of birth must use DD-MM-YYYY.', {})
    }

    const supabase = createSupabaseServerClient()
    const { error } = await supabase.from('students').upsert(
      {
        organisation_id: organisationId,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        home_postcode: homePostcode,
        home_postcode_normalized: homePostcodeNormalized,
        year_group: normalizeNullable(input.yearGroup),
        class_name: normalizeNullable(input.className),
        active: input.active
      },
      {
        onConflict: 'organisation_id,first_name,last_name,year_group,class_name'
      }
    )

    if (error) {
      return fail(error.message, {})
    }

    revalidatePath('/students')

    return ok('Student saved successfully.', {})
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not save student.', {})
  }
}

export async function importStudentsAction(input: {
  rows: StudentImportRowInput[]
}): Promise<ActionResponse<ImportStudentsResult>> {
  try {
    const organisationId = await resolveActionOrganisationId()

    if (!Array.isArray(input.rows) || input.rows.length === 0) {
      return fail('No rows were provided for import.', {
        insertedCount: 0,
        invalidCount: 0,
        duplicateCount: 0
      })
    }

    const seen = new Set<string>()
    const acceptedRows: Array<{
      organisation_id: string
      first_name: string
      last_name: string
      date_of_birth: string | null
      home_postcode: string | null
      home_postcode_normalized: string | null
      year_group: string | null
      class_name: string | null
      active: boolean
    }> = []
    let invalidCount = 0
    let duplicateCount = 0

    for (const row of input.rows) {
      const firstName = normalizeName(row.firstName)
      const lastName = normalizeName(row.lastName)
      const dateOfBirth = parseDobDdMmYyyyToIso(row.dateOfBirth)
      const homePostcode = normalizeNullable(row.homePostcode)
      const homePostcodeNormalized = normalizeUkPostcodeForMatch(row.homePostcode)

      if (!firstName || !lastName) {
        invalidCount += 1
        continue
      }

      if (row.dateOfBirth && !dateOfBirth) {
        invalidCount += 1
        continue
      }

      if (homePostcode && !homePostcodeNormalized) {
        invalidCount += 1
        continue
      }

      const normalizedRow = {
        firstName,
        lastName,
        dateOfBirth,
        homePostcodeNormalized,
        yearGroup: normalizeNullable(row.yearGroup),
        className: normalizeNullable(row.className)
      }

      const rowKey = buildStudentKey(normalizedRow)

      if (seen.has(rowKey)) {
        duplicateCount += 1
        continue
      }

      seen.add(rowKey)

      acceptedRows.push({
        organisation_id: organisationId,
        first_name: normalizedRow.firstName,
        last_name: normalizedRow.lastName,
        date_of_birth: normalizedRow.dateOfBirth,
        home_postcode: homePostcode,
        home_postcode_normalized: normalizedRow.homePostcodeNormalized,
        year_group: normalizedRow.yearGroup,
        class_name: normalizedRow.className,
        active: row.active
      })
    }

    if (acceptedRows.length > 0) {
      const supabase = createSupabaseServerClient()
      const { error } = await supabase.from('students').upsert(acceptedRows, {
        onConflict: 'organisation_id,first_name,last_name,year_group,class_name'
      })

      if (error) {
        return fail(error.message, {
          insertedCount: 0,
          invalidCount,
          duplicateCount
        })
      }
    }

    revalidatePath('/students')

    return ok('Student import complete.', {
      insertedCount: acceptedRows.length,
      invalidCount,
      duplicateCount
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not import students.', {
      insertedCount: 0,
      invalidCount: 0,
      duplicateCount: 0
    })
  }
}
