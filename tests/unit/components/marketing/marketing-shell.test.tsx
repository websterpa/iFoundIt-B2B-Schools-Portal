import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MarketingShell } from '@/components/marketing/marketing-shell'

describe('MarketingShell', () => {
  it('renders the shared public navigation for the full marketing funnel', () => {
    render(
      <MarketingShell>
        <div>Page body</div>
      </MarketingShell>
    )

    const primaryNav = screen.getByRole('navigation', { name: /primary/i })
    const primaryLinks = within(primaryNav).getAllByRole('link')

    expect(primaryLinks).toHaveLength(8)
    expect(primaryLinks.map((link) => ({ name: link.textContent, href: link.getAttribute('href') }))).toEqual([
      { name: 'Home', href: '/' },
      { name: 'For schools', href: '/for-schools' },
      { name: 'How it works', href: '/how-it-works' },
      { name: 'Security', href: '/security' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Book a demo', href: '/contact' },
      { name: 'Portal login', href: '/login' }
    ])

    expect(within(primaryNav).getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
    expect(within(primaryNav).getByRole('link', { name: /for schools/i })).toHaveAttribute('href', '/for-schools')
    expect(within(primaryNav).getByRole('link', { name: /how it works/i })).toHaveAttribute('href', '/how-it-works')
    expect(within(primaryNav).getByRole('link', { name: /security/i })).toHaveAttribute('href', '/security')
    expect(within(primaryNav).getByRole('link', { name: /pricing/i })).toHaveAttribute('href', '/pricing')
    expect(within(primaryNav).getByRole('link', { name: /faqs/i })).toHaveAttribute('href', '/faqs')
    expect(within(primaryNav).getByRole('link', { name: /book a demo/i })).toHaveAttribute('href', '/contact')
    expect(within(primaryNav).getByRole('link', { name: /portal login/i })).toHaveAttribute('href', '/login')
    expect(within(primaryNav).queryByRole('link', { name: /phone pouch protection/i })).not.toBeInTheDocument()
  })

  it('renders footer links for the public funnel', () => {
    render(
      <MarketingShell>
        <div>Page body</div>
      </MarketingShell>
    )

    const footerNav = screen.getByRole('navigation', { name: /footer/i })
    const footerLinks = within(footerNav).getAllByRole('link')

    expect(footerLinks).toHaveLength(3)
    expect(footerLinks.map((link) => ({ name: link.textContent, href: link.getAttribute('href') }))).toEqual([
      { name: 'FAQs', href: '/faqs' },
      { name: 'Security', href: '/security' },
      { name: 'Contact', href: '/contact' }
    ])

    expect(within(footerNav).getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
    expect(within(footerNav).getByRole('link', { name: /faqs/i })).toHaveAttribute('href', '/faqs')
    expect(within(footerNav).getByRole('link', { name: /security/i })).toHaveAttribute('href', '/security')
  })
})
