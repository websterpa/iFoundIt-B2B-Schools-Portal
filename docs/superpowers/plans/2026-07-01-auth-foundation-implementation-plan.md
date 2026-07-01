# Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the smallest secure authentication foundation for the iFoundIt B2B Schools Portal so school admins can activate accounts, sign in, and access only their organisation-scoped portal shell.

**Architecture:** Use a Next.js App Router app with Supabase Auth for identity, server-side auth utilities for session resolution, and an `admin_users` mapping table for role and organisation checks. Protected school and superadmin areas must fail closed when session, role, or organisation context is missing.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, Supabase Auth, Supabase Postgres, Vitest, Testing Library

---

## File Structure

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/login/page.tsx`
- Create: `app/setup-password/page.tsx`
- Create: `app/dashboard/page.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/unauthorised/page.tsx`
- Create: `app/api/auth/session/route.ts`
- Create: `components/auth/login-form.tsx`
- Create: `components/auth/setup-password-form.tsx`
- Create: `components/auth/sign-out-button.tsx`
- Create: `components/layout/protected-app-shell.tsx`
- Create: `lib/env.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/auth/get-session-user.ts`
- Create: `lib/auth/get-admin-context.ts`
- Create: `lib/auth/require-auth.ts`
- Create: `lib/auth/require-role.ts`
- Create: `lib/types/auth.ts`
- Create: `middleware.ts`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `tests/unit/lib/auth/get-admin-context.test.ts`
- Create: `tests/unit/lib/auth/require-role.test.ts`
- Create: `tests/unit/components/auth/login-form.test.tsx`
- Create: `tests/unit/components/auth/setup-password-form.test.tsx`

### Task 1: Scaffold the app and test harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Write the failing test for environment loading**

```typescript
import { describe, expect, it } from 'vitest'

