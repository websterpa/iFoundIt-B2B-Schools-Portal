import React from 'react'

import {
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading
} from '@/components/marketing/marketing-page'

export default function ContactPage() {
  return (
    <main className="marketing-main">
      <MarketingHero
        eyebrow="Book a demo"
        title="See the pouch, tag, and finder page working together"
      >
        <p className="marketing-lead">
          Tell us a little about your school and we will get back to you to arrange a time.
        </p>
      </MarketingHero>
      <MarketingSection>
        <MarketingSectionHeading title="Start the conversation" />
        <form className="marketing-form">
          <label>
            School name
            <input name="school" type="text" required />
          </label>
          <label>
            Your role
            <input name="role" type="text" required />
          </label>
          <label>
            Work email
            <input name="email" type="email" required />
          </label>
          <label>
            Roll-out scope
            <select name="scope" defaultValue="school">
              <option value="school">Whole school</option>
              <option value="year-group">Specific year groups</option>
              <option value="trust">Trust or group of schools</option>
            </select>
          </label>
          <label>
            Notes
            <textarea name="notes" rows={4} />
          </label>
          <button className="marketing-button marketing-button--primary" type="submit">
            Request a demo
          </button>
        </form>
      </MarketingSection>
    </main>
  )
}
