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
        name: "Every phone finds its way home. Without touching a pupil's own device."
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
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /see the pouch, tag, and finder page in action/i
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /book a demo/i })).toHaveAttribute(
      'href',
      '/contact'
    )
  })
})
