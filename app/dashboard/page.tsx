import { redirect } from 'next/navigation'

import { ProtectedAppShell } from '@/components/layout/protected-app-shell'
import { getAdminContext } from '@/lib/auth/get-admin-context'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export default async function DashboardPage() {
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

  if (!requireRole(adminContext, ['school_admin'])) {
    redirect('/unauthorised')
  }

  return (
    <ProtectedAppShell schoolName="School workspace">
      <h2>Portal ready</h2>
      <p>Your account is active. Student, tag, and recovery tools will appear here next.</p>
    </ProtectedAppShell>
  )
}
