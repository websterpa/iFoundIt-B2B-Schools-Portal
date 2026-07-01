# Backlog

## Current Recommendation

### Status

Partially implemented foundation

### Feature

School admin authentication and invite-based account activation

### Problem

Schools cannot use any part of the portal until an authorised admin can securely access their organisation's workspace. Without a working sign-in flow tied to the correct school account, student imports, tag assignment, settings, and event review cannot happen safely.

### Why This Matters For MVP

This is the first dependency for the operational workflow. Every school-facing capability in the MVP assumes a trusted school admin session and an organisation boundary. Building this first reduces downstream rework, unlocks protected routes, and lets later features be tested in realistic tenant conditions.

### Smallest Possible Version

- iFoundIt superadmin creates a school admin account manually
- School admin receives an invite or reset-style setup link
- School admin sets a password and signs in
- Authenticated school admin reaches a protected dashboard shell
- Unauthenticated users are redirected to `/login`
- School admins can only access their own organisation context

### Acceptance Criteria

- A manually created school admin can complete first-time password setup
- A school admin can sign in with email and password
- Protected portal routes redirect unauthenticated users to `/login`
- An authenticated school admin can access only their own organisation's portal area
- A non-superadmin cannot access superadmin routes
- Failed sign-in attempts show a clear, non-sensitive error message

### Risks And Unknowns

- Invite flow details are not fully specified in the MVP source and may depend on the chosen Supabase setup
- Role storage and organisation mapping must be designed carefully to avoid cross-tenant data leaks
- Password-reset and account-invite wording needs to be clear enough for school staff with minimal onboarding

### Current Implementation Progress

- Greenfield Next.js app scaffold created
- Auth-related forms and guard helpers implemented with unit tests
- Protected route structure and middleware scaffold created
- Supabase-backed sign-in, password setup, live session resolution, and role lookup are still pending

### Next Recommended Task

Wire the auth foundation to a real Supabase project so login, password setup, and protected session handling move from placeholder scaffold to working tenant-aware authentication.

## Priority Order

### Now

1. School admin authentication and invite-based account activation
2. Superadmin school creation and role assignment
3. Protected portal shell and route gating

### Next

1. Student CSV import
2. Tag provisioning for schools
3. Manual tag assignment to students

### After

1. Bulk tag assignment by CSV
2. Public finder page
3. Found-event submission and school email notifications
4. Events log
5. Settings page
6. Dashboard summary cards

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
