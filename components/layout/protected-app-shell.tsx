import Link from 'next/link'
import type { ReactNode } from 'react'

import { SignOutButton } from '@/components/auth/sign-out-button'

type ProtectedAppShellProps = {
  schoolName: string
  children: ReactNode
}

export function ProtectedAppShell({ schoolName, children }: ProtectedAppShellProps) {
  return (
    <div>
      <header>
        <h1>{schoolName}</h1>
        <nav aria-label="Primary">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/students">Students</Link>
          <Link href="/tags">Tags</Link>
          <Link href="/events">Events</Link>
          <Link href="/settings">Settings</Link>
        </nav>
        <SignOutButton />
      </header>
      <main>{children}</main>
    </div>
  )
}
