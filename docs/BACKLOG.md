# Backlog

## Current Recommendation

### Status

Implemented foundation with phase-2 onboarding and provisioning design ready

### Feature

Superadmin school onboarding and CSV-driven tag provisioning

### Problem

The auth boundary and inventory contract are in place, but iFoundIt staff still cannot set up a pilot school operationally. Without a protected superadmin workflow for creating the school, storing the pending admin contact, and allocating supplier-delivered tag UIDs to that school's `organisation_id`, the pilot onboarding path remains blocked.

### Why This Matters For MVP

Pilot rollout depends on central setup before any school can use the portal. A superadmin needs to create the school, capture the intended admin contact for later invite/reset activation, and ingest the supplier `.csv` so bulk-delivered tags belong to the right organisation before school staff begin attaching and scanning them.

### Smallest Possible Version

- The protected `/admin` area supports school creation
- The workflow stores pending school-admin contact metadata without creating a live auth user
- A superadmin can upload a supplier `.csv` and provision accepted tag UIDs to one selected `organisation_id`
- Provisioned tags remain unassigned inventory until the later school-side scan-to-register workflow links them to students

### Acceptance Criteria

- A superadmin can create a school organisation from the protected admin workspace
- The workflow stores a pending school-admin contact without creating an auth user
- A supplier `.csv` can be ingested and accepted tag UIDs can be assigned to one `organisation_id`
- Duplicate, malformed, and cross-school-conflicting rows are surfaced clearly and not inserted

### Risks And Unknowns

- Hosted Supabase migration state and callback configuration have not been re-verified from this branch
- Invite/reset wording and activation reconciliation are still product and implementation details to refine
- The current server-side role lookup pattern should be revisited as admin tooling expands, even though the present flow is fail-closed in repo code

### Current Implementation Progress

- Next.js App Router scaffold, global styling, and public marketing shell are implemented
- Supabase-backed login, password setup, auth callback confirmation, live session resolution, and role lookup are implemented in repo code
- Protected dashboard and superadmin routes are implemented and fail closed on missing or invalid role state
- Supabase migrations exist for `organisations`, `admin_users`, `tags`, `found_events`, and `found_event_rejections`
- Public marketing pages for `/` and `/schools/pouch-protection` are implemented with tested placeholder contact routing
- Public finder submission handling, email notification delivery, and superadmin operational tooling are still pending

### Next Recommended Task

Implement the approved phase-2 superadmin workflow: school creation, pending school-admin metadata, and CSV-driven tag provisioning to `organisation_id`.

## Priority Order

### Now

1. Superadmin school creation and pending school-admin metadata
2. CSV-driven tag provisioning for schools
3. Student CSV import

### Next

1. Manual tag assignment to students by scan-to-register workflow
2. Public finder submission flow and school email notifications
3. Events log

### After

1. Bulk tag assignment by CSV
2. Settings page
3. Dashboard summary cards
4. Finder-facing confirmation and recovery-status surfaces

## Deferred Post-MVP Backlog

- Parent notifications
- Self-service school signup
- Arbor integration
- Bromcom integration
- SIMS integration
- MAT dashboard
- SMS notifications
- Compliance reporting
- Tag lifecycle automation
- Finder reward integration
