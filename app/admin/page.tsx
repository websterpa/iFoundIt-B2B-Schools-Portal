import { redirect } from 'next/navigation'

import { createSchoolAction, commitProvisioningAction, previewProvisioningAction } from '@/app/admin/actions'
import { SuperadminOnboardingWorkspace } from '@/components/admin/superadmin-onboarding-workspace'
import { ProtectedAppShell } from '@/components/layout/protected-app-shell'
import { getAdminContext } from '@/lib/auth/get-admin-context'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export default async function AdminPage() {
  const sessionUser = await getSessionUser()

  if (!requireAuth(sessionUser.id) || !sessionUser.id) {
    redirect('/login')
  }

  const supabase = createSupabaseServiceClient()
  const adminContext = await getAdminContext(sessionUser.id, {
    async loadAdminUser(userId) {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, organisation_id, role')
        .eq('id', userId)
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

  if (!requireRole(adminContext, ['ifoundit_superadmin'])) {
    redirect('/unauthorised')
  }

  const { data: schools, error: schoolsError } = await supabase
    .from('organisations')
    .select('id, name, slug')
    .order('name', { ascending: true })

  if (schoolsError) {
    throw new Error(schoolsError.message)
  }

  return (
    <ProtectedAppShell schoolName="iFoundIt superadmin">
      <h2>School onboarding workspace</h2>
      <p>Create schools, hold pending admin contacts, and provision supplier tag inventory.</p>
      <SuperadminOnboardingWorkspace
        schools={schools ?? []}
        createSchoolAction={createSchoolAction}
        previewProvisioningAction={previewProvisioningAction}
        commitProvisioningAction={commitProvisioningAction}
      />
    </ProtectedAppShell>
  )
}
