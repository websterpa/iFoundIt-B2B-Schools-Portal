# Design System

## Current Feature

School admin authentication and invite-based account activation

## User Journey

### Journey 1: First-time school admin setup

1. iFoundIt creates the school and school admin account.
2. The school admin receives an email with a secure account setup link.
3. The school admin opens the link on desktop or mobile.
4. The school admin confirms a new password.
5. On success, the school admin is sent to the portal dashboard shell.
6. If the link is expired or invalid, the user is shown a recovery path back to login or password reset.

### Journey 2: Returning school admin login

1. The school admin lands on `/login`.
2. The school admin enters email and password.
3. The system validates credentials.
4. On success, the user is redirected to the protected portal.
5. On failure, the user remains on the form with a generic error message and can retry.

### Journey 3: Unauthenticated access to protected pages

1. A user tries to open a protected portal route directly.
2. The system checks for a valid authenticated session.
3. If no valid session exists, the user is redirected to `/login`.
4. After successful login, the user returns to the intended destination when safe to do so.

### Journey 4: School admin attempts restricted route

1. A logged-in school admin attempts to access an iFoundIt-only route.
2. The system checks role and organisation context.
3. Access is denied.
4. The user sees a clear "not authorised" outcome or is redirected to their allowed portal area.

## Screens And Components Required

### Screen: Login page

Purpose:
Allow returning school admins to sign in safely.

Components:

- iFoundIt Schools wordmark or product heading
- Short supporting text explaining this is the school admin portal
- Email input
- Password input
- Primary sign-in button
- Secondary text link for forgot password
- Inline error message area

### Screen: First-time password setup page

Purpose:
Let invited school admins activate their account with minimal friction.

Components:

- Page heading: account setup
- Read-only email confirmation where available
- New password input
- Confirm password input
- Primary button to complete setup
- Inline validation and expired-link messaging

### Screen: Auth redirect/loading state

Purpose:
Prevent flicker while the app verifies session or token state.

Components:

- Lightweight loading panel or progress state
- Short message such as "Checking access"

### Screen: Protected dashboard shell

Purpose:
Provide a successful destination after authentication even before feature pages are complete.

Components:

- Global header with school context
- Placeholder welcome state
- Sign-out action
- Reserved navigation slots for dashboard, students, tags, events, settings

### Screen: Access denied state

Purpose:
Handle authenticated but unauthorised access safely.

Components:

- Clear heading
- Brief explanation that access is restricted
- Button back to allowed portal area

## Loading States

- Login submit:
  Disable submit button, show button-level loading text, preserve field values.
- Password setup submit:
  Disable form controls while processing and show progress feedback.
- Session check on protected routes:
  Show a lightweight shell or route-level loading state instead of blank content.
- Post-login redirect:
  Show progress message while destination is being resolved.

## Empty States

- Protected dashboard shell before other MVP modules exist:
  Show a welcome state confirming the account is active and indicating that student and tag tools will appear here.
- No organisation metadata available after login:
  Fail closed with a support message instead of rendering a broken workspace.

## Error States

- Invalid email/password:
  Show a generic error such as "We couldn't sign you in with those details."
- Expired or invalid setup link:
  Explain that the link is no longer valid and provide a route to request help or reset password.
- Missing role or organisation mapping:
  Block access and show a support-directed message.
- Network or service outage:
  Keep the user on the current screen and show retry guidance.
- Attempt to access superadmin route as school admin:
  Show restricted-access state or redirect to the school dashboard.

## Mobile Behaviour

- Forms must fit narrow mobile screens without horizontal scrolling.
- Inputs should use full-width layout with large tap targets.
- Auth pages should keep primary actions visible without requiring deep scrolling.
- Password setup and login should work comfortably from email-app deep links on mobile devices.
- Messaging should remain concise to reduce cognitive load on smaller screens.

## Accessibility Considerations

- Every form field needs a persistent text label.
- Error messages must be announced to assistive technology and associated with the relevant fields.
- Keyboard-only users must be able to complete login and password setup end to end.
- Focus should move to the first invalid field after submit errors.
- Colour must not be the only indicator of error or success.
- Buttons and links need clear accessible names.
- Loading states should communicate status textually, not only visually.
- The login experience should support password managers.

## Interaction Principles For This Feature

- Keep the language operational and reassuring for school staff.
- Avoid consumer-style growth prompts or upsell language.
- Default to the shortest secure flow possible.
- Fail closed on unclear account state, but always explain the next action the user can take.
