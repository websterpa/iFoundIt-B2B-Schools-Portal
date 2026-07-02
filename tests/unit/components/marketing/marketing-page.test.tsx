import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading,
  MarketingCtaRow
} from '@/components/marketing/marketing-page'

describe('marketing page primitives', () => {
  it('renders a consistent hero and section structure', () => {
    render(
      <>
        <MarketingHero eyebrow="For schools" title="Bring your own device. Seal it. Get it back.">
          <p>Body copy</p>
          <MarketingCtaRow>
            <a href="/contact">Request a pilot</a>
          </MarketingCtaRow>
        </MarketingHero>
        <MarketingSection>
          <MarketingSectionHeading title="What your school gets" />
        </MarketingSection>
      </>
    )

    expect(screen.getByText(/for schools/i)).toHaveClass('marketing-eyebrow')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/bring your own device/i)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/what your school gets/i)
  })
})
