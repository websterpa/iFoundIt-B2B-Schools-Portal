import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import PricingPage from '@/app/(marketing)/pricing/page'

describe('marketing pricing page', () => {
  it('renders scoped pricing without placeholder figures', () => {
    render(<PricingPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /priced for school roll-outs/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /what pricing will reflect/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /pouch volume/i })).toBeInTheDocument()
    expect(screen.queryByText(/\[.*\]/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /request pricing/i })).toHaveAttribute(
      'href',
      '/contact'
    )
  })
})
