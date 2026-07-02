# MVP Scope

## MVP Outcome

Deliver a working school portal that supports the end-to-end pouch recovery loop for pilot schools:

1. iFoundIt creates a school account.
2. iFoundIt provisions NFC tag serials to that school.
3. The school admin logs in.
4. The school imports student records.
5. The school assigns tags to students.
6. A finder taps a tag and notifies the school.
7. The school tracks and resolves the event.

## In Scope

- School admin portal at `schools.ifoundit.io`
- School admin authentication using email/password
- Invite-based school account creation by iFoundIt superadmin
- Student CSV import
- Manual student creation for exceptions
- Tag provisioning by iFoundIt superadmin
- Manual and CSV-based tag assignment
- Public finder page by tag serial
- Found-event submission flow
- Finder-flow anti-spam controls: per-tag debounce, honeypot, time-trap, and IP rate limiting
- Finder-flow rejection logging for operational review
- Email notification to school
- Recovery events log
- Basic dashboard counts
- School settings for contact details and logo
- Public school-facing pouch-protection information page at `/schools/pouch-protection`

## Explicitly Out Of Scope

- Self-service school signup
- Parent portal
- Parent email or SMS notifications
- MIS integrations such as Arbor, Bromcom, or SIMS
- MAT dashboards
- Mobile apps
- Audit/compliance reporting
- Finder rewards
- Advanced analytics

## MVP Assumptions

- Pilot schools will accept manual onboarding by iFoundIt
- Schools can provide a usable CSV export of student records
- NFC serials are pre-programmed before shipment
- Email is sufficient for pilot-stage recovery notifications

## Guardrails

- Do not expose student identity on public pages
- Do not expose student identity on public pages or public school-marketing pages
- Do not ship finder submission paths that bypass RLS or silently drop spam rejections without logging
- Do not add features that require a broader support or operations model than the pilot can sustain
- Prefer additive, reversible decisions that keep the pilot launch on schedule
