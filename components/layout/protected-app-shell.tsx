import Link from 'next/link'
import type { ReactNode } from 'react'

import { SignOutButton } from '@/components/auth/sign-out-button'
import { ProtectedAppNav } from '@/components/layout/protected-app-nav'
import styles from './protected-app-shell.module.css'

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
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#workspace-content">Skip to workspace</a>
      <header className={styles.header}>
        <div className={styles.identity}>
          <Link href={navLinks[0]?.href ?? '/dashboard'} className={styles.brand}>iFoundIt <span>Schools</span></Link>
          <h1>{schoolName}</h1>
          <SignOutButton />
        </div>
        <ProtectedAppNav links={navLinks} />
      </header>
      <main id="workspace-content" className={styles.content} tabIndex={-1}>{children}</main>
    </div>
  )
}
