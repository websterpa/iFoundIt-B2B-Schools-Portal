import React from 'react'
import Link from 'next/link'

import {
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading
} from '@/components/marketing/marketing-page'

export default function HomePage() {
  return (
    <main className="marketing-main">
      <MarketingHero
        eyebrow="For schools with a BYOD policy"
        title="Every phone finds its way home. Without touching a pupil's own device."
      >
        <p className="marketing-lead">
          iFoundIt Schools tags the pouch, not the phone. Pupils bring their own device, the
          school registers the pouch, and the finder page does the rest.
        </p>
        <div className="marketing-actions">
          <Link className="marketing-button marketing-button--primary" href="/contact">
            Request a pilot
          </Link>
          <Link className="marketing-button marketing-button--secondary" href="/how-it-works">
            See how it works
          </Link>
        </div>
        <p className="marketing-note">
          Registered to the school, not the pupil. No personal data is stored on the tag.
        </p>
      </MarketingHero>

      <MarketingSection>
        <MarketingSectionHeading title="Three steps, one policy" />
        <div className="marketing-grid marketing-grid--steps">
          <article className="marketing-card">
            <h3>Seal</h3>
            <p>
              The pupil places their own phone in a magnetically sealed pouch at the start of the
              day.
            </p>
          </article>
          <article className="marketing-card">
            <h3>Register</h3>
            <p>
              Each pouch carries an NFC tag registered to the school, not the individual pupil.
            </p>
          </article>
          <article className="marketing-card">
            <h3>Recover</h3>
            <p>
              If a pouch is lost, a scan of the tag opens a finder page and alerts the school
              office.
            </p>
          </article>
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeading title="Why schools choose iFoundIt Schools" />
        <div className="marketing-grid marketing-grid--benefits">
          <article className="marketing-card">
            <h3>BYOD stays simple</h3>
            <p>
              Pupils keep their own phones. The school keeps the policy. No handsets to buy or
              manage.
            </p>
          </article>
          <article className="marketing-card">
            <h3>No personal data on the tag</h3>
            <p>The tag identifies the pouch and the school. It does not identify the pupil.</p>
          </article>
          <article className="marketing-card">
            <h3>Finder flow built to resist abuse</h3>
            <p>
              The public path is designed to support recovery without turning into an easy spam
              route.
            </p>
          </article>
          <article className="marketing-card">
            <h3>Set up in a working session</h3>
            <p>
              Pouches arrive ready to provision, and the school-facing portal is designed for quick
              onboarding.
            </p>
          </article>
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeading title="See the pouch, tag, and finder page in action" />
        <div className="marketing-actions">
          <Link className="marketing-button marketing-button--primary" href="/contact">
            Book a demo
          </Link>
        </div>
      </MarketingSection>
    </main>
  )
}
