# CLAUDE.md Addendum — Remaining Marketing Pages

Extends `CLAUDE_marketing_base_scaffold.md`. Authority: `CODEX_2_4_OPERATIONAL_DOCTRINE.md`. HVIM ACTIVE. Overlap-based dirty tree check applies.

Covers: homepage, how-it-works, schools (general), pricing, contact, nav/footer. Pouch protection page already scoped separately in `CLAUDE_pouch_protection_addendum.md` — don't duplicate that work here.

## Scope — IN

```
app/
├── (marketing)/
│   ├── page.tsx                    → homepage-copy.md
│   ├── how-it-works/page.tsx       → how-it-works-copy.md
│   ├── schools/page.tsx            → schools-general-copy.md (links to pouch-protection sub-page)
│   ├── pricing/page.tsx            → pricing-copy.md
│   └── contact/page.tsx            → contact-copy.md
├── components/marketing/
│   ├── nav.tsx                     → nav-footer-content-spec.md
│   └── footer.tsx                  → nav-footer-content-spec.md
```

## Scope — OUT

- No contact form backend/submission handling — the form on `/contact` renders and validates client-side only until an API route is separately scoped
- No legal pages (Privacy Policy, DPA, Terms) — footer links to these but the pages themselves are a separate task; don't invent placeholder legal text
- No pricing figures — `pricing-copy.md` has every number marked `[FIGURE]`. Render the placeholders as visibly incomplete (e.g. a "pricing to be confirmed" style state), do not substitute plausible-looking numbers to fill the layout

## Content rules

- Copy for each page comes verbatim from its named `.md` file. Adapt headings/structure to component markup, don't rewrite substance.
- Where a copy file flags something for PW to confirm (pricing figures, legal links, minimum order quantity), surface that same flag in the rendered page if it affects what's shown — don't silently drop it or fill it with a guess.
- Nav dropdown: "For Schools" has a sub-link to "Phone Pouch Protection" — confirm this renders correctly on both desktop (hover/click dropdown) and mobile (expanded list, not hidden).

## Domain Contract Proof required

Nav and footer are shared across every page in `(marketing)`, including the already-built pouch-protection page. Before building or editing `nav.tsx` / `footer.tsx`, confirm:
- Every existing marketing page importing these components is listed
- Adding the new links doesn't break the pouch-protection page's existing nav usage

## Verification

- [ ] All five pages render outside auth
- [ ] Nav dropdown works on desktop and mobile
- [ ] Footer legal links render as visibly non-functional / "coming soon" rather than broken or invented
- [ ] Pricing page clearly shows `[FIGURE]` placeholders as incomplete, not as real numbers
- [ ] Contact form validates required fields client-side, doesn't submit anywhere yet
- [ ] No hardcoded colours — shared theme system throughout
- [ ] No console errors across all five pages
