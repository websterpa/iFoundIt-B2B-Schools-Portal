'use client'

import { ProtectedAppShell } from '@/components/layout/protected-app-shell'

export default function TagsError({ error: _error, reset }: { error: Error; reset: () => void }) {
  return (
    <ProtectedAppShell schoolName="School workspace">
      <h2>Tags</h2>
      <p>We hit an unexpected error while loading tags.</p>
      <button type="button" onClick={reset}>
        Retry
      </button>
    </ProtectedAppShell>
  )
}
