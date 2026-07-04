'use server'

import { revalidatePath } from 'next/cache'

import { getSessionUser } from '@/lib/auth/get-session-user'
import { loadAdminContextForUser } from '@/lib/auth/load-admin-context'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { resolveSchoolPortalOrganisation } from '@/lib/auth/resolve-school-portal-organisation'
import {
  normalizeName,
  normalizeUkPostcodeForMatch,
  parseDobDdMmYyyyToIso
} from '@/lib/students/normalization'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { parseBulkAssignmentCsv } from '@/lib/tags/bulk-assignment-csv'

type ActionResponse<T> = {
  ok: boolean
  message: string
  data: T
}

type EmptyResult = Record<string, never>

type BulkAssignError = {
  rowNumber: number
  serial: string
  reason: string
}

type BulkAssignResult = {
  assignedCount: number
  errors: BulkAssignError[]
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

async function resolveActionOrganisationId(): Promise<string> {
  const sessionUser = await getSessionUser()

  if (!requireAuth(sessionUser.id) || !sessionUser.id) {
    throw new Error('Sign in again to continue.')
  }

  const supabase = createSupabaseServerClient()
  const adminContext = await loadAdminContextForUser(supabase, sessionUser.id)

  if (!adminContext || !requireRole(adminContext, ['school_admin', 'ifoundit_superadmin'])) {
    throw new Error('You are not allowed to assign tags.')
  }

  const organisationContext = await resolveSchoolPortalOrganisation({
    adminContext,
    supabase
  })

  if (organisationContext.reason !== 'ok' || !organisationContext.organisationId) {
    throw new Error('Select a school context before managing tags.')
  }

  return organisationContext.organisationId
}

export async function assignTagToStudentAction(input: {
  tagId: string
  studentId: string
}): Promise<ActionResponse<EmptyResult>> {
  try {
    const organisationId = await resolveActionOrganisationId()
    const supabase = createSupabaseServerClient()

    const [{ data: tag, error: tagError }, { data: student, error: studentError }] = await Promise.all([
      supabase.from('tags').select('id').eq('id', input.tagId).eq('organisation_id', organisationId).maybeSingle(),
      supabase
        .from('students')
        .select('id')
        .eq('id', input.studentId)
        .eq('organisation_id', organisationId)
        .maybeSingle()
    ])

    if (tagError || !tag) {
      return fail('Selected tag is not available for this school.', {})
    }

    if (studentError || !student) {
      return fail('Selected student is not available for this school.', {})
    }

    const { error } = await supabase
      .from('tags')
      .update({ student_id: student.id })
      .eq('id', tag.id)
      .eq('organisation_id', organisationId)

    if (error) {
      return fail(error.message, {})
    }

    revalidatePath('/tags')
    revalidatePath('/students')

    return ok('Tag assigned successfully.', {})
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not assign tag.', {})
  }
}

export async function bulkAssignTagsAction(
  formData: FormData
): Promise<ActionResponse<BulkAssignResult>> {
  try {
    const organisationId = await resolveActionOrganisationId()
    const csvFile = formData.get('csvFile')

    if (!(csvFile instanceof File)) {
      return fail('Upload a CSV file before bulk assigning tags.', {
        assignedCount: 0,
        errors: []
      })
    }

    const parsed = parseBulkAssignmentCsv(await csvFile.text())

    if (parsed.malformed) {
      return fail('CSV is malformed. Fix quote/comma formatting and try again.', {
        assignedCount: 0,
        errors: []
      })
    }

    if (!parsed.hasHeaders) {
      return fail('CSV must include serial, first_name, last_name, date_of_birth, and home_postcode headers.', {
        assignedCount: 0,
        errors: []
      })
    }

    if (parsed.rows.length === 0) {
      return fail('CSV does not contain any assignment rows.', {
        assignedCount: 0,
        errors: []
      })
    }

    const supabase = createSupabaseServerClient()
    const serials = Array.from(new Set(parsed.rows.map((row) => row.serial).filter(Boolean)))

    const [{ data: tags, error: tagsError }, { data: students, error: studentsError }] =
      await Promise.all([
        supabase
          .from('tags')
          .select('id, serial, organisation_id, active')
          .eq('organisation_id', organisationId)
          .in('serial', serials),
        supabase
          .from('students')
          .select('id, first_name, last_name, date_of_birth, home_postcode_normalized')
          .eq('organisation_id', organisationId)
      ])

    if (tagsError || studentsError) {
      return fail(tagsError?.message ?? studentsError?.message ?? 'Could not load tag assignment data.', {
        assignedCount: 0,
        errors: []
      })
    }

    const tagBySerial = new Map((tags ?? []).map((tag) => [tag.serial, tag]))
    const studentsByName = new Map<
      string,
      Array<{
        id: string
        date_of_birth: string | null
        home_postcode_normalized: string | null
      }>
    >()

    for (const student of students ?? []) {
      const key = `${student.first_name.trim().toLowerCase()}::${student.last_name.trim().toLowerCase()}`
      const current = studentsByName.get(key) ?? []
      current.push({
        id: student.id,
        date_of_birth: student.date_of_birth,
        home_postcode_normalized: student.home_postcode_normalized
      })
      studentsByName.set(key, current)
    }

    const seenSerialsInFile = new Set<string>()
    const errors: BulkAssignError[] = []
    const updatesByTagId = new Map<
      string,
      {
        id: string
        organisation_id: string
        serial: string
        active: boolean
        student_id: string
      }
    >()

    for (const row of parsed.rows) {
      if (!row.serial) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: '',
          reason: 'Missing serial'
        })
        continue
      }

      const firstName = normalizeName(row.firstName)
      const lastName = normalizeName(row.lastName)
      const dateOfBirthIso = parseDobDdMmYyyyToIso(row.dateOfBirth)
      const postcodeNormalized = normalizeUkPostcodeForMatch(row.homePostcode)

      if (!firstName || !lastName) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: row.serial,
          reason: 'Missing first_name or last_name'
        })
        continue
      }

      if (!row.dateOfBirth.trim() && !row.homePostcode.trim()) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: row.serial,
          reason: 'Provide date_of_birth and/or home_postcode'
        })
        continue
      }

      if (row.dateOfBirth.trim() && !dateOfBirthIso) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: row.serial,
          reason: 'Invalid date_of_birth (use DD-MM-YYYY)'
        })
        continue
      }

      if (row.homePostcode.trim() && !postcodeNormalized) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: row.serial,
          reason: 'Invalid home_postcode'
        })
        continue
      }

      if (seenSerialsInFile.has(row.serial)) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: row.serial,
          reason: 'Duplicate serial in file'
        })
        continue
      }

      seenSerialsInFile.add(row.serial)

      const tag = tagBySerial.get(row.serial)

      if (!tag) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: row.serial,
          reason: 'Serial not provisioned to this school'
        })
        continue
      }

      const candidateKey = `${firstName.toLowerCase()}::${lastName.toLowerCase()}`
      const candidates = studentsByName.get(candidateKey) ?? []
      const matchingStudents = candidates.filter((candidate) => {
        if (dateOfBirthIso && candidate.date_of_birth !== dateOfBirthIso) {
          return false
        }

        if (postcodeNormalized && candidate.home_postcode_normalized !== postcodeNormalized) {
          return false
        }

        return true
      })

      if (matchingStudents.length === 0) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: row.serial,
          reason: 'No student matched first/last name with supplied DOB/postcode'
        })
        continue
      }

      if (matchingStudents.length > 1) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: row.serial,
          reason: 'Multiple students matched. Add both DOB and postcode to disambiguate'
        })
        continue
      }

      updatesByTagId.set(tag.id, {
        id: tag.id,
        organisation_id: tag.organisation_id,
        serial: tag.serial,
        active: tag.active,
        student_id: matchingStudents[0].id
      })
    }

    const updates = Array.from(updatesByTagId.values())

    if (updates.length > 0) {
      const { error: updateError } = await supabase.from('tags').upsert(updates, {
        onConflict: 'id'
      })

      if (updateError) {
        return fail(updateError.message, {
          assignedCount: 0,
          errors
        })
      }
    }

    revalidatePath('/tags')
    revalidatePath('/students')

    return ok(
      `${updates.length} tags assigned. ${errors.length} rows require attention.`,
      {
        assignedCount: updates.length,
        errors
      }
    )
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not run bulk assignment.', {
      assignedCount: 0,
      errors: []
    })
  }
}