describe('env example', () => {
  it('documents the required auth environment variables', async () => {
    const fs = await import('node:fs/promises')
    const content = await fs.readFile('.env.example', 'utf8')

    expect(content).toContain('NEXT_PUBLIC_SUPABASE_URL=')
    expect(content).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY=')
    expect(content).toContain('SUPABASE_SERVICE_ROLE_KEY=')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/lib/env.example.test.ts`
Expected: FAIL because `.env.example` and test harness do not exist yet

- [ ] **Step 3: Write minimal project scaffold**

```json
{
  "name": "ifoundit-b2b-schools-portal",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest"
  },
  "dependencies": {
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.49.8",
    "next": "^14.2.30",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^22.12.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8"
  }
}
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/lib/env.example.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.mjs .gitignore .env.example vitest.config.ts vitest.setup.ts tests/unit/lib/env.example.test.ts
git commit -m "chore: scaffold auth foundation app"
```

### Task 2: Add auth domain types and admin context resolver

**Files:**
- Create: `lib/types/auth.ts`
- Create: `lib/auth/get-admin-context.ts`
- Test: `tests/unit/lib/auth/get-admin-context.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest'
import { getAdminContext } from '@/lib/auth/get-admin-context'

describe('getAdminContext', () => {
  it('returns organisation and role for a valid admin user', async () => {
    const db = {
      loadAdminUser: async (userId: string) => ({
        id: userId,
        organisationId: 'org-123',
        role: 'school_admin'
      })
    }

    await expect(getAdminContext('user-123', db)).resolves.toEqual({
      id: 'user-123',
      organisationId: 'org-123',
      role: 'school_admin'
    })
  })

  it('returns null when no admin mapping exists', async () => {
    const db = {
      loadAdminUser: async () => null
    }

    await expect(getAdminContext('missing-user', db)).resolves.toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/lib/auth/get-admin-context.test.ts`
Expected: FAIL because `getAdminContext` does not exist

- [ ] **Step 3: Write minimal implementation**

```typescript
export type AdminRole = 'school_admin' | 'ifoundit_superadmin'

export type AdminContext = {
  id: string
  organisationId: string | null
  role: AdminRole
}

type AdminLookup = {
  loadAdminUser: (userId: string) => Promise<AdminContext | null>
}

export async function getAdminContext(
  userId: string,
  lookup: AdminLookup
): Promise<AdminContext | null> {
  return lookup.loadAdminUser(userId)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/lib/auth/get-admin-context.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/types/auth.ts lib/auth/get-admin-context.ts tests/unit/lib/auth/get-admin-context.test.ts
git commit -m "feat: add admin context resolver"
```

### Task 3: Add role guard logic that fails closed

**Files:**
- Create: `lib/auth/require-role.ts`
- Test: `tests/unit/lib/auth/require-role.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest'
import { requireRole } from '@/lib/auth/require-role'

describe('requireRole', () => {
  it('allows a matching role', () => {
    expect(
      requireRole(
        { id: 'user-1', organisationId: 'org-1', role: 'school_admin' },
        ['school_admin']
      )
    ).toBe(true)
  })

  it('denies access when context is missing', () => {
    expect(requireRole(null, ['school_admin'])).toBe(false)
  })

  it('denies access when role is not allowed', () => {
    expect(
      requireRole(
        { id: 'user-1', organisationId: null, role: 'ifoundit_superadmin' },
        ['school_admin']
      )
    ).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/lib/auth/require-role.test.ts`
Expected: FAIL because `requireRole` does not exist

- [ ] **Step 3: Write minimal implementation**

```typescript
import type { AdminContext, AdminRole } from '@/lib/types/auth'

export function requireRole(
  context: AdminContext | null,
  allowedRoles: AdminRole[]
): boolean {
  if (!context) return false
  return allowedRoles.includes(context.role)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/lib/auth/require-role.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/auth/require-role.ts tests/unit/lib/auth/require-role.test.ts
git commit -m "feat: add role guard helper"
```

### Task 4: Build the login form UI with loading and generic errors

**Files:**
- Create: `components/auth/login-form.tsx`
- Create: `app/login/page.tsx`
- Test: `tests/unit/components/auth/login-form.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/components/auth/login-form'

describe('LoginForm', () => {
  it('submits email and password through the provided action', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue({ ok: true })

    render(<LoginForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'admin@school.org')
    await user.type(screen.getByLabelText(/password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'admin@school.org',
      password: 'Password123!'
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/components/auth/login-form.test.tsx`
Expected: FAIL because `LoginForm` does not exist

- [ ] **Step 3: Write minimal implementation**

```tsx
'use client'

import { useState } from 'react'

type LoginPayload = {
  email: string
  password: string
}

type LoginFormProps = {
  onSubmit: (payload: LoginPayload) => Promise<{ ok: boolean; message?: string }>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await onSubmit({ email, password })

    if (!result.ok) {
      setError(result.message ?? "We couldn't sign you in with those details.")
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/components/auth/login-form.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/auth/login-form.tsx app/login/page.tsx tests/unit/components/auth/login-form.test.tsx
git commit -m "feat: add school admin login form"
```

### Task 5: Build the password setup form UI

**Files:**
- Create: `components/auth/setup-password-form.tsx`
- Create: `app/setup-password/page.tsx`
- Test: `tests/unit/components/auth/setup-password-form.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SetupPasswordForm } from '@/components/auth/setup-password-form'

describe('SetupPasswordForm', () => {
  it('rejects mismatched passwords before submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<SetupPasswordForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/new password/i), 'Password123!')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password456!')
    await user.click(screen.getByRole('button', { name: /complete setup/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Passwords must match.')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/components/auth/setup-password-form.test.tsx`
Expected: FAIL because `SetupPasswordForm` does not exist

- [ ] **Step 3: Write minimal implementation**

```tsx
'use client'

import { useState } from 'react'

type SetupPasswordFormProps = {
  onSubmit: (password: string) => Promise<{ ok: boolean; message?: string }>
}

export function SetupPasswordForm({ onSubmit }: SetupPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords must match.')
      return
    }

    setLoading(true)
    setError('')

    const result = await onSubmit(password)

    if (!result.ok) {
      setError(result.message ?? 'This setup link is no longer valid.')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="password">New password</label>
      <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <label htmlFor="confirm-password">Confirm password</label>
      <input
        id="confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? 'Completing setup...' : 'Complete setup'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/components/auth/setup-password-form.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/auth/setup-password-form.tsx app/setup-password/page.tsx tests/unit/components/auth/setup-password-form.test.tsx
git commit -m "feat: add account setup form"
```

### Task 6: Add protected routes and portal shell

**Files:**
- Create: `components/layout/protected-app-shell.tsx`
- Create: `app/dashboard/page.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/unauthorised/page.tsx`
- Create: `lib/auth/require-auth.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Write the failing test for auth protection**

```typescript
import { describe, expect, it } from 'vitest'
import { requireAuth } from '@/lib/auth/require-auth'

describe('requireAuth', () => {
  it('returns false when there is no authenticated user id', () => {
    expect(requireAuth(null)).toBe(false)
  })

  it('returns true when a user id is present', () => {
    expect(requireAuth('user-123')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/lib/auth/require-auth.test.ts`
Expected: FAIL because `requireAuth` does not exist

- [ ] **Step 3: Write minimal implementation**

```typescript
export function requireAuth(userId: string | null): boolean {
  return Boolean(userId)
}
```

```tsx
type ProtectedAppShellProps = {
  schoolName: string
  children: React.ReactNode
}

export function ProtectedAppShell({ schoolName, children }: ProtectedAppShellProps) {
  return (
    <div>
      <header>
        <h1>{schoolName}</h1>
        <nav aria-label="Primary">
          <a href="/dashboard">Dashboard</a>
          <a href="/students">Students</a>
          <a href="/tags">Tags</a>
          <a href="/events">Events</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/lib/auth/require-auth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/layout/protected-app-shell.tsx app/dashboard/page.tsx app/admin/page.tsx app/unauthorised/page.tsx lib/auth/require-auth.ts middleware.ts tests/unit/lib/auth/require-auth.test.ts
git commit -m "feat: add protected portal shell"
```

### Task 7: Wire the session endpoint and server-side auth utilities

**Files:**
- Create: `lib/env.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/auth/get-session-user.ts`
- Create: `app/api/auth/session/route.ts`
- Create: `components/auth/sign-out-button.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest'
import { readPublicEnv } from '@/lib/env'

describe('readPublicEnv', () => {
  it('returns the public Supabase config when present', () => {
    const value = readPublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key'
    })

    expect(value).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key'
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/lib/env.test.ts`
Expected: FAIL because `readPublicEnv` does not exist

- [ ] **Step 3: Write minimal implementation**

```typescript
type PublicEnvInput = {
  NEXT_PUBLIC_SUPABASE_URL?: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
}

export function readPublicEnv(input: PublicEnvInput) {
  if (!input.NEXT_PUBLIC_SUPABASE_URL || !input.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing public Supabase environment configuration.')
  }

  return {
    supabaseUrl: input.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: input.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/unit/lib/env.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/env.ts lib/supabase/client.ts lib/supabase/server.ts lib/auth/get-session-user.ts app/api/auth/session/route.ts components/auth/sign-out-button.tsx tests/unit/lib/env.test.ts
git commit -m "feat: wire auth session utilities"
```

## Self-Review

- Spec coverage:
  - login UI, setup password UI, protected routing, role checks, and auth environment configuration are covered
  - superadmin route enforcement is included in role-guard and protected-shell tasks
  - callback URL configuration is noted in architecture but not implemented in code here because it depends on Supabase dashboard configuration
- Placeholder scan:
  - no `TODO` or `TBD` placeholders remain in the plan
- Type consistency:
  - `AdminContext`, `AdminRole`, `getAdminContext`, `requireRole`, and `requireAuth` naming is consistent across tasks

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-01-auth-foundation-implementation-plan.md`.

Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints
