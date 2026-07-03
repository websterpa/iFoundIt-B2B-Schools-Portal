import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ForSchoolsPage from '@/app/(marketing)/for-schools/page'

describe('for schools marketing page', () => {
  it('renders the school-facing overview and pilot call to action', () => {
    render(<ForSchoolsPage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /procurement-ready recovery for byod pouch rollouts/i
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /what your school gets/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /what your school gets/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /getting started/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /getting started/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /requirements/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /requirements/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /request a pilot/i })).toHaveAttribute(
      'href',
      '/contact'
    )
  })
})
