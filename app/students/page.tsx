import { redirect } from 'next/navigation'

import { createStudentAction, importStudentsAction } from '@/app/students/actions'
import { StudentWorkspace } from '@/components/students/student-workspace'
import { ProtectedAppShell } from '@/components/layout/protected-app-shell'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { loadAdminContextForUser } from '@/lib/auth/load-admin-context'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { resolveSchoolPortalOrganisation } from '@/lib/auth/resolve-school-portal-organisation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function StudentsPage() {
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
        <h2>Students</h2>
        <p>Select a school context from the superadmin schools page before opening students.</p>
      </ProtectedAppShell>
    )
  }

  if (!organisationContext.organisationId) {
    redirect('/unauthorised')
  }

  const organisationId = organisationContext.organisationId

  const [{ data: students, error: studentsError }, { data: assignedTags, error: tagsError }] =
    await Promise.all([
      supabase
        .from('students')
        .select('id, first_name, last_name, date_of_birth, home_postcode, year_group, class_name, active')
        .eq('organisation_id', organisationId)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true }),
      supabase.from('tags').select('student_id').eq('organisation_id', organisationId).not('student_id', 'is', null)
    ])

  if (studentsError || tagsError) {
    return (
      <ProtectedAppShell schoolName="School workspace">
        <h2>Students</h2>
        <p>We could not load student records right now. Please refresh and try again.</p>
      </ProtectedAppShell>
    )
  }

  const assignedStudentIds = new Set((assignedTags ?? []).map((row) => row.student_id).filter(Boolean))

  return (
    <ProtectedAppShell schoolName="School workspace">
      <StudentWorkspace
        students={(students ?? []).map((student) => ({
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          dateOfBirth: student.date_of_birth,
          homePostcode: student.home_postcode,
          yearGroup: student.year_group,
          className: student.class_name,
          active: student.active,
          tagStatus: assignedStudentIds.has(student.id) ? 'assigned' : 'unassigned'
        }))}
        createStudentAction={createStudentAction}
        importStudentsAction={importStudentsAction}
      />
    </ProtectedAppShell>
  )
}
