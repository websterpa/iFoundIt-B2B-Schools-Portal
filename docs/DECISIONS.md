# Decisions

## Accepted Decisions

### D-001: Separate B2B platform from the existing B2C product

Status:
Accepted

Why:
The MVP source defines the schools portal as a separate system with separate data, auth, and routing. This reduces coupling and protects school data boundaries.

### D-002: Manual school onboarding for MVP

Status:
Accepted

Why:
Pilot schools do not require self-service signup. Manual onboarding keeps scope small and operationally controllable.

### D-003: Authentication first before business workflows

Status:
Accepted

Why:
Student import, tag assignment, and event review all depend on a trusted admin session and an organisation boundary. Building auth later would create avoidable rework and security risk.

### D-004: Use Supabase Auth primitives instead of building custom invite tokens

Status:
Accepted

Why:
The simplest safe MVP path is to reuse supported password setup and reset mechanisms rather than invent a parallel token system.

### D-005: Use explicit role and organisation mapping via `admin_users`

Status:
Accepted

Why:
Authentication alone is not enough. The portal needs a durable mapping from identity to organisation and role so school access can remain tenant-scoped.

### D-006: Fail closed on missing or invalid role state

Status:
Accepted

Why:
If role or organisation mapping is unclear, the safe outcome is to deny access and direct the user to support.

### D-007: Build the auth feature in verifiable slices

Status:
Accepted

Why:
Starting from an empty workspace, the safest path was to ship a tested scaffold first, then wire live Supabase behavior in a follow-up slice. That follow-up slice is now present in repo code, which leaves operational onboarding and public finder workflows as the next incremental steps.

### D-008: Log rejected finder submissions separately from successful recovery events

Status:
Accepted

Why:
Spam or abuse attempts are operationally important, but they are not valid recovery events. A separate rejection log keeps reporting clean while preserving evidence for review.

### D-009: Keep school-marketing pages in the public routing boundary

Status:
Accepted

Why:
School-facing explainer pages such as `/schools/pouch-protection` support adoption and procurement conversations, but they must not share the authenticated app shell or imply access to school data.

### D-010: Stabilise written repo state before phase-2 feature work

Status:
Accepted

Why:
The codebase moved beyond placeholder auth scaffolding, but the planning docs lagged behind. Correcting that mismatch before superadmin onboarding and finder-submission work reduces accidental rework and keeps execution truth-based.

## Open Decisions

### O-001: First-time setup UX pattern

Options:

- invite email that lands directly in password setup
- admin-created account followed by standard password reset flow

Current direction:
Prefer the Supabase-supported reset or recovery-style flow if it produces a cleaner and more supportable MVP implementation.

### O-002: Post-login destination strategy

Options:

- always redirect to `/dashboard`
- redirect to originally requested route when safe

Current direction:
Support redirect-back only for protected internal routes and fall back to `/dashboard`.

### O-003: Superadmin storage model

Options:

- keep superadmins in the same `admin_users` table with role `ifoundit_superadmin`
- separate superadmin mapping table

Current direction:
Use the same table for MVP unless security review exposes a concrete reason to split it.

### O-004: Three.js hero integration for school marketing pages

Options:

- add `three` now and build the pouch visual in this repo
- defer 3D hero work until a reusable component and dependency choice are explicitly scoped

Current direction:
Defer Three.js integration until the component can be implemented and verified truthfully in a dedicated slice. The current repo does not yet contain the promised shared visual component.

## Rejected Decisions

### R-001: Self-service school signup in MVP

Status:
Rejected

Why:
This expands scope into marketing, trust, billing, and operations flows that are unnecessary for the pilot.

### R-002: MFA in the first auth increment

Status:
Rejected for MVP

Why:
It increases friction and implementation scope before the basic pilot workflow is proven. It can be reconsidered after pilot validation.
