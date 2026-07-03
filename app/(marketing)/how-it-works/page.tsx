import React from 'react'

import {
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading,
  SerialStamp
} from '@/components/marketing/marketing-page'

export default function HowItWorksPage() {
  return (
    <main className="marketing-main">
      <MarketingHero eyebrow="How it works" title="From sealed pouch to recovered phone">
        <p className="marketing-lead">
          Tags attach to the pouch, registered to the school, not the pupil. The finder flow exists
          to get the pouch back to the school office without exposing pupil details.
        </p>
      </MarketingHero>
      <MarketingSection labelledBy="how-it-works-recovery-path">
        <MarketingSectionHeading id="how-it-works-recovery-path" title="The recovery path" />
        <div className="marketing-two-column">
          <ol className="marketing-flow">
            <li className="marketing-flow__step">
              <span className="marketing-number">01</span>
              <p>
                <strong>Pupil seals the pouch.</strong> The phone goes into the pouch under the
                school's BYOD policy.
              </p>
              <span className="marketing-flow__arrow">-&gt;</span>
            </li>
            <li className="marketing-flow__step">
              <span className="marketing-number">02</span>
              <p>
                <strong>Office registers the tag.</strong> The pouch serial is linked to the school
                record, not to pupil data.
              </p>
              <SerialStamp serial="IFS-1264" />
            </li>
            <li className="marketing-flow__step">
              <span className="marketing-number">03</span>
              <p>
                <strong>Finder scans the tag.</strong> An NFC-capable phone opens the finder page
                for that pouch.
              </p>
              <span className="marketing-flow__arrow">-&gt;</span>
            </li>
            <li className="marketing-flow__step">
              <span className="marketing-number">04</span>
              <p>
                <strong>School office is alerted.</strong> The recovery path ends at the school,
                where staff decide what happens next.
              </p>
              <span className="marketing-flow__arrow">Office</span>
            </li>
          </ol>
          <div className="marketing-schematic" aria-label="Finder flow schematic">
            <span className="marketing-label">Pouch tag</span>
            <span>Scan</span>
            <span className="marketing-flow__arrow">-&gt;</span>
            <span>Finder page</span>
            <span className="marketing-flow__arrow">-&gt;</span>
            <span>School office notification</span>
          </div>
        </div>
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
