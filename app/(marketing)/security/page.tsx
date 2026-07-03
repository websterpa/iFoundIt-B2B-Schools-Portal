import React from "react";
import { PageHeader } from "@/components/marketing/page-header";
import { PendingCard } from "@/components/marketing/pending-card";

const CONFIRMED = [
  {
    title: "Data minimisation by design",
    body: "Tags are registered to the school's account. No pupil name, contact detail, or device identifier is shown to the person who finds it.",
  },
  {
    title: "Abuse protection on every scan",
    body: "The finder page sits behind rate limiting and bot filtering, so the reporting flow cannot be spammed or scraped.",
  },
  {
    title: "Modern hosting infrastructure",
    body: "The finder pages and school dashboard run on Vercel with Supabase as the data layer. All traffic uses HTTPS encryption in transit.",
  },
];

const PENDING = [
  {
    title: "Regulatory alignment statement",
    note: "Insert the school's data protection officer or legal team's confirmed wording on UK GDPR / Data Protection Act 2018 alignment. Do not publish placeholder claims.",
  },
  {
    title: "Data retention policy",
    note: "Link to the actual retention schedule for tag registration data once confirmed with legal.",
  },
  {
    title: "Sub-processors",
    note: "List any third parties that process data on iFoundIt's behalf (hosting, email, analytics) once confirmed.",
  },
  {
    title: "Report a security concern",
    note: "Add a monitored contact route (email or form) for responsible disclosure once one exists.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Security & data"
        title="Built with school data in mind"
        lede="What's confirmed today, and what's still waiting on legal or technical sign-off. Nothing here ships as final copy until the pending items are cleared."
      />

      <section className="marketing__section">
        <div className="marketing__container">
          <h2>Confirmed</h2>
          <div className="marketing-grid marketing-grid--3col" style={{ marginBottom: 64 }}>
            {CONFIRMED.map((item) => (
              <div className="marketing-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>

          <h2>Pending verification</h2>
          <div className="marketing-grid marketing-grid--2col">
            {PENDING.map((item) => (
              <PendingCard key={item.title} title={item.title} note={item.note} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
