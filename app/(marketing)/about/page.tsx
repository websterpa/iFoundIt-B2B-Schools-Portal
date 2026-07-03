import React from "react";
import { PageHeader } from "@/components/marketing/page-header";
import { PendingCard } from "@/components/marketing/pending-card";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Built by people who work with schools every day"
      />

      <section className="marketing__section">
        <div className="marketing__container">
          <div className="marketing__section-head">
            <h2>What we do</h2>
            <p className="marketing__lede">
              iFoundIt started as a lost-property recovery service built
              around NFC tags. iFoundIt for Schools applies the same idea
              to BYOD phone pouches: tag the pouch, register it to the
              school, and give whoever finds it a fast way to return it —
              without exposing pupil data in the process.
            </p>
          </div>

          <div className="marketing-grid marketing-grid--2col">
            <PendingCard
              title="Our story"
              note="Add the founder-written story of the product once you've confirmed what's appropriate to share publicly."
            />
            <PendingCard
              title="Team"
              note="Add founder and team bios, roles, and photos here."
            />
          </div>
        </div>
      </section>
    </>
  );
}
