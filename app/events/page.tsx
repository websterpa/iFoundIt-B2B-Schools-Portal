import { redirect } from 'next/navigation'

import { resolveFoundEventAction } from '@/app/events/actions'
import { EventWorkspace } from '@/components/events/event-workspace'
import { ProtectedAppShell } from '@/components/layout/protected-app-shell'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { loadAdminContextForUser } from '@/lib/auth/load-admin-context'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { resolveSchoolPortalOrganisation } from '@/lib/auth/resolve-school-portal-organisation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function EventsPage() {
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
        <h2>Events</h2>
        <p>Select a school context from the superadmin schools page before opening events.</p>
      </ProtectedAppShell>
    )
  }

  if (!organisationContext.organisationId) {
    redirect('/unauthorised')
  }

  const organisationId = organisationContext.organisationId

  const [{ data: events, error: eventsError }, { data: rejections, error: rejectionsError }] =
    await Promise.all([
      supabase
        .from('found_events')
        .select('id, tag_id, created_at, status, resolved_at, notification_sent_at, parent_notification_status')
        .eq('organisation_id', organisationId)
        .order('created_at', { ascending: false }),
      supabase
        .from('found_event_rejections')
        .select('id, serial, rejection_reason, created_at')
        .eq('organisation_id', organisationId)
        .order('created_at', { ascending: false })
        .limit(100)
    ])

  if (eventsError || rejectionsError) {
    return (
      <ProtectedAppShell schoolName="School workspace">
        <h2>Events</h2>
        <p>We could not load events right now. Please refresh and try again.</p>
      </ProtectedAppShell>
    )
  }

  const tagIds = Array.from(new Set((events ?? []).map((event) => event.tag_id)))
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('id, serial, student_id, item_kind, laptop_ownership')
    .eq('organisation_id', organisationId)
    .in('id', tagIds.length > 0 ? tagIds : ['00000000-0000-0000-0000-000000000000'])

  if (tagsError) {
    return (
      <ProtectedAppShell schoolName="School workspace">
        <h2>Events</h2>
        <p>We could not load tag details right now. Please refresh and try again.</p>
      </ProtectedAppShell>
    )
  }

  const studentIds = Array.from(new Set((tags ?? []).map((tag) => tag.student_id).filter(Boolean)))

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, first_name, last_name')
    .eq('organisation_id', organisationId)
    .in('id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000'])

  if (studentsError) {
    return (
      <ProtectedAppShell schoolName="School workspace">
        <h2>Events</h2>
        <p>We could not load student details right now. Please refresh and try again.</p>
      </ProtectedAppShell>
    )
  }

  const tagById = new Map((tags ?? []).map((tag) => [tag.id, tag]))
  const studentById = new Map(
    (students ?? []).map((student) => [student.id, `${student.first_name} ${student.last_name}`])
  )

  return (
    <ProtectedAppShell schoolName="School workspace">
      <EventWorkspace
        events={(events ?? []).map((event) => {
          const tag = tagById.get(event.tag_id)

          return {
            id: event.id,
            serial: tag?.serial ?? 'Unknown serial',
            studentName: tag?.student_id ? studentById.get(tag.student_id) ?? null : null,
            itemKind: tag?.item_kind ?? null,
            laptopOwnership: tag?.laptop_ownership ?? null,
            createdAt: event.created_at,
            status: event.status,
            resolvedAt: event.resolved_at,
            notificationSentAt: event.notification_sent_at,
            parentNotificationStatus: event.parent_notification_status
          }
        })}
        rejections={(rejections ?? []).map((rejection) => ({
          id: rejection.id,
          serial: rejection.serial,
          rejectionReason: rejection.rejection_reason,
          createdAt: rejection.created_at
        }))}
        resolveFoundEventAction={resolveFoundEventAction}
      />
    </ProtectedAppShell>
  )
}
