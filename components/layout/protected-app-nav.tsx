'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './protected-app-shell.module.css'

export function ProtectedAppNav({ links }: { links: Array<{ href: string; label: string }> }) {
  const pathname = usePathname()
  return (
    <nav className={styles.navigation} aria-label="Primary">
      {links.map((link) => (
        <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
