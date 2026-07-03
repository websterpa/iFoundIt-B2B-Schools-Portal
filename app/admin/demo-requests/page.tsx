import { redirect } from 'next/navigation'

import { ProtectedAppShell } from '@/components/layout/protected-app-shell'
import { getAdminContext } from '@/lib/auth/get-admin-context'
import { getSessionUser } from '@/lib/auth/get-session-user'
import { requireAuth } from '@/lib/auth/require-auth'
import { requireRole } from '@/lib/auth/require-role'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export default async function DemoRequestsAdminPage() {
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

  const { data: requests, error } = await supabase
    .from('demo_requests')
    .select(
      'id, created_at, full_name, school_name, role, email, rollout_scope, school_type, trust_name, schools_in_trust, pupil_count, phone_policy, lost_property_handling, purchase_timeline, budget_authority, marketing_consent, message'
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <ProtectedAppShell schoolName="iFoundIt superadmin">
      <h2>Demo request submissions</h2>
      <p>Internal queue for marketing demo enquiries.</p>
      {requests && requests.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Name</th>
                <th>School</th>
                <th>Role</th>
                <th>Email</th>
                <th>Roll-out scope</th>
                <th>School type</th>
                <th>Trust name</th>
                <th>Schools in trust</th>
                <th>Pupil count</th>
                <th>Phone policy</th>
                <th>Lost property</th>
                <th>Purchase timeline</th>
                <th>Budget authority</th>
                <th>Consent</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{new Date(request.created_at).toISOString()}</td>
                  <td>{request.full_name}</td>
                  <td>{request.school_name}</td>
                  <td>{request.role}</td>
                  <td>{request.email}</td>
                  <td>{request.rollout_scope}</td>
                  <td>{request.school_type}</td>
                  <td>{request.trust_name ?? '—'}</td>
                  <td>{request.schools_in_trust ?? '—'}</td>
                  <td>{request.pupil_count}</td>
                  <td>{request.phone_policy}</td>
                  <td>{request.lost_property_handling}</td>
                  <td>{request.purchase_timeline}</td>
                  <td>{request.budget_authority}</td>
                  <td>{request.marketing_consent ? 'Yes' : 'No'}</td>
                  <td>{request.message ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No demo requests yet.</p>
      )}
    </ProtectedAppShell>
  )
}
