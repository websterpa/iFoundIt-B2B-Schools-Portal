import React from 'react'
import Link from 'next/link'

import {
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading
} from '@/components/marketing/marketing-page'

export default function ForSchoolsPage() {
  return (
    <main className="marketing-main">
      <MarketingHero eyebrow="For schools" title="Bring your own device. Seal it. Get it back.">
        <p className="marketing-lead">
          iFoundIt Schools is built for schools that already allow pupils to bring their own phones
          and want a straightforward way to manage them during the day.
        </p>
        <div className="marketing-actions">
          <Link className="marketing-button marketing-button--primary" href="/contact">
            Request a pilot
          </Link>
        </div>
      </MarketingHero>
      <MarketingSection>
        <MarketingSectionHeading title="What your school gets" />
        <div className="marketing-grid">
          <article className="marketing-card">
            <h3>Pre-tagged pouches</h3>
            <p>Pouches arrive with an NFC tag already fitted and ready to register.</p>
          </article>
          <article className="marketing-card">
            <h3>A registration portal</h3>
            <p>Office staff register each pouch to the school in a few minutes per form group.</p>
          </article>
          <article className="marketing-card">
            <h3>A finder page under your school name</h3>
            <p>
              Anyone who finds a pouch sees your school identity, not a third-party brand detour.
            </p>
          </article>
          <article className="marketing-card">
            <h3>No pupil accounts</h3>
            <p>
              There is nothing for pupils to log in to and nothing tied to their personal details.
            </p>
          </article>
        </div>
      </MarketingSection>
      <MarketingSection>
        <MarketingSectionHeading title="Getting started" />
        <div className="marketing-grid marketing-grid--steps">
          <article className="marketing-card">
            <h3>Order pouches</h3>
            <p>Choose a quantity based on the year groups covered by your BYOD policy.</p>
          </article>
          <article className="marketing-card">
            <h3>Register with the school</h3>
            <p>Office staff link each pouch serial to the school account.</p>
          </article>
          <article className="marketing-card">
            <h3>Brief staff and pupils</h3>
            <p>
              A short briefing covers sealing, storage, and what happens if a pouch goes missing.
            </p>
          </article>
        </div>
      </MarketingSection>
      <MarketingSection>
        <MarketingSectionHeading title="Requirements" />
        <p className="marketing-lead">
          No school-side app or software installation is required. The public recovery path depends
          on a finder using an NFC-capable phone to tap the tag.
        </p>
      </MarketingSection>
    </main>
  )
}
