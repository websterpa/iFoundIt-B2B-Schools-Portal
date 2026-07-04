import { ProtectedAppShell } from '@/components/layout/protected-app-shell'

export default function TagsLoading() {
  return (
    <ProtectedAppShell schoolName="School workspace">
      <h2>Tags</h2>
      <p>Loading tag workspace…</p>
    </ProtectedAppShell>
  )
}
