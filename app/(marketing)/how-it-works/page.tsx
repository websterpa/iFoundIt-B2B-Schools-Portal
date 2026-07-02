import React from 'react'

import {
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading
} from '@/components/marketing/marketing-page'

export default function HowItWorksPage() {
  return (
    <main className="marketing-main">
      <MarketingHero eyebrow="How it works" title="From sealed pouch to recovered phone">
        <p className="marketing-lead">
          A pouch, a tag, and a page. Here is what happens at each stage.
        </p>
      </MarketingHero>
      <MarketingSection labelledBy="how-it-works-recovery-path">
        <MarketingSectionHeading id="how-it-works-recovery-path" title="The recovery path" />
        <ol className="marketing-steps">
          <li>
            <strong>Seal the pouch.</strong> The pupil seals their phone in the pouch at the start
            of the day.
          </li>
          <li>
            <strong>Register the tag.</strong> The school links the pouch serial to its own account
            in the portal.
          </li>
          <li>
            <strong>Tap the finder page.</strong> Whoever finds the pouch taps the NFC tag with a
            modern phone.
          </li>
          <li>
            <strong>Alert the school.</strong> The tag routes the finder into a school-facing
            recovery path instead of exposing pupil details.
          </li>
        </ol>
      </MarketingSection>
      <MarketingSection labelledBy="how-it-works-safer">
        <MarketingSectionHeading id="how-it-works-safer" title="What makes this safer" />
        <p className="marketing-lead">
          The school remains the contact point, the tag does not publish pupil information, and
          the public recovery flow is shaped for privacy-first reporting.
        </p>
      </MarketingSection>
    </main>
  )
}
