# iFoundIt Schools Marketing Funnel Design

## Summary

Translate the stronger public-site information architecture from `epic4schools-site` into the main app's `(marketing)` route group so the canonical repository contains the complete school-facing marketing funnel under the `iFoundIt Schools` identity.

This is not a literal copy. The reference folder provides the source structure, page set, and message spine. The main app becomes the only public site to maintain, and all outward-facing language should align to `iFoundIt Schools`.

## Goals

- turn the current two-page public surface into a complete school-facing funnel
- preserve the strongest content structure already developed in `epic4schools-site`
- translate all public-facing identity from `Epic 4 Schools` to `iFoundIt Schools`
- keep public marketing styling and structure separate from authenticated product UI concerns
- retain continuity for the existing `/schools/pouch-protection` route while establishing a clearer canonical explainer route

## Non-Goals

- do not redesign the authenticated app shell or superadmin workspace in this slice
- do not merge marketing visual language into protected product surfaces
- do not publish unverified commercial, security, or operational claims as facts
- do not maintain `epic4schools-site` as a second live public app

## Source Of Truth

The source material for this slice is the local reference folder:

- `epic4schools-site/app/(marketing)/page.tsx`
- `epic4schools-site/app/(marketing)/for-schools/page.tsx`
- `epic4schools-site/app/(marketing)/how-it-works/page.tsx`
- `epic4schools-site/app/(marketing)/pricing/page.tsx`
- `epic4schools-site/app/(marketing)/security/page.tsx`
- `epic4schools-site/app/(marketing)/faqs/page.tsx`
- `epic4schools-site/app/(marketing)/contact/page.tsx`
- `epic4schools-site/app/(marketing)/components/Nav.tsx`
- `epic4schools-site/app/(marketing)/components/Footer.tsx`
- `epic4schools-site/app/(marketing)/tokens.css`
- `epic4schools-site/app/(marketing)/styles.css`

The canonical implementation target is the main app's `(marketing)` route group.

## Route Map

The public marketing funnel should exist as first-class routes in the main app:

- `/`
- `/for-schools`
- `/how-it-works`
- `/pricing`
- `/security`
- `/faqs`
- `/contact`

### Existing route continuity

Keep `/schools/pouch-protection` live during this slice.

Chosen direction:

- `/for-schools` becomes the canonical explainer route
- `/schools/pouch-protection` remains available for continuity and can share or align with the same underlying message system
- no redirect is required in this first implementation slice unless the final implementation makes the overlap confusing

## Information Architecture

### Homepage

The homepage should communicate:

- the core BYOD-compatible value proposition
- the pouch-tag-finder flow in a short, readable sequence
- the key reasons a school would choose the system
- a clear CTA to book a demo or request a pilot

The strongest structure from the reference homepage should be retained:

- hero
- three-step flow
- value reasons
- CTA close

### For Schools

This page should serve school decision-makers evaluating operational fit.

It should cover:

- what the school receives
- how rollout starts
- practical requirements and operational expectations

### How It Works

This page should explain the end-to-end recovery path:

- pouch sealed
- tag registered
- finder scans
- finder page opens
- school is alerted
- recovery path continues

### Pricing

This page should exist as a public route, but must fail closed on uncertain specifics.

Chosen rule:

- preserve the presence and layout intent of a pricing page from the reference site
- keep wording decision-oriented and operational
- if precise tiering, quantities, or commercial commitments are not confirmed in repo truth, soften them into enquiry-oriented framing rather than hard claims

### Security

This page should explain:

- no pupil data on the tag
- privacy boundaries between pouch, tag, finder, and school
- abuse-aware handling on the public finder path

It should communicate confidence without inventing guarantees that are not verified in the main codebase.

### FAQs

This page should answer likely school objections and rollout questions.

Any placeholder or bracketed answers in the reference source must be removed or rewritten before shipping.

### Contact

This page should act as the funnel close:

- request a pilot
- request a demo
- share school context

It should feel consistent with the rest of the public system and avoid generic contact-form drift.

## Brand Translation

The public site should be presented under `iFoundIt Schools`, not `Epic 4 Schools`.

Translation rules:

- replace `Epic 4 Schools` brand references with `iFoundIt Schools`
- preserve useful conceptual phrases such as BYOD, tagged pouch, finder page, and school registration where they remain accurate
- prefer the current repo's product framing when wording conflicts with the reference copy
- remove any phrasing that implies claims the repository cannot support

## Visual System Direction

This slice prioritises information architecture over visual reinvention, but the implementation should still mature the existing public system into a coherent multi-page marketing experience.

Chosen direction:

- keep the marketing shell in the `(marketing)` boundary
- evolve it into a reusable public-site system with shared nav, footer, CTA treatments, section rhythm, and consistent page-width rules
- avoid leaking this marketing language into authenticated product surfaces

The visual system should support:

- a consistent public navigation model
- repeatable hero, section, grid, FAQ, and CTA patterns
- enough flexibility for seven pages without each page becoming visually repetitive

## Styling Boundary

Public marketing styling must be isolated from authenticated product UI concerns.

Implementation intent:

- public route styles should remain scoped to marketing surfaces
- authenticated shells should not inherit a marketing-first visual identity by accident
- if existing global styles are too broad, this slice should narrow their responsibility so future product-surface work can evolve independently

## Content Safety Rules

The reference site contains some content that is not ready to publish unchanged.

Before implementation completes:

- remove bracketed editorial notes
- remove placeholder answers
- soften or omit any unverified pricing, security, hardware, or operational claims
- prefer enquiry CTAs when precision cannot be proven from repo truth

## Implementation Shape

The implementation should:

- extend the main app's `(marketing)` route group to include the full route set
- port the best page structure from the reference folder into the canonical app
- reuse shared marketing components where appropriate rather than duplicating page scaffolding
- keep `/schools/pouch-protection` aligned with the new system during the transition

## Verification

Minimum expected verification for this slice:

- route-level inspection of all public marketing pages
- responsive checks across mobile and desktop widths
- verification that public navigation and footer links form a coherent funnel
- repo-state validation after edits
- targeted tests or build validation if they can be run cleanly in the current workspace

## Risks

- the current main-app marketing styles may be too narrow or too global for the full funnel, which could force some CSS reshaping
- the reference copy includes claims and placeholders that need careful editorial cleanup
- route overlap between `/for-schools` and `/schools/pouch-protection` needs to stay understandable during the transition

## Chosen Direction

Implement the full public marketing funnel in the main app, using `epic4schools-site` as the structural and messaging source while translating the experience into the `iFoundIt Schools` brand and keeping public-site concerns separate from authenticated product UI work.
