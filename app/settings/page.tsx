import { redirect } from 'next/navigation'

import { updateSchoolSettingsAction, uploadSchoolLogoAction } from '@/app/settings/actions'
import { ProtectedAppShell } from '@/components/layout/protected-app-shell'
import { SettingsWorkspace } from '@/components/settings/settings-workspace'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { loadAdminContextForUser } from '@/lib/auth/load-admin-context'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { resolveSchoolPortalOrganisation } from '@/lib/auth/resolve-school-portal-organisation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const sessionUser = await getSessionUser()

  if (!requireAuth(sessionUser.id) || !sessionUser.id) {
    redirect('/login')
  }

  const supabase = createSupabaseServerClient()
  const adminContext = await loadAdminContextForUser(supabase, sessionUser.id)

  if (!adminContext || !requireRole(adminContext, ['school_admin', 'ifoundit_superadmin'])) {
    redirect('/unauthorised')
  }

  const organisationContext = await resolveSchoolPortalOrganisation({
    adminContext,
    supabase
  })

  if (organisationContext.reason === 'missing_context') {
    return (
      <ProtectedAppShell schoolName="School workspace">
        <h2>Settings</h2>
        <p>Select a school context from the superadmin schools page before opening settings.</p>
      </ProtectedAppShell>
    )
  }

  if (!organisationContext.organisationId) {
    redirect('/unauthorised')
  }

  const { data: organisation, error } = await supabase
    .from('organisations')
    .select('contact_email, contact_phone, address, logo_url, collection_details')
    .eq('id', organisationContext.organisationId)
    .maybeSingle()

  if (error || !organisation) {
    return (
      <ProtectedAppShell schoolName="School workspace">
        <h2>Settings</h2>
        <p>We could not load school settings right now. Please refresh and try again.</p>
      </ProtectedAppShell>
    )
  }

  return (
    <ProtectedAppShell schoolName="School workspace">
      <SettingsWorkspace
        initialContactEmail={organisation.contact_email}
        initialCollectionDetails={organisation.collection_details}
        initialContactPhone={organisation.contact_phone}
        initialAddress={organisation.address}
        initialLogoUrl={organisation.logo_url}
        updateSchoolSettingsAction={updateSchoolSettingsAction}
        uploadSchoolLogoAction={uploadSchoolLogoAction}
      />
    </ProtectedAppShell>
  )
}
