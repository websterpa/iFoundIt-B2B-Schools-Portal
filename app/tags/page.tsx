import { redirect } from 'next/navigation'

import { assignTagToStudentAction, bulkAssignTagsAction } from '@/app/tags/actions'
import { ProtectedAppShell } from '@/components/layout/protected-app-shell'
import { TagWorkspace } from '@/components/tags/tag-workspace'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { loadAdminContextForUser } from '@/lib/auth/load-admin-context'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { resolveSchoolPortalOrganisation } from '@/lib/auth/resolve-school-portal-organisation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function TagsPage() {
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
        <h2>Tags</h2>
        <p>Select a school context from the superadmin schools page before opening tags.</p>
      </ProtectedAppShell>
    )
  }

  if (!organisationContext.organisationId) {
    redirect('/unauthorised')
  }

  const organisationId = organisationContext.organisationId

  const [{ data: tags, error: tagsError }, { data: students, error: studentsError }] = await Promise.all([
    supabase
      .from('tags')
      .select('id, serial, student_id, active, item_kind, laptop_ownership')
      .eq('organisation_id', organisationId)
      .order('serial', { ascending: true }),
    supabase
      .from('students')
      .select('id, first_name, last_name')
      .eq('organisation_id', organisationId)
      .eq('active', true)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })
  ])

  if (tagsError || studentsError) {
    return (
      <ProtectedAppShell schoolName="School workspace">
        <h2>Tags</h2>
        <p>We could not load tags right now. Please refresh and try again.</p>
      </ProtectedAppShell>
    )
  }

  const studentById = new Map(
    (students ?? []).map((student) => [student.id, `${student.first_name} ${student.last_name}`])
  )

  return (
    <ProtectedAppShell schoolName="School workspace">
      <TagWorkspace
        tags={(tags ?? []).map((tag) => ({
          id: tag.id,
          serial: tag.serial,
          assignedStudentName: tag.student_id ? studentById.get(tag.student_id) ?? null : null,
          active: tag.active,
          itemKind: tag.item_kind,
          laptopOwnership: tag.laptop_ownership
        }))}
        students={(students ?? []).map((student) => ({
          id: student.id,
          fullName: `${student.first_name} ${student.last_name}`
        }))}
        assignTagToStudentAction={assignTagToStudentAction}
        bulkAssignTagsAction={bulkAssignTagsAction}
      />
    </ProtectedAppShell>
  )
}
