import { redirect } from 'next/navigation'

import {
  createSchoolAction,
  commitProvisioningAction,
  previewProvisioningAction,
  setSchoolContextAction
} from '@/app/admin/actions'
import { SuperadminOnboardingWorkspace } from '@/components/admin/superadmin-onboarding-workspace'
import { ProtectedAppShell } from '@/components/layout/protected-app-shell'
import { getAdminContext } from '@/lib/auth/get-admin-context'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { readSuperadminSchoolContext } from '@/lib/auth/superadmin-school-context'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const SUPERADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Schools' },
  { href: '/admin/tags', label: 'Tag provisioning' },
  { href: '/admin/demo-requests', label: 'Demo requests' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/tags', label: 'Tags' },
  { href: '/events', label: 'Events' },
  { href: '/settings', label: 'Settings' }
]

export default async function AdminPage() {
  const sessionUser = await getSessionUser()

  if (!requireAuth(sessionUser.id) || !sessionUser.id) {
    redirect('/login')
  }

  const supabase = createSupabaseServerClient()
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
    return (
      <ProtectedAppShell schoolName="iFoundIt superadmin" navLinks={SUPERADMIN_NAV_LINKS}>
        <h2>School onboarding workspace</h2>
        <p>We could not load schools right now. Please refresh and try again.</p>
      </ProtectedAppShell>
    )
  }

  const selectedSchoolContext = readSuperadminSchoolContext()

  return (
    <ProtectedAppShell schoolName="iFoundIt superadmin" navLinks={SUPERADMIN_NAV_LINKS}>
      <h2>School onboarding workspace</h2>
      <p>Create schools, hold pending admin contacts, and provision supplier tag inventory.</p>
      <SuperadminOnboardingWorkspace
        schools={schools ?? []}
        initialSchoolContextOrganisationId={selectedSchoolContext}
        createSchoolAction={createSchoolAction}
        previewProvisioningAction={previewProvisioningAction}
        commitProvisioningAction={commitProvisioningAction}
        setSchoolContextAction={setSchoolContextAction}
      />
    </ProtectedAppShell>
  )
}
