import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import ContactPage from '@/app/(marketing)/contact/page'

describe('contact marketing page', () => {
  it('renders the talk-to-us contact page and form fields', () => {
    render(<ContactPage />)

    expect(screen.getByRole('heading', { level: 1, name: /talk to us/i })).toBeInTheDocument()
    expect(screen.getByText(/contact details/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^message$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toHaveAttribute('type', 'submit')
  })

  it('shows inline validation errors when required inputs are missing', async () => {
    render(<ContactPage />)

    await userEvent.click(screen.getByRole('button', { name: /send message/i }))

    expect(screen.getByText(/enter your name/i)).toBeInTheDocument()
    expect(screen.getByText(/enter an email address/i)).toBeInTheDocument()
    expect(screen.getByText(/add a short message/i)).toBeInTheDocument()
  })

  it('shows success state after a valid submission', async () => {
    render(<ContactPage />)

    await userEvent.type(screen.getByLabelText(/^name$/i), 'Alex Morgan')
    await userEvent.type(screen.getByLabelText(/^email$/i), 'alex@northbridge.example.org')
    await userEvent.type(screen.getByLabelText(/^message$/i), 'Can we book a call next week?')
    await userEvent.click(screen.getByRole('button', { name: /send message/i }))

    expect(screen.getByRole('heading', { level: 3, name: /message sent/i })).toBeInTheDocument()
    expect(screen.getByText(/we'll get back to you shortly/i)).toBeInTheDocument()
  })
})
