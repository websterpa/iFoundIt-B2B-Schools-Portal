import { ProtectedAppShell } from '@/components/layout/protected-app-shell'

export default function SettingsLoading() {
  return (
    <ProtectedAppShell schoolName="School workspace">
      <h2>Settings</h2>
      <p>Loading school settings…</p>
    </ProtectedAppShell>
  )
}
