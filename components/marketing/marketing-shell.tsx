import Link from 'next/link'
import React from 'react'
import type { ReactNode } from 'react'

type MarketingShellProps = {
  children: ReactNode
}

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-header__inner">
          <Link className="marketing-brand" href="/">
            <span className="marketing-brand__name">iFoundIt Schools</span>
            <span className="marketing-brand__tagline">Recovery workflows for phone pouch rollouts</span>
          </Link>
          <nav aria-label="Primary" className="marketing-nav">
            <Link className="marketing-nav__link" href="/">
              Home
            </Link>
            <Link className="marketing-nav__link" href="/schools/pouch-protection">
              Phone Pouch Protection
            </Link>
            <Link className="marketing-nav__link marketing-nav__link--accent" href="/login">
              Portal login
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="marketing-footer">
        <p>Public marketing pages stay outside the authenticated school admin workspace.</p>
      </footer>
    </div>
  )
}
