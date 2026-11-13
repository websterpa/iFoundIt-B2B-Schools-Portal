import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ForSchoolsPage from '@/app/(marketing)/for-schools/page'

describe('for schools marketing page', () => {
  it('renders the mobile-first header hero and supporting sections', () => {
    render(<ForSchoolsPage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /one tap on the pouch brings a lost phone home/i
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /school login/i })
    ).toHaveAttribute('href', '/login')
    expect(
      screen.getByRole('button', { name: /open menu/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /what your school gets/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /what your school gets/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /getting started/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /getting started/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /requirements/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /requirements/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /book a school demo/i })).toHaveAttribute('href', '/book-demo')
    expect(screen.getByRole('link', { name: /how recovery works/i })).toHaveAttribute('href', '/how-it-works')
  })
})
