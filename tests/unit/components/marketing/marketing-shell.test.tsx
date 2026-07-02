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

    expect(within(primaryNav).getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
    expect(within(primaryNav).getByRole('link', { name: /for schools/i })).toHaveAttribute('href', '/for-schools')
    expect(within(primaryNav).getByRole('link', { name: /how it works/i })).toHaveAttribute('href', '/how-it-works')
    expect(within(primaryNav).getByRole('link', { name: /security/i })).toHaveAttribute('href', '/security')
    expect(within(primaryNav).getByRole('link', { name: /pricing/i })).toHaveAttribute('href', '/pricing')
    expect(within(primaryNav).getByRole('link', { name: /faqs/i })).toHaveAttribute('href', '/faqs')
    expect(within(primaryNav).getByRole('link', { name: /book a demo/i })).toHaveAttribute('href', '/contact')
    expect(within(primaryNav).getByRole('link', { name: /portal login/i })).toHaveAttribute('href', '/login')
  })

  it('renders footer links for the public funnel', () => {
    render(
      <MarketingShell>
        <div>Page body</div>
      </MarketingShell>
    )

    const footerNav = screen.getByRole('navigation', { name: /footer/i })

    expect(within(footerNav).getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
    expect(within(footerNav).getByRole('link', { name: /faqs/i })).toHaveAttribute('href', '/faqs')
    expect(within(footerNav).getByRole('link', { name: /security/i })).toHaveAttribute('href', '/security')
  })
})
