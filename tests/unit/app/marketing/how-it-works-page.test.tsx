import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import HowItWorksPage from '@/app/(marketing)/how-it-works/page'

describe('how it works marketing page', () => {
  it('renders the recovery path overview', () => {
    render(<HowItWorksPage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /from sealed pouch to recovered phone/i
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /the recovery path/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /what makes this safer/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/the school remains the contact point/i)
    ).toBeInTheDocument()
  })
})
