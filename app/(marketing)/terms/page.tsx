import React from "react";
import { PendingCard } from "@/components/marketing/pending-card";
import { PageHeader } from "@/components/marketing/page-header";

// Structural section list for a B2B SaaS terms of service. As with the
// privacy policy, no actual contractual terms are drafted here — this
// needs a solicitor before it's contract-ready.

const SECTIONS = [
  { heading: "Who this agreement is between", intro: "The contracting parties: the company and the subscribing school or trust." },
  { heading: "The service", intro: "What iFoundIt for Schools provides, and what it doesn't." },
  { heading: "Your responsibilities", intro: "What the school agrees to do — for example, registering tags accurately and keeping account details current." },
  { heading: "Fees and payment", intro: "How and when fees are charged, and what happens if payment is missed." },
  { heading: "Data protection", intro: "References the privacy policy and sets out each party's data protection obligations." },
  { heading: "Liability", intro: "Limits on what the company is liable for." },
  { heading: "Term and termination", intro: "How long the agreement runs, and how either party can end it." },
  { heading: "Governing law", intro: "Which country's law applies and where disputes are handled." },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Terms" title="Terms of service" />

      <section className="marketing__section">
        <div className="marketing__container">
          <p className="marketing-legal__notice">
            This page sets out the sections a B2B SaaS terms of service
            typically needs. None of the wording below is a final
            contract — it needs a solicitor's review before it's used
            with schools.
          </p>

          <div className="marketing-legal">
            {SECTIONS.map((section) => (
              <div className="marketing-legal__section" key={section.heading}>
                <h2>{section.heading}</h2>
                <p className="marketing-legal__intro">{section.intro}</p>
                <PendingCard title="Confirmed wording needed" note="Replace with the confirmed contractual text for this section." />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
