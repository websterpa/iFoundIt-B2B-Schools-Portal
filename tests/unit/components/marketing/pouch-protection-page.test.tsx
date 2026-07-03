import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PouchProtectionPageContent } from '@/components/marketing/pouch-protection-page-content'

describe('PouchProtectionPageContent', () => {
  it('keeps the pouch protection route live with school-facing continuity copy', () => {
    render(<PouchProtectionPageContent />)

    expect(
      screen.getByRole('heading', { name: /phone pouch protection for schools/i, level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/add recovery support to the pouch rollout you already run/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /request a pilot/i })).toHaveAttribute(
      'href',
      '/contact'
    )
    expect(screen.getByRole('link', { name: /see how schools roll it out/i })).toHaveAttribute(
      'href',
      '/for-schools'
    )
    expect(screen.queryByText(/contact-placeholder@ifoundit.invalid/i)).not.toBeInTheDocument()
  })
})
