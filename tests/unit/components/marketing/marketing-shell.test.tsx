import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MarketingShell } from '@/components/marketing/marketing-shell'

describe('MarketingShell', () => {
  it('renders the shared public navigation including the pouch protection link', () => {
    render(
      <MarketingShell>
        <div>Page body</div>
      </MarketingShell>
    )

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /portal login/i })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: /phone pouch protection/i })).toHaveAttribute(
      'href',
      '/schools/pouch-protection'
    )
  })
})
