import React from "react";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { SecuritySection } from "@/components/marketing/security-section";
import { DemoRequestForm } from "@/components/marketing/demo-request-form";

// This renders inside your existing app/(marketing)/layout.tsx, which
// should already wrap children in <MarketingShell> and import
// ./marketing.css. Nothing here changes that route separation.

export default function MarketingHomePage() {
  return (
    <>
      <MarketingHero />
      <FeatureGrid />
      <HowItWorks />
      <SecuritySection />
      <DemoRequestForm />
    </>
  );
}
