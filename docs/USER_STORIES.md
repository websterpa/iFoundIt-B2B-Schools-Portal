# User Stories

## Current Focus

Foundation stabilisation, then superadmin onboarding/tag provisioning, then public finder submission

## Core User Problem

School staff need a secure, low-friction way to access only their school's portal so they can start managing students, tags, and recoveries without exposing other schools' data.

## Current Implementation Snapshot

- Implemented in repo: school-admin login, password setup, callback confirmation, protected dashboard access, superadmin route restriction, and public school-marketing pages
- Partially implemented in repo: finder-flow data contract and rejection-log schema foundation
- Not yet implemented in repo: superadmin school-creation workflow, tag provisioning workflow, public finder submission flow, and notification delivery

## Stories

### Story 1

As an iFoundIt superadmin, I want to create a school admin account for a pilot school so that the school can start using the portal without self-service signup.

#### Acceptance criteria

- Superadmin can create a school admin account linked to one organisation
- The created admin account has the `school_admin` role
- The account cannot access data from other organisations

### Story 2

As a school admin, I want to set my password from an invite or setup flow so that I can activate my account without needing technical support.

#### Acceptance criteria

- The school admin receives a valid first-time setup path
- The school admin can create a password that satisfies the chosen auth policy
- Expired or invalid setup links fail safely with a clear recovery path

### Story 3

As a school admin, I want to sign in with email and password so that I can access my school's workspace.

#### Acceptance criteria

- Valid credentials sign the user in successfully
- Invalid credentials do not disclose whether the email exists
- The user lands on the protected portal area after successful login

### Story 4

As a school admin, I want unauthenticated users blocked from portal pages so that school data is not visible publicly.

#### Acceptance criteria

- Unauthenticated access to protected routes redirects to `/login`
- Session loss returns the user to the login flow
- Public finder routes remain accessible without login

### Story 5

As an iFoundIt superadmin, I want role-based access separation so that admin-only operational tools are restricted to iFoundIt staff.

#### Acceptance criteria

- School admins cannot access superadmin routes
- Superadmins can access school-management routes
- Role checks fail closed when role data is missing or invalid

### Story 6

As an iFoundIt operator, I want the finder-flow contract to reject obvious spam patterns so that pilot schools are not flooded with low-quality notifications.

#### Acceptance criteria

- Duplicate submissions for the same tag within the debounce window are rejected
- A submission with a filled honeypot field is rejected without exposing the rejection reason publicly
- A submission arriving under 2 seconds after page load is rejected
- More than 5 found-event submissions from one IP in 10 minutes returns `429`
- Rate-limit and honeypot rejections are logged for later review

Implementation note:
The schema and contract helpers exist in repo code, but the public submission path and enforcement flow are still pending.

### Story 7

As a school decision-maker, I want a public page explaining pouch protection so that I can understand the recovery add-on without entering the authenticated portal.

#### Acceptance criteria

- `/schools/pouch-protection` is public and does not require auth
- The page uses final approved copy without placeholder lorem ipsum
- The compatibility FAQ stays provisional until product confirmation is available
- CTA labels are accessible even while contact routing remains placeholder-only

Implementation note:
The page and its tests exist in repo code today; live contact routing remains intentionally placeholder-only.

## Not Included In This Feature

- Self-service school signup
- Social login
- MFA
- Parent or staff multi-user management
- Advanced password policies beyond platform defaults
