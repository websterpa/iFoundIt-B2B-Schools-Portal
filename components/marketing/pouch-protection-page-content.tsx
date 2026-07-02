import Link from 'next/link'
import React from 'react'

import {
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading
} from '@/components/marketing/marketing-page'

export function PouchProtectionPageContent() {
  return (
    <main className="marketing-main">
      <MarketingHero eyebrow="For schools" title="Phone pouch protection for schools">
        <p className="marketing-lead">
          Add recovery support to the pouch rollout you already run. If a pouch goes missing outside
          school, the tag gives the finder a safe route back to your team.
        </p>
        <div className="marketing-actions">
          <Link className="marketing-button marketing-button--primary" href="/contact">
            Request a pilot
          </Link>
          <Link className="marketing-button marketing-button--secondary" href="/for-schools">
            See how schools roll it out
          </Link>
        </div>
      </MarketingHero>

      <MarketingSection>
        <MarketingSectionHeading title="Why keep this route live" />
        <div className="marketing-grid">
          <article className="marketing-card">
            <h3>Add to the pouch system you already use</h3>
            <p>
              This is a recovery layer for existing school pouch rollouts, not a replacement for the
              pouch policy itself.
            </p>
          </article>
          <article className="marketing-card">
            <h3>Keep the school as the contact point</h3>
            <p>
              The tag is registered to the school so recovery starts with your team rather than
              exposing pupil data.
            </p>
          </article>
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeading title="Questions schools ask" />
        <div className="marketing-faq">
          <article className="marketing-faq__item">
            <h3>Does this replace our current pouch supplier?</h3>
            <p>
              No. It is designed to complement the pouch rollout your school already operates.
            </p>
          </article>
          <article className="marketing-faq__item">
            <h3>Who sees pupil contact details?</h3>
            <p>
              Nobody through the tag itself. The route leads back to the school, which already holds
              the contact details it needs.
            </p>
          </article>
        </div>
      </MarketingSection>
    </main>
  )
}
