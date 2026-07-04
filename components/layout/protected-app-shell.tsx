import Link from 'next/link'
import type { ReactNode } from 'react'

import { SignOutButton } from '@/components/auth/sign-out-button'

type AppNavLink = {
  href: string
  label: string
}

const DEFAULT_NAV_LINKS: AppNavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/tags', label: 'Tags' },
  { href: '/events', label: 'Events' },
  { href: '/settings', label: 'Settings' }
]

type ProtectedAppShellProps = {
  schoolName: string
  children: ReactNode
  navLinks?: AppNavLink[]
}

export function ProtectedAppShell({
  schoolName,
  children,
  navLinks = DEFAULT_NAV_LINKS
}: ProtectedAppShellProps) {
  return (
    <div>
      <header>
        <h1>{schoolName}</h1>
        <nav aria-label="Primary">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <SignOutButton />
      </header>
      <main>{children}</main>
    </div>
  )
}
