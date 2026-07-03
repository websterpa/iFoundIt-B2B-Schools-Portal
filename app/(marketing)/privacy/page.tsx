import React from "react";
import { PendingCard } from "@/components/marketing/pending-card";
import { PageHeader } from "@/components/marketing/page-header";

// Section structure follows what the ICO requires a UK GDPR privacy
// notice to cover (Articles 13/14: who you are, what you collect, your
// lawful basis, retention, sharing, and individual rights). None of the
// actual wording below is legal advice or final copy — every section
// needs your DPO or solicitor's sign-off before this page is live.

const SECTIONS = [
  {
    heading: "Who we are",
    intro: "The data controller for this site and the identity of the legal entity responsible for it.",
  },
  {
    heading: "What personal data we collect",
    intro: "For the pouch-finder flow itself, no pupil name, contact detail, or device identifier is collected from the public. This section should still cover any data collected via the demo and contact forms on this site.",
  },
  {
    heading: "Why we collect it, and our lawful basis",
    intro: "The lawful basis under UK GDPR (e.g. consent, contract, legitimate interests) for each use of personal data.",
  },
  {
    heading: "How long we keep it",
    intro: "Retention periods for data collected through this site, and when it's deleted.",
  },
  {
    heading: "Who we share it with",
    intro: "Any processors or third parties (hosting, email, analytics) that handle this data on the company's behalf.",
  },
  {
    heading: "Your rights",
    intro: "Under UK GDPR, individuals generally have rights to access, correct, delete, or restrict use of their personal data, and to object to certain processing. Which apply here, and how to exercise them, needs confirming.",
  },
  {
    heading: "Cookies",
    intro: "What cookies or similar tracking technologies this site uses, and how consent is obtained.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy policy" />

      <section className="marketing__section">
        <div className="marketing__container">
          <p className="marketing-legal__notice">
            This page sets out the structure a UK GDPR-compliant privacy
            policy needs. Every section below needs input from a DPO or
            solicitor before this goes live — none of it is final legal
            text.
          </p>

          <div className="marketing-legal">
            {SECTIONS.map((section) => (
              <div className="marketing-legal__section" key={section.heading}>
                <h2>{section.heading}</h2>
                <p className="marketing-legal__intro">{section.intro}</p>
                <PendingCard title="Confirmed wording needed" note="Replace with the confirmed legal text for this section." />
              </div>
            ))}

            <div className="marketing-legal__section">
              <h2>How to complain</h2>
              <p className="marketing-legal__intro">
                You can complain to the Information Commissioner&apos;s
                Office (ico.org.uk) if you&apos;re unhappy with how your
                data has been handled.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
