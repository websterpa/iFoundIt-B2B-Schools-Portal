import Link from 'next/link'
import React from 'react'

const CALLBACK_PLACEHOLDER_HREF =
  'mailto:contact-placeholder@ifoundit.invalid?subject=Request%20a%20callback'
const EMAIL_PLACEHOLDER_HREF =
  'mailto:contact-placeholder@ifoundit.invalid?subject=Phone%20Pouch%20Protection%20Enquiry'

export function PouchProtectionPageContent() {
  return (
    <main className="marketing-page marketing-page--pouch">
      <section className="marketing-hero">
        <p className="marketing-eyebrow">For Schools</p>
        <h1>For Schools: Phone Pouch Protection</h1>
        <p className="marketing-lead">
          <strong>Add recovery tags to the phone pouches you already use.</strong>
        </p>
        <p className="marketing-lead">
          Your pupils keep their pouches locked all day. If one goes missing outside school — on
          the bus, at home, in the park — someone finds it, scans the tag, and your school gets
          notified. No app. No new hardware for pupils to carry.
        </p>
        <div className="marketing-actions">
          <Link
            aria-label="Request a callback"
            className="marketing-button marketing-button--primary"
            href={CALLBACK_PLACEHOLDER_HREF}
          >
            Request a callback
          </Link>
          <Link
            aria-label="Email us"
            className="marketing-button marketing-button--secondary"
            href={EMAIL_PLACEHOLDER_HREF}
          >
            Email us
          </Link>
        </div>
        <p className="marketing-note">
          Contact routing is still placeholder-only in this MVP branch and will be supplied before
          launch.
        </p>
      </section>

      <section className="marketing-grid" aria-label="Key information">
        <article className="marketing-card">
          <h2>The cost you&apos;re already covering</h2>
          <p>
            Pupils are responsible for a lost or damaged pouch — but that cost still lands
            somewhere. Replacing a pouch typically runs £20–£30. Multiply that across a year group
            and it adds up fast.
          </p>
          <p>A recovery tag doesn&apos;t stop pouches getting lost. It gets more of them back.</p>
        </article>

        <article className="marketing-card">
          <h2>Built for schools, not just pupils</h2>
          <ul className="marketing-bullets">
            <li>
              <strong>No new procurement decision.</strong> This adds to a pouch order you&apos;ve
              already made — not a new line item to justify from scratch.
            </li>
            <li>
              <strong>No new data burden.</strong> The school is the registered contact. Nothing
              routes anywhere you don&apos;t control.
            </li>
            <li>
              <strong>No pupil-facing app or account.</strong> Nothing for pupils to download, log
              into, or lose access to.
            </li>
          </ul>
        </article>
      </section>

      <section className="marketing-section">
        <h2>How it works</h2>
        <ol className="marketing-steps">
          <li>
            <strong>We tag the pouch.</strong> A small NFC tag attaches to the pouch you already
            issue — no change to your existing supplier or rollout.
          </li>
          <li>
            <strong>The tag is registered to your school.</strong> Not the pupil, not the parent.
            Your school is the point of contact from day one.
          </li>
          <li>
            <strong>Someone finds a lost pouch and taps their phone on the tag.</strong> No app
            needed — any modern smartphone reads it.
          </li>
          <li>
            <strong>Your school gets notified.</strong> You forward it to the parent using contact
            details you already hold. No new data collection, no new consent process.
          </li>
        </ol>
      </section>

      <section className="marketing-section">
        <h2>FAQ</h2>
        <div className="marketing-faq">
          <article className="marketing-faq__item">
            <h3>Does this replace our existing pouch supplier?</h3>
            <p>
              No. The tag attaches to pouches you already have or are already ordering. Think of it
              as an add-on, not a switch.
            </p>
          </article>
          <article className="marketing-faq__item">
            <h3>Who sees the pupil&apos;s contact details?</h3>
            <p>
              Nobody, directly. The tag routes to your school first. You decide how and when to
              contact the parent, using the details you already hold.
            </p>
          </article>
          <article className="marketing-faq__item">
            <h3>Does the tag interfere with the pouch&apos;s locking mechanism?</h3>
            <p>
              We&apos;re confirming compatibility with magnetic locking systems before wider rollout.
              Get in touch and we&apos;ll update you as soon as this is confirmed for your pouch
              type.
            </p>
          </article>
          <article className="marketing-faq__item">
            <h3>Is there a contract to review?</h3>
            <p>
              Yes — a standard data processing agreement, since your school remains the data
              controller throughout. We&apos;ll provide this before any rollout.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}
