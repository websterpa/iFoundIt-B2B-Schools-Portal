import { redirect } from 'next/navigation'

import { commitProvisioningAction, previewProvisioningAction } from '@/app/admin/actions'
import { SuperadminTagProvisioningPanel } from '@/components/admin/superadmin-tag-provisioning-panel'
import { ProtectedAppShell } from '@/components/layout/protected-app-shell'
import { loadAdminContextForUser } from '@/lib/auth/load-admin-context'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
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

export default async function AdminTagsPage() {
  const sessionUser = await getSessionUser()

  if (!requireAuth(sessionUser.id) || !sessionUser.id) {
    redirect('/login')
  }

  const supabase = createSupabaseServerClient()
  const adminContext = await loadAdminContextForUser(supabase, sessionUser.id)

  if (!adminContext || !requireRole(adminContext, ['ifoundit_superadmin'])) {
    redirect('/unauthorised')
  }

  const { data: schools, error: schoolsError } = await supabase
    .from('organisations')
    .select('id, name, slug')
    .order('name', { ascending: true })

  if (schoolsError) {
    return (
      <ProtectedAppShell schoolName="iFoundIt superadmin" navLinks={SUPERADMIN_NAV_LINKS}>
        <h2>Tag provisioning</h2>
        <p>We could not load schools right now. Please refresh and try again.</p>
      </ProtectedAppShell>
    )
  }

  return (
    <ProtectedAppShell schoolName="iFoundIt superadmin" navLinks={SUPERADMIN_NAV_LINKS}>
      <SuperadminTagProvisioningPanel
        schools={schools ?? []}
        previewProvisioningAction={previewProvisioningAction}
        commitProvisioningAction={commitProvisioningAction}
      />
    </ProtectedAppShell>
  )
}
