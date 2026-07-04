import { redirect } from 'next/navigation'

import { ProtectedAppShell } from '@/components/layout/protected-app-shell'
import { getAdminContext } from '@/lib/auth/get-admin-context'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { readSuperadminSchoolContext } from '@/lib/auth/superadmin-school-context'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type DashboardPageProps = {
  searchParams?: {
    organisationId?: string
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
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

  if (!adminContext || !requireRole(adminContext, ['school_admin', 'ifoundit_superadmin'])) {
    redirect('/unauthorised')
  }

  if (adminContext.role === 'ifoundit_superadmin') {
    const organisationId =
      searchParams?.organisationId?.trim() || readSuperadminSchoolContext()?.trim()

    if (!organisationId) {
      return (
        <ProtectedAppShell schoolName="School workspace">
          <h2>Select a school</h2>
          <p>
            Superadmins must set a school context before opening school routes. Use the school
            context picker on the superadmin schools page.
          </p>
        </ProtectedAppShell>
      )
    }

    const { data: selectedOrg, error: selectedOrgError } = await supabase
      .from('organisations')
      .select('id')
      .eq('id', organisationId)
      .maybeSingle()

    if (selectedOrgError || !selectedOrg) {
      redirect('/unauthorised')
    }
  }

  return (
    <ProtectedAppShell schoolName="School workspace">
      <h2>Portal ready</h2>
      <p>Your account is active. Student, tag, and recovery tools will appear here next.</p>
    </ProtectedAppShell>
  )
}
