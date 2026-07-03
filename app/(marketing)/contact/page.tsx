import React from "react";
import { PageHeader } from "@/components/marketing/page-header";
import { PendingCard } from "@/components/marketing/pending-card";
import { ContactForm } from "@/components/marketing/contact-form";

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Talk to us" />

      <section className="marketing__section">
        <div className="marketing__container marketing-contact__inner">
          <div>
            <PendingCard
              title="Contact details"
              note="Add a support email address, phone number, and registered office address here once confirmed."
            />
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
