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
    expect(screen.getByRole('button', { name: /request a demo/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/work email/i)).toBeRequired()
  })
})
