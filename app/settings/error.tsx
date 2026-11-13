'use client'

import { ProtectedAppShell } from '@/components/layout/protected-app-shell'

export default function SettingsError({ error: _error, reset }: { error: Error; reset: () => void }) {
  return (
    <ProtectedAppShell schoolName="School workspace">
      <h2>Settings</h2>
      <p>We hit an unexpected error while loading settings.</p>
      <button type="button" onClick={reset}>
        Retry
      </button>
    </ProtectedAppShell>
  )
}
