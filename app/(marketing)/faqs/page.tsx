import React from 'react'

import { MarketingHero, MarketingSection } from '@/components/marketing/marketing-page'

const faqs = [
  {
    question: 'Does a pupil need an app?',
    answer:
      'No. Finding a pouch only needs a tap with an NFC-capable phone. There is nothing for the pupil or finder to install.'
  },
  {
    question: 'Does the tag expose pupil information?',
    answer:
      'No. The tag identifies the pouch and the school. It does not publish the pupil name, phone number, or other personal details.'
  }
]

export default function FaqsPage() {
  return (
    <main className="marketing-main">
      <MarketingHero eyebrow="FAQs" title="Questions schools ask before rolling out">
        <p className="marketing-lead">
          The goal is to make pouch recovery simple to evaluate without creating new pupil-facing
          admin overhead.
        </p>
      </MarketingHero>

      <MarketingSection>
        <div className="marketing-faq">
          {faqs.map((item) => (
            <article key={item.question} className="marketing-faq__item">
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </MarketingSection>
    </main>
  )
}
