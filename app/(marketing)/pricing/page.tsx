import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";

// No tier names, feature splits, or figures are invented here. Pricing
// structure (per-pupil, per-site, annual vs termly) isn't something to
// guess at on a live commercial page — this ships as a quote-based CTA
// until real numbers are confirmed, at which point the panel below is
// the place to put them.

const FAQ = [
  {
    q: "How is pricing structured?",
    a: "Pending confirmation — per-pupil and per-site models are both possible depending on school size.",
  },
  {
    q: "Is there a setup or installation fee?",
    a: "Pending confirmation.",
  },
  {
    q: "Do you offer a trial or pilot period?",
    a: "Pending confirmation.",
  },
  {
    q: "Does this replace our existing pouches?",
    a: "No. Tags attach to the mag-lock pouches you already use.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Talk to us for a quote"
        lede="Pricing is confirmed per school during the demo call, based on pupil numbers and site count."
      />

      <section className="marketing__section">
        <div className="marketing__container">
          <div className="marketing-pricing-panel">
            <h2>Get pricing for your school</h2>
            <p className="marketing__lede" style={{ margin: "0 auto 24px" }}>
              Book a 20-minute call and we&apos;ll walk through numbers for your pupil count and site setup.
            </p>
            <Link href="/#demo" className="btn btn--primary">Book a demo</Link>
          </div>

          <h2>Common questions</h2>
          <div className="marketing-faq">
            {FAQ.map((item) => (
              <div className="marketing-faq__item" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
