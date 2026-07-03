import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import PricingPage from '@/app/(marketing)/pricing/page'

describe('marketing pricing page', () => {
  it('renders quote-first pricing copy and common questions', () => {
    render(<PricingPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /talk to us for a quote/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /get pricing for your school/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /common questions/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /how is pricing structured/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /book a demo/i })).toHaveAttribute('href', '/#demo')
  })
})
