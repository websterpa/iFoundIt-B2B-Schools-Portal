# BYOD workflow

## Runtime configuration

Configure the existing Supabase settings plus `NEXT_PUBLIC_TURNSTILE_SITEKEY`, `TURNSTILE_SECRET_KEY`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, and `NEXT_PUBLIC_APP_URL` in the target environment. The sender must be verified in SendGrid. The app URL must point to the deployed school portal; localhost URLs are only for local testing. Secrets belong in private environment configuration, never in source control. Do not use the local Cloudflare test challenge keys in production.

## Trusted Contacts and Collection Details (2026-11-13)

This section supersedes the single-parent workflow described in the historical verification notes below.

- Students now has a Trusted Contacts editor. School admins and superadmins with a selected school can add, edit, approve, individually opt in/out, and delete contacts. Deletion requires an explicit confirmation in the form. Name, relationship (such as grandparent or guardian) and phone are optional; email is required. Duplicate emails for one student are rejected.
- Approval and notification consent are separate, default-off controls. Both and their timestamps are required before sending. Changing an email clears both controls, and the server refuses to transfer existing approval/consent to a different email. A changed email must first be saved with both off, then explicitly reviewed and enabled.
- Migration `20261113060843_student_trusted_contacts.sql` copies existing nonblank parent emails and phone details into contact records, preserving recorded consent/timestamps and approving only previously enabled parent contacts. Original student parent fields remain untouched as a legacy snapshot. Future notification routing uses only Trusted Contacts: deleting or opting a contact out never falls back to old parent consent. Imports leave both legacy data and contacts unchanged.
- Contacts are constrained to the student's school by a composite foreign key. RLS limits authenticated CRUD to the owning school's admins or a superadmin. Anonymous access is revoked. Server actions additionally filter edits/deletes by contact ID, student ID and resolved school ID.
- Each eligible contact gets a separate plain-text message; no contact list, student identity, finder notes or admin portal link is included. Wording refers to a "student you support", not "your child". Addresses are normalized and deduplicated per event.
- Settings includes optional Collection Details (maximum 2,000 characters, plain text without URLs): collection centre/address, opening days/hours, appointment rules, and other instructions. Each school owns its instructions. Schools sharing a collection centre can enter the same instructions without gaining access to each other's students. If blank, emails advise confirming the location/hours with the school before travelling. Existing school email and phone remain in the message and must be usable.
- School submission and Trusted Contact submission remain separate. One failed contact does not prevent sends to other contacts. Events displays partial submission when some succeeded; a complete failure is marked for follow-up. Existing `parent_notification_*` database fields are retained as the aggregate contact submission status/timestamp, including historical parent sends. No automatic retry worker or per-contact delivery ledger is implemented; provider acceptance is not inbox delivery.
- Verification: 172 tests in 51 files, typecheck and production build passed. Tests cover multiple separate recipients, individual opt-out, unapproved contacts, duplicate emails, changed-email consent, deletion scoping, legacy non-fallback, collection instructions and partial send failure. External email calls are mocked in automated tests; no live multi-recipient test was sent.
- A rollback-only isolated Postgres upgrade fixture verified legacy consent backfill, default-off behavior, composite school ownership, real school-admin CRUD and cross-school read/update/delete isolation. Production migration applied successfully; production currently has no stored legacy parent email to backfill, no new contacts and no opt-ins. Security advisor has no errors; the existing leaked-password warning and intentional server-only notification-subscription INFO are unchanged.
- Authenticated browser checks verified the Students editor and Collection Details settings on desktop and at 390px width, including horizontally scrolling the student table to reach the contact form. No page-wide overflow was observed. The application is running locally on port 3001; it has not been deployed.

## School assignment

Hero is the iFoundIt NFC tag product name; BYOD is the workflow. The stored `hero_laptop` classification and applied migration names are retained for compatibility.

Provision tags and import active students through the existing school process. Manual assignment supports phone pouches and student-owned or school-owned Hero-tagged laptops.

Bulk assignment uses the existing headers plus two optional classification columns:

