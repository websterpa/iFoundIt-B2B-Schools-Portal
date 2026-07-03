---
name: iFoundIt B2B Schools Portal
description: Privacy-first school recovery workflows with a calm, operational marketing voice.
colors:
  marketing-bg: "#FFFFFF"
  marketing-bg-alt: "#F5F7FB"
  marketing-text: "#0B1F3A"
  marketing-text-muted: "#5B6B82"
  marketing-accent: "#245EDB"
  marketing-accent-hover: "#1C49AD"
  marketing-accent-tint: "#EAF0FD"
  marketing-warn-border: "#8EADE8"
  marketing-warn-bg: "#F2F6FF"
  marketing-warn-text: "#2F4F86"
  global-bg: "#F5F1E8"
  global-surface: "#FFFDF8"
typography:
  display:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "clamp(2.125rem, 4.6vw, 3.375rem)"
    fontWeight: 650
    lineHeight: 1.08
  body:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.04em"
  editorial:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  sm: "8px"
  md: "14px"
  lg: "22px"
spacing:
  "1": "0.5rem"
  "2": "1rem"
  "3": "1.5rem"
  "4": "2rem"
  "5": "3rem"
  "6": "4rem"
components:
  button-primary:
    backgroundColor: "{colors.marketing-accent}"
    textColor: "{colors.marketing-bg}"
    rounded: "{rounded.sm}"
    padding: "0.6875rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.marketing-accent-hover}"
    textColor: "{colors.marketing-bg}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.marketing-bg}"
    textColor: "{colors.marketing-text}"
    rounded: "{rounded.sm}"
    padding: "0.6875rem 1.25rem"
  card-default:
    backgroundColor: "{colors.marketing-bg}"
    textColor: "{colors.marketing-text}"
    rounded: "{rounded.md}"
    padding: "1.75rem"
  field-default:
    backgroundColor: "{colors.marketing-bg}"
    textColor: "{colors.marketing-text}"
    rounded: "{rounded.sm}"
    padding: "0.6875rem 0.75rem"
---

# Design System: iFoundIt B2B Schools Portal

## Overview

**Creative North Star: "Calm School Operations"**

The marketing experience should read as trustworthy and practical for school staff who need to decide quickly whether the workflow is safe and operationally realistic. The visual system favors clear type hierarchy, gentle section rhythm, and explicit reassurance over decorative effects.

The brand voice is confident but low-noise. Accent blue is reserved for action and orientation, while backgrounds stay light and legible to support long-form policy and legal reading.

**Key Characteristics:**
- Conversion-focused structure without aggressive visual noise.
- Trust-first copy and state signaling for legal/security surfaces.
- Consistent component vocabulary between marketing and form flows.
- Mobile-safe spacing and readable body text density.

## Colors

The palette is restrained with one action accent and clear neutral surfaces.

### Primary
- **Action Blue** (`#245EDB`): Primary CTA, active links, and focus direction.

### Secondary
- **Deep Ink** (`#0B1F3A`): Main headings and high-emphasis text.

### Tertiary
- **Verification Blue** (`#8EADE8`): Pending-verification framing with low alarm tone.

### Neutral
- **Surface White** (`#FFFFFF`): Main card and section backgrounds.
- **Section Mist** (`#F5F7FB`): Alternate section backgrounds.
- **Muted Ink** (`#5B6B82`): Supporting copy and helper text.
- **Verification Wash** (`#F2F6FF`): Pending legal/security containers.

### Named Rules
**The Single-Accent Rule.** Blue carries action; warnings use framed context rather than alarm-red styling unless an actual error state is present.

## Typography

**Display Font:** Inter (fallback `-apple-system, sans-serif`)  
**Body Font:** Inter (fallback `-apple-system, sans-serif`)  
**Label/Mono Font:** Inter (fallback `-apple-system, sans-serif`)  
**Editorial Surface Font:** Georgia (fallback `Times New Roman, serif`) for legacy UUPM pages in `app/globals.css`

**Character:** Practical and legible, tuned for decision-making and policy clarity.

### Hierarchy
- **Display** (650, `clamp(2.125rem, 4.6vw, 3.375rem)`, 1.08): Homepage and page-header H1.
- **Headline** (650, `clamp(1.75rem, 3.4vw, 2.25rem)`, 1.2): Section-level H2s.
- **Title** (600, `1.0625rem`, 1.3): Card and list titles.
- **Body** (400, `1rem`, 1.55): Core explanatory copy and form helper text.
- **Label** (600, `0.8125rem`, `0.04em` letter-spacing): Field labels and compact metadata.

### Named Rules
**The One-Kicker Rule.** Eyebrow text is intentional and sparse; do not scaffold every section with repeating uppercase kickers.

## Elevation

Depth is conveyed with subtle borders and alternating surfaces rather than heavy shadows. Sticky/header treatments are transparent overlays for readability, not decorative glass cards.

### Named Rules
**The Quiet Surface Rule.** Prefer border + spacing hierarchy first; add visual effects only when they improve comprehension.

## Components

### Buttons
- **Shape:** Soft rectangular corners (`8px` radius).
- **Primary:** Action blue fill with white text and clear hover darkening.
- **Hover / Focus:** Hover to `#1C49AD`; focus ring remains explicit for keyboard users.
- **Secondary:** Neutral ghost variant with border emphasis for lower-priority actions.

### Chips
- **Style:** Compact, uppercase metadata chips with bordered neutral background.
- **State:** Informational badges only; not used as action controls.

### Cards / Containers
- **Corner Style:** `14px` default on content cards and warning blocks.
- **Background:** White on neutral section backgrounds for readable separation.
- **Shadow Strategy:** Border-led, low-shadow approach.
- **Border:** 1px to 1.5px rule lines and dashed pending states.

### Inputs / Fields
- **Style:** White field background, muted border, inherited body type.
- **Focus:** Accent border for active field context.
- **Error / Disabled:** Error states use `--ifs-error`; disabled state reduces emphasis without hiding text.

### Navigation
- **Style:** Inline desktop nav, stacked mobile drawer.
- **States:** Hover/focus accent only where interaction intent is needed.
- **Mobile treatment:** Explicit menu toggle and full-width tap targets.

## Do's and Don'ts

### Do:
- **Do** preserve strong readability on long marketing/legal content blocks (`max-width` around `65–75ch`).
- **Do** keep pending legal/security statements visibly labeled as unverified.
- **Do** use one clear primary CTA per section and remove redundant competing labels.
- **Do** maintain semantic heading order (no skipped heading levels).

### Don't:
- **Don't** use side-stripe accent borders on callouts (`border-left`/`border-right` emphasis patterns are prohibited).
- **Don't** scaffold every section with repeating uppercase eyebrow text.
- **Don't** let navigation labels imply destinations that differ from the linked page intent.
- **Don't** style placeholder or unverified legal copy as if it were final approved policy text.
