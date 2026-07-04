import { ProtectedAppShell } from '@/components/layout/protected-app-shell'

export default function EventsLoading() {
  return (
    <ProtectedAppShell schoolName="School workspace">
      <h2>Events</h2>
      <p>Loading event workspace…</p>
    </ProtectedAppShell>
  )
}
