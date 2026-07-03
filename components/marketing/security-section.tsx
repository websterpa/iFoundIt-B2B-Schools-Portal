// Fixes the P0 finding: instead of trust copy that reads as an unfinished
// placeholder, unverified claims are visually locked behind a
// "Pending verification" state. Nobody can publish this by accident;
// swap CONFIRMED entries for real sign-off wording as it lands, and only
// remove the `pending` flag once legal/DPO copy is confirmed.

import React from "react";

type SecurityCard = {
  title: string;
  body: string;
  pending: boolean;
};

const CARDS: SecurityCard[] = [
  {
    title: "Data minimisation by design",
    body: "Tags are registered to the school's account. No pupil name, contact detail, or device identifier is shown to the person who finds it.",
    pending: false,
  },
  {
    title: "Abuse protection on every scan",
    body: "The finder page sits behind rate limiting and bot filtering, so the reporting flow cannot be spammed or scraped.",
    pending: false,
  },
  {
    title: "Regulatory alignment statement",
    body: "Insert the school's data protection officer or legal team's confirmed wording here before this page goes live. Do not publish placeholder claims.",
    pending: true,
  },
  {
    title: "Data retention policy",
    body: "Link to the actual retention schedule once confirmed. Leave this card in the pending state until the policy is signed off.",
    pending: true,
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="marketing__section">
      <div className="marketing__container">
        <div className="marketing__section-head">
          <h2>Built with school data in mind</h2>
          <p className="marketing__lede">
            Two of the statements below are confirmed. Two are flagged as
            pending, so unfinished copy can never accidentally reach a live
            page.
          </p>
        </div>

        <div className="marketing-grid marketing-grid--2col">
          {CARDS.map((card) => (
            <div
              className={`marketing-card ${card.pending ? "marketing-card--warn" : ""}`}
              key={card.title}
            >
              {card.pending && (
                <span className="marketing-security__badge">Pending verification</span>
              )}
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 32 }}>
          <a href="/security" className="marketing-inline-link">
            Read the full security and data page &rarr;
          </a>
        </p>
      </div>
    </section>
  );
}
