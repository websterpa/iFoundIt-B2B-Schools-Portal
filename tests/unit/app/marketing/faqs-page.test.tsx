import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import FaqsPage from '@/app/(marketing)/faqs/page'

describe('marketing FAQs page', () => {
  it('renders rollout questions without exposing pupil data promises beyond the approved contract', () => {
    render(<FaqsPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /questions schools ask before rolling out/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /does a pupil need an app/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /does the tag expose pupil information/i })).toBeInTheDocument()
    expect(screen.getByText(/it does not publish the pupil name/i)).toBeInTheDocument()
    expect(screen.queryByText(/\[add your replacement/i)).not.toBeInTheDocument()
  })
})
