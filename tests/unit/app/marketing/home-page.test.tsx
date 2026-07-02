import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import HomePage from '@/app/(marketing)/page'

describe('marketing homepage', () => {
  it('renders the new school-facing funnel sections', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /every phone finds its way home/i
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /three steps, one policy/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /why schools choose ifoundit schools/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /request a pilot/i })).toHaveAttribute(
      'href',
      '/contact'
    )
  })
})
