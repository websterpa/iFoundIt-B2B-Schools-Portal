# Architecture

## Current Feature

School admin authentication and invite-based account activation

## Architectural Goal

Provide the smallest secure foundation for the school portal by establishing authenticated sessions, organisation-aware authorisation, and protected routing before building business workflows like student import or tag assignment.

## Chosen Approach

Use a Next.js App Router application with Supabase Auth for identity, a dedicated `admin_users` mapping table for role and organisation context, and route-level protection that fails closed whenever user role or tenancy cannot be proven.

This keeps the MVP architecture simple:

- Supabase handles password auth and recovery primitives
- Postgres stores tenant and role mapping
- Next.js server components and middleware enforce access boundaries
- Public finder routes remain outside the authenticated app shell

## Backend

### API Changes

Authentication foundation requires these server-side capabilities:

- sign-in handler for email/password authentication
- password setup or reset-confirmation handler for first-time access
- sign-out handler
- protected session lookup utility
- role and organisation context lookup utility

Minimal initial protected endpoints:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/setup-password` or equivalent callback-confirmation flow
- `GET /api/auth/session`

### Database Changes

The MVP source already defines the essential auth-adjacent tables:

- `organisations`
- `admin_users`

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

### Services Needed

- Supabase server client for authenticated server-side requests
- Auth service wrapper for sign-in, sign-out, and current-user lookup
- Authorisation service wrapper for role and organisation resolution

## Frontend

### Components

Minimum frontend units:

- `LoginForm`
- `SetupPasswordForm`
- `AuthStatusGate`
- `ProtectedAppShell`
- `AccessDeniedState`

### State Management

- Prefer server-first auth state derived from secure cookies and server-side session checks
- Keep client state local to forms for input values, submit status, and inline errors
- Do not introduce global client state for auth in MVP unless a proven gap appears

### Data Flow

1. User submits credentials or setup form.
2. Server validates through Supabase Auth.
3. App resolves `auth.users.id`.
4. App loads `admin_users` role and `organisation_id`.
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

- `/find/[serial]`
- future finder confirmation pages

### Auth boundary

- `/login`
- password setup and recovery routes

### Protected school boundary

- `/dashboard`
- `/students`
- `/tags`
- `/events`
- `/settings`

### Protected superadmin boundary

- `/admin`
- `/admin/tags`

## Recommended Build Order

1. App scaffold and Supabase integration
2. Login and password setup screens
3. Session and protected-route gate
4. Role and organisation lookup
5. Access-denied handling
6. Superadmin route restriction
