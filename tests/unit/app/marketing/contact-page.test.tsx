import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ContactPage from '@/app/(marketing)/contact/page'

describe('contact marketing page', () => {
  it('renders the demo request form', () => {
    render(<ContactPage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /see the pouch, tag, and finder page working together/i
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /start the conversation/i })
    ).toBeInTheDocument()

    expect(screen.getByLabelText(/school name/i)).toHaveAttribute('name', 'school')
    expect(screen.getByLabelText(/your role/i)).toHaveAttribute('name', 'role')
    expect(screen.getByLabelText(/work email/i)).toBeRequired()
    expect(screen.getByLabelText(/work email/i)).toHaveAttribute('name', 'email')
    expect(screen.getByLabelText(/roll-out scope/i)).toHaveAttribute('name', 'scope')
    expect(screen.getByLabelText(/notes/i)).toHaveAttribute('name', 'notes')
    expect(screen.getByRole('button', { name: /request a demo/i })).toBeInTheDocument()
  })
})
