'use server'

import { revalidatePath } from 'next/cache'

import type { ActionResponse, InventorySnapshot, SchoolOption } from '@/lib/admin/onboarding/contracts'
import {
  commitTagProvisioning,
  createSchoolWithPendingAdmin,
  previewTagProvisioning,
  type CommitProvisioningResult,
  type PreviewProvisioningInput,
  type ProvisioningPreviewResult,
  type ServiceDeps
} from '@/lib/admin/onboarding/service'
import { getAdminContext } from '@/lib/auth/get-admin-context'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { requireAuth } from '@/lib/auth/require-auth'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

type CreateSchoolActionInput = {
  name: string
  slug: string
  contactEmail: string
  contactPhone: string
  address: string
  pendingAdminFullName: string
  pendingAdminEmail: string
}

type CommitProvisioningActionInput = {
  organisationId: string
  previewToken: string
}

type CreateSchoolActionResult = {
  school: SchoolOption
  pendingAdminStatus: string
}

type SupabaseServiceClient = ReturnType<typeof createSupabaseServiceClient>

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

async function loadAdminContextForUser(supabase: SupabaseServiceClient, userId: string) {
  return getAdminContext(userId, {
    async loadAdminUser(currentUserId) {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, organisation_id, role')
        .eq('id', currentUserId)
        .maybeSingle()

      if (error || !data) {
        return null
      }

      return {
        id: data.id,
        organisationId: data.organisation_id,
        role: data.role
      }
    }
  })
}

async function createServiceDeps(supabase: SupabaseServiceClient): Promise<{
  actorUserId: string
  deps: ServiceDeps
}> {
  const sessionUser = await getSessionUser()

  if (!requireAuth(sessionUser.id) || !sessionUser.id) {
    throw new Error('Sign in again to continue.')
  }

  const actorUserId = sessionUser.id

  return {
    actorUserId,
    deps: {
      loadAdminContext: (userId) => loadAdminContextForUser(supabase, userId),
      async insertOrganisation(input) {
        const { data, error } = await supabase
          .from('organisations')
          .insert({
            name: input.name,
            slug: input.slug,
            contact_email: input.contactEmail,
            contact_phone: input.contactPhone,
            address: input.address
          })
          .select('id, name, slug, contact_email, contact_phone, address')
          .single()

        if (error || !data) {
          throw new Error(error?.message ?? 'We could not create this school.')
        }

        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          contactEmail: data.contact_email,
          contactPhone: data.contact_phone,
          address: data.address
        }
      },
      async insertPendingAdmin(input) {
        const { data, error } = await supabase
          .from('pending_school_admins')
          .insert({
            organisation_id: input.organisationId,
            full_name: input.fullName,
            email: input.email,
            status: input.status
          })
          .select('id, organisation_id, full_name, email, status')
          .single()

        if (error || !data) {
          throw new Error(error?.message ?? 'We could not store the pending school-admin contact.')
        }

        return {
          id: data.id,
          organisationId: data.organisation_id,
          fullName: data.full_name,
          email: data.email,
          status: data.status
        }
      },
      async listTagsBySerial(serials) {
        if (serials.length === 0) {
          return []
        }

        const { data, error } = await supabase
          .from('tags')
          .select('serial, organisation_id, active')
          .in('serial', serials)

        if (error) {
          throw new Error(error.message)
        }

        return (data ?? []).map((row) => ({
          serial: row.serial,
          organisationId: row.organisation_id,
          active: row.active
        }))
      },
      async insertTags(rows) {
        if (rows.length === 0) {
          return
        }

        const { error } = await supabase.from('tags').insert(
          rows.map((row) => ({
            organisation_id: row.organisationId,
            serial: row.serial,
            active: row.active
          }))
        )

        if (error) {
          throw new Error(error.message)
        }
      },
      async loadInventorySnapshot(organisationId) {
        const [provisioned, unassigned] = await Promise.all([
          supabase
            .from('tags')
            .select('id', { count: 'exact', head: true })
            .eq('organisation_id', organisationId),
          supabase
            .from('tags')
            .select('id', { count: 'exact', head: true })
            .eq('organisation_id', organisationId)
            .is('student_id', null)
        ])

        if (provisioned.error) {
          throw new Error(provisioned.error.message)
        }

        if (unassigned.error) {
          throw new Error(unassigned.error.message)
        }

        return {
          organisationId,
          provisionedInventoryCount: provisioned.count ?? 0,
          unassignedInventoryCount: unassigned.count ?? 0
        } satisfies InventorySnapshot
      }
    }
  }
}

export async function createSchoolAction(
  input: CreateSchoolActionInput
): Promise<ActionResponse<CreateSchoolActionResult>> {
  try {
    const supabase = createSupabaseServiceClient()
    const { actorUserId, deps } = await createServiceDeps(supabase)
    const result = await createSchoolWithPendingAdmin({ actorUserId, ...input }, deps)

    revalidatePath('/admin')

    return {
      ok: true,
      message: 'School created. Pending admin is waiting for invite/reset.',
      data: {
        school: {
          id: result.organisation.id,
          name: result.organisation.name,
          slug: result.organisation.slug
        },
        pendingAdminStatus: result.pendingAdmin.status
      }
    }
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error)
    }
  }
}

export async function previewProvisioningAction(
  formData: FormData
): Promise<ActionResponse<ProvisioningPreviewResult>> {
  try {
    const organisationId = String(formData.get('organisationId') ?? '')
    const csvFile = formData.get('csvFile')

    if (!(csvFile instanceof File)) {
      throw new Error('Upload a CSV file before reviewing tags.')
    }

    const supabase = createSupabaseServiceClient()
    const { actorUserId, deps } = await createServiceDeps(supabase)
    const csvText = await csvFile.text()

    const result = await previewTagProvisioning(
      {
        actorUserId,
        organisationId,
        csvText
      } satisfies PreviewProvisioningInput,
      deps
    )

    return {
      ok: true,
      message: `${result.summary.validRows} tags are ready to provision. Review the skipped rows before you commit.`,
      data: result
    }
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error)
    }
  }
}

export async function commitProvisioningAction(
  input: CommitProvisioningActionInput
): Promise<ActionResponse<CommitProvisioningResult>> {
  try {
    const supabase = createSupabaseServiceClient()
    const { actorUserId, deps } = await createServiceDeps(supabase)
    const result = await commitTagProvisioning(
      {
        actorUserId,
        organisationId: input.organisationId,
        previewToken: input.previewToken
      },
      deps
    )

    revalidatePath('/admin')

    return {
      ok: true,
      message: `${result.insertedCount} tags were provisioned. ${result.duplicateCount} duplicate rows were skipped. ${result.invalidCount} rows were invalid. ${result.conflictCount} rows were already allocated to another school.`,
      data: result
    }
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error)
    }
  }
}
