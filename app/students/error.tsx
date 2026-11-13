'use client'

import { ProtectedAppShell } from '@/components/layout/protected-app-shell'

export default function StudentsError({ error: _error, reset }: { error: Error; reset: () => void }) {
  return (
    <ProtectedAppShell schoolName="School workspace">
      <h2>Students</h2>
      <p>We hit an unexpected error while loading students.</p>
      <button type="button" onClick={reset}>
        Retry
      </button>
    </ProtectedAppShell>
  )
}
