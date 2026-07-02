import Link from 'next/link'
import React from 'react'
import type { ReactNode } from 'react'

type MarketingShellProps = {
  children: ReactNode
}

const primaryLinks = [
  { href: '/for-schools', label: 'For schools' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/security', label: 'Security' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faqs', label: 'FAQs' }
]

const footerLinks = [
  { href: '/faqs', label: 'FAQs' },
  { href: '/security', label: 'Security' },
  { href: '/contact', label: 'Contact' }
]

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-header__inner">
          <Link className="marketing-brand" href="/">
            <span className="marketing-brand__name">iFoundIt Schools</span>
            <span className="marketing-brand__tagline">Recovery workflows for phone pouch rollouts</span>
          </Link>
          <div className="marketing-nav-rail">
            <nav aria-label="Primary" className="marketing-nav">
              <Link className="marketing-nav__link" href="/">
                Home
              </Link>
              {primaryLinks.map((link) => (
                <Link key={link.href} className="marketing-nav__link" href={link.href}>
                  {link.label}
                </Link>
              ))}
              <Link className="marketing-nav__link" href="/contact">
                Book a demo
              </Link>
              <Link className="marketing-nav__link marketing-nav__link--accent" href="/login">
                Portal login
              </Link>
            </nav>
          </div>
        </div>
      </header>
      {children}
      <footer className="marketing-footer">
        <p>Public marketing pages stay outside the authenticated school admin workspace.</p>
        <nav aria-label="Footer" className="marketing-footer__nav">
          {footerLinks.map((link) => (
            <Link key={link.href} className="marketing-footer__link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  )
}
