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
    const { container } = render(
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

    const heroHeading = screen.getByRole('heading', { level: 1 })
    const sectionHeading = screen.getByRole('heading', { level: 2 })
    const eyebrow = screen.getByText(/for schools/i)
    const hero = heroHeading.closest('section')
    const section = sectionHeading.closest('section')
    const ctaLink = screen.getByRole('link', { name: /request a pilot/i })
    const ctaRow = ctaLink.closest('div')

    expect(hero).toHaveClass('marketing-hero')
    expect(eyebrow).toHaveClass('marketing-eyebrow')
    expect(container.querySelector('.marketing-stack')).toContainElement(ctaLink)
    expect(section).toHaveClass('marketing-section')
    expect(sectionHeading.parentElement).toHaveClass('marketing-section__heading')
    expect(ctaRow).toHaveClass('marketing-actions')
  })
})
