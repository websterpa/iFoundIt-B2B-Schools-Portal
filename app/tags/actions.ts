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
import { parseItemClassification, type ItemClassification } from '@/lib/tags/item-classification'

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
  itemKind: 'phone_pouch' | 'hero_laptop'
  laptopOwnership?: 'student' | 'school'
}): Promise<ActionResponse<EmptyResult>> {
  try {
    const classification = parseItemClassification(input.itemKind, input.laptopOwnership)
    if (!classification.ok) return fail(classification.message, {})
    if (!classification.value) return fail('Select an item type.', {})
    const organisationId = await resolveActionOrganisationId()
    const supabase = createSupabaseServerClient()

    const [{ data: tag, error: tagError }, { data: student, error: studentError }] = await Promise.all([
      supabase.from('tags').select('id').eq('id', input.tagId).eq('organisation_id', organisationId).eq('active', true).maybeSingle(),
      supabase
        .from('students')
        .select('id')
        .eq('id', input.studentId)
        .eq('organisation_id', organisationId)
        .eq('active', true)
        .maybeSingle()
    ])

    if (tagError || !tag) {
      return fail('Selected tag is not available for this school.', {})
    }

    if (studentError || !student) {
      return fail('Selected student is not available for this school.', {})
    }

    const { data: saved, error } = await supabase
      .from('tags')
      .update({
        student_id: student.id,
        ...classification.value
      })
      .eq('id', tag.id)
      .eq('organisation_id', organisationId)
      .eq('active', true)
      .select('id').maybeSingle()

    if (error || !saved) {
      return fail('The assignment could not be saved. Refresh and try again.', {})
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
      return fail('CSV is malformed. Check for duplicate headers and quote/comma formatting, then try again.', {
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
          .eq('active', true)
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

    const serialCounts = new Map<string, number>()
    for (const row of parsed.rows) serialCounts.set(row.serial, (serialCounts.get(row.serial) ?? 0) + 1)
    const errors: BulkAssignError[] = []
    const updatesByTagId = new Map<
      string,
      {
        id: string
        serial: string
        student_id: string
        classification: ItemClassification | null
        rowNumber: number
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

      if ((serialCounts.get(row.serial) ?? 0) > 1) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: row.serial,
          reason: 'Duplicate serial in file'
        })
        continue
      }

      const tag = tagBySerial.get(row.serial)

      if (!tag) {
        errors.push({
          rowNumber: row.rowNumber,
          serial: row.serial,
          reason: 'Serial not provisioned to this school'
        })
        continue
      }

      if (!tag.active) {
        errors.push({ rowNumber: row.rowNumber, serial: row.serial, reason: 'Tag is inactive' })
        continue
      }
      const classification = parseItemClassification(row.itemKind, row.laptopOwnership)
      if (!classification.ok) {
        errors.push({ rowNumber: row.rowNumber, serial: row.serial, reason: classification.message })
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
        serial: tag.serial,
        student_id: matchingStudents[0].id,
        classification: classification.value,
        rowNumber: row.rowNumber
      })
    }

    const updates = Array.from(updatesByTagId.values())

    let assignedCount = 0
    // UPDATE respects school-admin RLS without requiring tag INSERT permission.
    for (let offset = 0; offset < updates.length; offset += 25) {
      const outcomes = await Promise.all(updates.slice(offset, offset + 25).map(async (update) => {
        const { data, error } = await supabase.from('tags')
          .update({ student_id: update.student_id, ...(update.classification ?? {}) })
          .eq('id', update.id).eq('organisation_id', organisationId).eq('active', true)
          .select('id').maybeSingle()
        return { update, saved: !error && Boolean(data) }
      }))
      for (const { update, saved } of outcomes) {
        if (saved) assignedCount++
        else errors.push({ rowNumber: update.rowNumber, serial: update.serial, reason: 'Assignment could not be saved; refresh and retry this row' })
      }
    }

    revalidatePath('/tags')
    revalidatePath('/students')

    const result = assignedCount === 0 && errors.length > 0 ? fail : ok
    return result(
      `${assignedCount} tags assigned. ${errors.length} rows require attention.`,
      {
        assignedCount,
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