```csv
serial,first_name,last_name,date_of_birth,home_postcode,item_kind,laptop_ownership
HEROEXAMPLE01,Alice,Example,05-01-2014,SW1A 1AA,hero_laptop,student
POUCHEXAMPLE1,Alice,Example,05-01-2014,SW1A 1AA,phone_pouch,
```

These are synthetic examples. Download an empty template at `/templates/tag-assignments.csv`.

- `date_of_birth` uses DD-MM-YYYY; supply DOB and/or postcode to disambiguate names.
- `item_kind`: `hero_laptop` or `phone_pouch`.
- BYOD laptops require `laptop_ownership`: `student` or `school`.
- Phone pouches must have blank laptop ownership.
- Missing or blank classification fields preserve the existing classification, including legacy unclassified tags.
- Duplicate serials (all occurrences), duplicate recognized headers, inactive tags, inactive students, unknown/cross-school serials, and invalid classification rows are rejected.
- Accepted rows are updated with organisation, tag ID, and active-state filters. No school-admin INSERT permission is needed. Individual failed writes are reported and not counted as assigned; valid rows may still succeed.

The student table has expandable item details listing serial, item type, ownership, and active state. A student can have multiple items. Legacy records are shown as unclassified, never assumed to be laptops or pouches.

## Finder and school notifications

The public finder API validates the serial, limits notes to 2,000 characters, checks active tag and assigned-student school ownership, and verifies Turnstile before accepting a report. It does not return student identity or item ownership publicly.

School recipients are looked up only within the tag's organisation. Unconfirmed addresses are excluded and duplicate addresses are removed. Emails include the item label and escaped finder notes, not student records.

Reserved/non-deliverable fixture domains (including `.local`, `.test`, and the example domains) are excluded even if their Supabase account is confirmed. A confirmed fixture account is not proof of a deliverable mailbox.

The event is stored before SendGrid submission. On acceptance, `notification_sent_at` records submission to the email provider; it does not prove inbox delivery. If sending fails after storage, HTTP 202 reports that the report was saved but email could not be sent, avoiding a false request failure that encourages duplicate reports. A tracking failure after email submission also returns a distinct 202 response. The school events view distinguishes unconfirmed notifications from submitted emails and rejected reports.

There is no automatic email retry worker in this change. Saved events without a confirmed submission timestamp need operational follow-up. Live production SendGrid delivery and sender/domain configuration remain separate rollout checks. Existing honeypot/time-trap/IP-throttling contracts are not implemented by these changes; Turnstile is not a substitute for those controls.

## Verification

### Opt-in parent email notifications (2026-11-12)

Update (2026-11-13): the user confirmed that the school and parent test emails arrived separately and that the received parent email had no admin portal link. Test event `df0eef21-ea23-46e8-ad28-04d454ab881e` recorded separate school and parent submission timestamps. The parent message was initially deferred by the recipient's Outlook server before receipt. The synthetic student's parent address and opt-in were restored to empty/off after submission.

Parent emails now include `organisations.contact_email` and `contact_phone` from the tag's active school. A missing/unusable contact address or phone causes the parent notification to be marked failed for follow-up without blocking the school alert. Contact details are not returned by the public finder API. Demo School still has placeholder contact details, which must be replaced with real school-approved details in Settings before another parent send. These details were not changed or invented during implementation. Updated checks: 164 tests in 50 files and typecheck passed; no new schema migration is needed.

- The Students page now exposes each student's existing `parent_email` in a separate expandable parent-notification form. An unchecked-by-default consent checkbox records the school's confirmation that the parent opted in, with a server-side timestamp. Unchecking stops future alerts; saving a blank email while off removes the stored address.
- Saves are authenticated, role-gated, and scoped by both student ID and the selected school, using the existing RLS-protected client. No role, membership, or RLS policy is changed. Existing manual student creation and CSV upserts omit parent fields, so they neither opt parents in nor erase existing settings.
- Only active, same-school assigned students with explicit consent, a consent timestamp and a valid non-reserved email qualify. School recipients remain required. Rejected challenges produce no emails.
- Parents receive a separate plain-text email containing an item label, tag reference, school contact email and phone, and instructions to contact their school. It includes no notification-recipient list, student identity, finder comments or admin portal URL. Opt-out instructions direct the parent to their school; no self-service unsubscribe page is implemented.
- Parent submission and school submission are independent. Parent failure does not undo school success; the parent's `failed` status is visible in Events. A database-tracking failure leaves the stored status pending/unconfirmed rather than falsely marked submitted. Submission timestamps are provider acceptance, not inbox delivery. There is no retry worker.
- Migration `20261112161141_parent_notification_opt_in.sql` was tested with rollback-only synthetic local database checks, then applied to production. Verified zero existing opt-ins. No live parent email or live parent consent was created during the initial implementation verification; the later authorized live test is documented above.
- `npm test`: 160 tests in 50 files passed. Typecheck and production build passed. Browser verification loaded the consent form and successfully saved the existing synthetic student with notifications still off. Production migration dry-run has no pending migrations. Security advisor has no errors; the pre-existing leaked-password warning remains.

