import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import SecurityPage from '@/app/(marketing)/security/page'

describe('marketing security page', () => {
  it('renders confirmed and pending verification sections', () => {
    render(<SecurityPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /built with school data in mind/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /confirmed/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /pending verification/i })).toBeInTheDocument()
    expect(screen.getByText(/data minimisation by design/i)).toBeInTheDocument()
    expect(screen.getByText(/regulatory alignment statement/i)).toBeInTheDocument()
    expect(screen.getAllByText(/pending verification/i).length).toBeGreaterThan(0)
  })
})
