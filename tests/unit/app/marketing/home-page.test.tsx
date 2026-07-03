import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import HomePage from '@/app/(marketing)/page'

describe('marketing homepage', () => {
  it('renders the redesigned single-page marketing sections', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /one tap on the pouch brings a lost phone home/i
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /designed around the pouch you already own/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /from locked pouch to safe return/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /built with school data in mind/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /book a school demo/i })).toHaveAttribute('href', '#demo')
    expect(screen.getByRole('link', { name: /how recovery works/i })).toHaveAttribute(
      'href',
      '#how-it-works'
    )
  })
})