### Production-backed finder test (2026-11-12)

- Added `school_notification_recipients`, a server-managed notification-only subscription list. It grants no account role, school membership, or portal access. RLS is enabled and browser roles have no table privileges. Email addresses are resolved from confirmed Auth accounts at send time and deduplicated with the existing school-admin recipients.
- Demo School has one notification-only subscriber: the existing confirmed `peter@ifoundit.io` account. Its global superadmin role and null organisation mapping were verified unchanged.
- Synthetic student: `HeroWorkflow TEST ONLY`, class `SYNTHETIC TEST - NOT A STUDENT`. No DOB, postcode, or parent contact was supplied.
- Synthetic tag: `HEROTEST20261112`, assigned to that student as a student-owned BYOD laptop. This is not a physical NFC serial.
- Submitted the real finder form at `http://localhost:3001/find/HEROTEST20261112` using the configured local Cloudflare test challenge. No provider or database mocks were used.
- Saved recovery event: `7fd722e7-9f84-497b-abe5-6e62327b7c67`, pending, provider submission timestamp `2026-11-12T16:08:28.369Z`. The authenticated Events page displayed `Hero laptop (student owned)` and `Submitted`.
- The user confirmed receipt of this BYOD finder email, in addition to the earlier standalone SendGrid configuration email.
- The app changes remain local, not deployed. This test does not verify production Turnstile configuration or physical NFC routing. Test records and the Demo School notification subscription remain in production for inspection. Remove the exact notification subscription to stop these additional Demo School alerts; no account-permission change is needed.
- Parent alerts were not part of this initial school-only test. The subsequent opt-in implementation and its verification are documented above.
- Verification after the notification-recipient change: `npm test` passed 140 tests in 48 files; `npx tsc --noEmit` and `npm run build` passed. The migration passed a rollback-only isolated database check, and production migration dry-run reports no pending migrations. Production checks confirmed recipient-table RLS and no anonymous/authenticated table privileges.
- Security advisor: no errors; the recipient table's no-policy INFO is intentional (server-only management, no browser grants). The existing leaked-password-protection warning remains unchanged.

Unit/route tests cover CSV compatibility and classification, scoped updates and partial failures, student item rendering, recovery-event notification states, escaped email content, confirmed recipients, tenant mismatches, invalid input, provider outages, database failures, and delivery tracking. External email and database services in these automated route tests are mocked; they send no real school notifications. The separately documented production-backed browser test above uses real services.

`supabase/tests/reconciled_portal_contract.sql` tests real school-admin UPDATE permissions, preserved legacy metadata, tenant isolation, and ownership constraints in the isolated local database, with all fixture writes rolled back. Never execute that fixture file against production.

### Verified implementation (2026-11-12)

- `npm test`: 47 files, 129 tests passed (34 additional tests since the preceding checkpoint).
- `npx tsc --noEmit` and `npm run build`: passed.
- The local rollback-only database fixture passed, including actual school-admin UPDATE behavior and classification preservation.
- A synthetic browser fixture verified expandable student details, CSV upload feedback, and no page overflow at widths 1440, 768, and 390. No production records were used in those UI fixtures.
- An authenticated browser smoke test loaded the local admin queue, Students, Tags, Events, and downloadable template. The temporary session changed only its school-context cookie and was revoked afterward; no school data or passwords were changed.
- The development server remains on port 3001. The application changes have not been deployed to production, and no schema migration was required for this application work.
