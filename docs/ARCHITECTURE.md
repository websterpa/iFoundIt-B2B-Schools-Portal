# Architecture

## Current Feature

Implemented auth foundation, public school marketing pages, and initial finder-flow data contract

## Architectural Goal

Provide the smallest secure foundation for the school portal by establishing authenticated sessions, organisation-aware authorisation, and protected routing before building business workflows like student import or tag assignment.

## Chosen Approach

Use a Next.js App Router application with Supabase Auth for identity, a dedicated `admin_users` mapping table for role and organisation context, and route-level protection that fails closed whenever user role or tenancy cannot be proven.

This keeps the MVP architecture simple:

- Supabase handles password auth and recovery primitives
- Postgres stores tenant and role mapping
- Next.js server components and middleware enforce access boundaries
- Public finder routes remain outside the authenticated app shell
- Public school-marketing routes remain outside the authenticated app shell

## Backend

### API Changes

The current auth foundation exposes these in-repo capabilities:

- browser-side sign-in on `/login` using the Supabase browser client
- browser-side password setup on `/setup-password` using the Supabase browser client
- auth callback confirmation at `GET /auth/confirm`
- sign-out from the protected app shell using the Supabase browser client
- protected session lookup at `GET /api/auth/session`
- role and organisation context lookup through server-side helpers on protected pages

Current route and endpoint surface:

- `GET /auth/confirm`
- `GET /api/auth/session`
- `/login`
- `/setup-password`
- `/dashboard`
- `/admin`
- `/unauthorised`

### Database Changes

The MVP source already defines the essential auth-adjacent tables:

- `organisations`
- `admin_users`

The finder-flow contract now also requires:

- `tags`
- `found_events`
- `found_event_rejections`

For this feature, the required data contract is:

- one `auth.users` record per admin user
- one `admin_users` row linked to that auth user
- each `admin_users` row must contain:
  - `id`
  - `organisation_id`
  - `role`

Recommended constraints:

- `organisation_id` is required for `school_admin`
- `role` is constrained to known values
- superadmin users may have elevated cross-tenant access through role, not through weakened school policies

### Services In Use

- Supabase server client for authenticated server-side requests
- Supabase browser client for sign-in, password setup, and sign-out
- Supabase service-role client for server-side organisation and role lookups once session identity is known
- Auth helper utilities for session identity, role checks, organisation checks, and safe route resolution

## Frontend

### Components

Minimum frontend units:

- `LoginForm`
- `SetupPasswordForm`
- `ProtectedAppShell`
- `SignOutButton`
- `MarketingShell`
- `PouchProtectionPageContent`

### State Management

- Prefer server-first auth state derived from secure cookies and server-side session checks
- Keep client state local to forms for input values, submit status, and inline errors
- Do not introduce global client state for auth in MVP unless a proven gap appears

### Data Flow

1. User submits credentials or setup form.
2. Supabase Auth validates through the browser client.
3. Server-side code resolves `auth.users.id` from the authenticated session cookies.
4. Protected pages or the session endpoint load the matching `admin_users` role and `organisation_id`.
5. If role and organisation are valid, protected routes render.
6. If role or organisation cannot be validated, access is denied.

## Infrastructure

### Environment Variables

Expected minimum environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional but likely needed later:

- `RESEND_API_KEY`

### Deployment Impact

- Middleware or server-side auth checks must run in the deployed environment consistently
- Auth callback and reset URLs must be configured for the production domain `schools.ifoundit.io`
- Pilot environments should use separate Supabase projects or at least isolated config values

## Security

### Authentication

- Email/password only for MVP
- First-time access should use Supabase-supported secure link flow rather than home-grown invite tokens
- Session cookies should be managed using supported SSR auth patterns

### Permissions

- Role checks must occur in addition to login checks
- School admins must never access another organisation's records
- Superadmin privileges must be explicit and narrow
- Missing role mapping must deny access by default

### Data Protection

- Public routes must never query or render student PII unless required for internal server-side notification handling
- School-facing routes should only expose organisation-scoped data
- Avoid logging secrets, reset tokens, or sensitive student details

## Simplest MVP Architecture Boundary

### Public boundary

- `/`
- `/schools/pouch-protection`
- `/find/[serial]`
- future finder confirmation pages

### Auth boundary

- `/login`
- `/setup-password`
- `/auth/confirm`

### Protected school boundary

- `/dashboard`
- `/students`
- `/tags`
- `/events`
- `/settings`

Current protected app shell navigation points at these future school routes even though they are not implemented yet.

### Protected superadmin boundary

- `/admin`
- `/admin/tags`

## Recommended Build Order

Completed foundation slices:

1. App scaffold and Supabase integration
2. Login and password setup screens
3. Session and protected-route gate
4. Role and organisation lookup
5. Access-denied handling
6. Superadmin route restriction
7. Finder-flow schema and anti-spam contract foundation
8. Public school marketing surfaces

Next slices:

9. Superadmin school creation and admin mapping
10. Tag provisioning for pilot schools
11. Student CSV import and manual exceptions flow
12. Public finder submission handling, anti-spam enforcement, and notification delivery
13. Events log, settings, and dashboard summaries
