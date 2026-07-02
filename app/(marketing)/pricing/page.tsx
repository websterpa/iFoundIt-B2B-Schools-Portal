import Link from 'next/link'
import React from 'react'

import {
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading
} from '@/components/marketing/marketing-page'

export default function PricingPage() {
  return (
    <main className="marketing-main">
      <MarketingHero
        eyebrow="Pricing"
        title="Priced for school roll-outs, not for per-pupil admin overhead"
      >
        <p className="marketing-lead">
          iFoundIt Schools is designed for school and trust roll-outs. We scope pricing around
          pouch volume, onboarding support, and rollout shape.
        </p>
        <div className="marketing-actions">
          <Link className="marketing-button marketing-button--primary" href="/contact">
            Request pricing
          </Link>
        </div>
      </MarketingHero>

      <MarketingSection>
        <MarketingSectionHeading title="What pricing will reflect" />
        <div className="marketing-grid">
          <article className="marketing-card">
            <h3>Pouch volume</h3>
            <p>
              Pricing scales with the number of pouches and year groups involved in the rollout.
            </p>
          </article>
          <article className="marketing-card">
            <h3>Onboarding support</h3>
            <p>
              Schools may need different levels of setup help depending on who handles registration
              and rollout.
            </p>
          </article>
          <article className="marketing-card">
            <h3>Single school or trust</h3>
            <p>
              Enquiry-friendly scoping supports either one school or a grouped rollout without
              inventing fixed commercial tiers.
            </p>
          </article>
        </div>
      </MarketingSection>
    </main>
  )
}
