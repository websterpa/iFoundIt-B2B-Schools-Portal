import { ProtectedAppShell } from '@/components/layout/protected-app-shell'

export default function StudentsLoading() {
  return (
    <ProtectedAppShell schoolName="School workspace">
      <h2>Students</h2>
      <p>Loading student workspace…</p>
    </ProtectedAppShell>
  )
}
