import React from 'react'

import { MarketingHero, MarketingSection, MarketingSectionHeading } from '@/components/marketing/marketing-page'

export default function SecurityPage() {
  return (
    <main className="marketing-main">
      <MarketingHero eyebrow="Security" title="Recovery designed for privacy from the start">
        <p className="marketing-lead">
          The tag identifies a pouch and a school. It is designed not to publish pupil details to
          the public finder path.
        </p>
      </MarketingHero>

      <MarketingSection>
        <MarketingSectionHeading title="What stays private" />
        <div className="marketing-grid">
          <article className="marketing-card">
            <h3>No pupil data on the tag</h3>
            <p>The public scan route is about recovery, not exposing student identity.</p>
          </article>
          <article className="marketing-card">
            <h3>The school stays in control</h3>
            <p>
              The school remains the operational contact point and decides how to continue the
              recovery process.
            </p>
          </article>
          <article className="marketing-card">
            <h3>Public reporting with guardrails</h3>
            <p>
              Public-facing reporting is framed as abuse-aware and privacy-first without claiming
              controls that the repo cannot prove.
            </p>
          </article>
        </div>
      </MarketingSection>
    </main>
  )
}
