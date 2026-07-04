'use server'

import { revalidatePath } from 'next/cache'

import { getSessionUser } from '@/lib/auth/get-session-user'
import { loadAdminContextForUser } from '@/lib/auth/load-admin-context'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { resolveSchoolPortalOrganisation } from '@/lib/auth/resolve-school-portal-organisation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type ActionResponse<T> = {
  ok: boolean
  message: string
  data: T
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
    throw new Error('You are not allowed to update settings.')
  }

  const organisationContext = await resolveSchoolPortalOrganisation({
    adminContext,
    supabase
  })

  if (organisationContext.reason !== 'ok' || !organisationContext.organisationId) {
    throw new Error('Select a school context before updating settings.')
  }

  return organisationContext.organisationId
}

export async function updateSchoolSettingsAction(input: {
  contactEmail: string
  contactPhone: string
  address: string
}): Promise<ActionResponse<Record<string, never>>> {
  try {
    const organisationId = await resolveActionOrganisationId()
    const supabase = createSupabaseServerClient()

    const { error } = await supabase
      .from('organisations')
      .update({
        contact_email: input.contactEmail.trim(),
        contact_phone: input.contactPhone.trim() || null,
        address: input.address.trim() || null
      })
      .eq('id', organisationId)

    if (error) {
      return fail(error.message, {})
    }

    revalidatePath('/settings')

    return ok('School settings updated.', {})
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not update settings.', {})
  }
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function uploadSchoolLogoAction(
  formData: FormData
): Promise<ActionResponse<{ logoUrl: string | null }>> {
  try {
    const organisationId = await resolveActionOrganisationId()
    const file = formData.get('logoFile')

    if (!(file instanceof File) || file.size === 0) {
      return fail('Choose an image file before uploading.', {
        logoUrl: null
      })
    }

    const supabase = createSupabaseServerClient()
    const objectPath = `${organisationId}/${Date.now()}-${sanitizeFilename(file.name)}`

    const { error: uploadError } = await supabase.storage
      .from('school-logos')
      .upload(objectPath, file, {
        upsert: true,
        contentType: file.type || undefined
      })

    if (uploadError) {
      return fail(uploadError.message, {
        logoUrl: null
      })
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('school-logos').getPublicUrl(objectPath)

    const { error: updateError } = await supabase
      .from('organisations')
      .update({ logo_url: publicUrl })
      .eq('id', organisationId)

    if (updateError) {
      return fail(updateError.message, {
        logoUrl: null
      })
    }

    revalidatePath('/settings')

    return ok('Logo uploaded and saved.', {
      logoUrl: publicUrl
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Could not upload logo.', {
      logoUrl: null
    })
  }
}
