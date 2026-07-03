import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MarketingShell } from '@/components/marketing/marketing-shell'

describe('MarketingShell', () => {
  it('renders the redesigned anchor-based primary navigation', () => {
    render(
      <MarketingShell>
        <div>Page body</div>
      </MarketingShell>
    )

    const primaryNav = screen.getByRole('navigation', { name: /primary/i })
    const primaryLinks = within(primaryNav).getAllByRole('link')

    expect(primaryLinks).toHaveLength(5)
    expect(primaryLinks.map((link) => ({ name: link.textContent, href: link.getAttribute('href') }))).toEqual([
      { name: 'Product', href: '/#features' },
      { name: 'How it works', href: '/#how-it-works' },
      { name: 'Security', href: '/security' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'School Login', href: '/login' }
    ])

    expect(screen.getAllByRole('link', { name: /school login/i })).not.toHaveLength(0)
    expect(screen.getByRole('link', { name: /book a school demo/i })).toHaveAttribute('href', '/#demo')
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main')
    expect(screen.getAllByRole('link', { name: /ifoundit for schools/i })).toHaveLength(2)
  })

  it('renders redesigned footer link columns', () => {
    render(
      <MarketingShell>
        <div>Page body</div>
      </MarketingShell>
    )

    expect(screen.getByRole('heading', { level: 3, name: 'Product' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Company' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Legal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
    expect(screen.getAllByRole('link', { name: 'School Login' }).every((link) => link.getAttribute('href') === '/login')).toBe(true)
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms')
  })
})
