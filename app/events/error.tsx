'use client'

import { ProtectedAppShell } from '@/components/layout/protected-app-shell'

export default function EventsError({ error: _error, reset }: { error: Error; reset: () => void }) {
  return (
    <ProtectedAppShell schoolName="School workspace">
      <h2>Events</h2>
      <p>We hit an unexpected error while loading events.</p>
      <button type="button" onClick={reset}>
        Retry
      </button>
    </ProtectedAppShell>
  )
}
