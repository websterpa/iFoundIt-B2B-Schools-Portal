import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import SecurityPage from '@/app/(marketing)/security/page'

describe('marketing security page', () => {
  it('renders security copy that keeps pupil PII out of the public tag flow', () => {
    render(<SecurityPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /recovery designed for privacy/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /no pupil data on the tag/i })).toBeInTheDocument()
    expect(screen.getByText(/not exposing student identity/i)).toBeInTheDocument()
    expect(screen.getByText(/without claiming controls that the repo cannot prove/i)).toBeInTheDocument()
  })
})
