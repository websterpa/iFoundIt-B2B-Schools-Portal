import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PouchProtectionPageContent } from '@/components/marketing/pouch-protection-page-content'

describe('PouchProtectionPageContent', () => {
  it('renders the final heading and core reassurance copy', () => {
    render(<PouchProtectionPageContent />)

    expect(
      screen.getByRole('heading', { name: /for schools: phone pouch protection/i, level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/add recovery tags to the phone pouches you already use/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/no app\. no new hardware for pupils to carry\./i)).toBeInTheDocument()
  })

  it('preserves the provisional compatibility wording and accessible ctas', () => {
    render(<PouchProtectionPageContent />)

    expect(
      screen.getByText(/we're confirming compatibility with magnetic locking systems/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /request a callback/i })).toHaveAttribute(
      'href',
      'mailto:contact-placeholder@ifoundit.invalid?subject=Request%20a%20callback'
    )
    expect(screen.getByRole('link', { name: /email us/i })).toHaveAttribute(
      'href',
      'mailto:contact-placeholder@ifoundit.invalid?subject=Phone%20Pouch%20Protection%20Enquiry'
    )
  })
})
