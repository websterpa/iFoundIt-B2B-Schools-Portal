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
      <MarketingHero eyebrow="For schools" title="Procurement-ready recovery for BYOD pouch rollouts">
        <p className="marketing-lead">
          iFoundIt Schools is built for schools that already allow pupils to bring their own phones
          and want a straightforward recovery route when a sealed pouch leaves the building.
        </p>
        <div className="marketing-actions">
          <Link className="marketing-button marketing-button--primary" href="/contact">
            Request a pilot
          </Link>
        </div>
      </MarketingHero>
      <MarketingSection labelledBy="for-schools-what-you-get">
        <MarketingSectionHeading id="for-schools-what-you-get" title="What your school gets" />
        <div className="marketing-document-list">
          <article className="marketing-document-list__item">
            <h3>Rollout in a working session</h3>
            <p>Operational detail: staff provision the pouch register in a focused setup session, with each pouch linked to the school record.</p>
          </article>
          <article className="marketing-document-list__item">
            <h3>No handsets to buy or manage</h3>
            <p>Operational detail: pupils continue using their own phones; iFoundIt Schools supports the pouch recovery layer.</p>
          </article>
          <article className="marketing-document-list__item">
            <h3>Pouches arrive ready to provision</h3>
            <p>Operational detail: tags are fitted before rollout, so the school team starts from serial registration rather than hardware preparation.</p>
          </article>
          <article className="marketing-document-list__item">
            <h3>School office remains the recovery point</h3>
            <p>Operational detail: finders are routed to a school-facing process instead of pupil contact details.</p>
          </article>
        </div>
      </MarketingSection>
      <MarketingSection labelledBy="for-schools-getting-started">
        <MarketingSectionHeading id="for-schools-getting-started" title="Getting started" />
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
      <MarketingSection labelledBy="for-schools-requirements">
        <MarketingSectionHeading id="for-schools-requirements" title="Requirements" />
        <p className="marketing-lead">
          No school-side app or software installation is required. The public recovery path depends
          on a finder using an NFC-capable phone to tap the tag.
        </p>
      </MarketingSection>
    </main>
  )
}
