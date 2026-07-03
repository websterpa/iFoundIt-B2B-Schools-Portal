import React from 'react'

import { MarketingHero, MarketingSection } from '@/components/marketing/marketing-page'

const faqs = [
  {
    question: 'What happens when a pouch is lost?',
    answer:
      'The finder scans the tag, follows the finder page, and the recovery route alerts the school office.'
  },
  {
    question: 'What data is on the tag?',
    answer:
      'No. The tag identifies the pouch and the school. It does not publish the pupil name, phone number, or other personal details.'
  },
  {
    question: 'What does the finder see?',
    answer:
      'The finder sees a recovery page for the pouch and school, not a pupil profile or private contact record.'
  },
  {
    question: 'Who is alerted?',
    answer:
      'The school office is the recovery contact point so staff can decide the next step under school policy.'
  },
  {
    question: 'How does this fit a BYOD policy?',
    answer:
      'The phone remains the pupil-owned device. iFoundIt Schools attaches recovery to the pouch the school manages.'
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
        <dl className="marketing-definition-list">
          {faqs.map((item) => (
            <div key={item.question} className="marketing-definition-list__item">
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </MarketingSection>
    </main>
  )
}
