import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  return (
    <main>
      <h1>Restricted access</h1>
      <p>This area is reserved for iFoundIt superadmins.</p>
      <Link href="/dashboard">Back to dashboard</Link>
    </main>
  )
}
