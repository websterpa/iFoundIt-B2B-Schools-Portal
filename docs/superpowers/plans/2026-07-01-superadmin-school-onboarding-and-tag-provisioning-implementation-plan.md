# Superadmin School Onboarding And Tag Provisioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/admin` into a protected superadmin workspace that can create a school plus pending admin contact, preview a supplier CSV of tag UIDs, and provision only accepted tags to one organisation.

**Architecture:** Keep route gating in `app/admin/page.tsx`, move onboarding rules into testable `lib/admin/onboarding/*` helpers, and use a single server-owned workflow for create/preview/commit. Preview results should be signed into a short-lived token so the second-step commit can fail closed without trusting browser-mutated counts or rows.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Supabase, Vitest, Testing Library

---

### Task 1: Add the onboarding schema contract

**Files:**
- Create: `supabase/migrations/<timestamp>_superadmin_school_onboarding_phase2.sql`
- Test: verification via `npx tsc --noEmit` and `npm test`

- [ ] **Step 1: Add the pending admin table and policies**

```sql
create table if not exists public.pending_school_admins (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  email text not null,
  full_name text not null,
  status text not null default 'pending_invite',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint pending_school_admins_status_check
    check (status in ('pending_invite', 'activated', 'cancelled'))
);

create unique index if not exists pending_school_admins_org_email_idx
  on public.pending_school_admins (organisation_id, lower(email));

alter table public.pending_school_admins enable row level security;
revoke all on table public.pending_school_admins from anon, authenticated;
grant select, insert, update on table public.pending_school_admins to authenticated;
```

- [ ] **Step 2: Add superadmin-only access rules**

```sql
drop policy if exists pending_school_admins_select_superadmin on public.pending_school_admins;
create policy pending_school_admins_select_superadmin
on public.pending_school_admins
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and current_admin.role = 'ifoundit_superadmin'
  )
);

drop policy if exists pending_school_admins_insert_superadmin on public.pending_school_admins;
create policy pending_school_admins_insert_superadmin
on public.pending_school_admins
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and current_admin.role = 'ifoundit_superadmin'
  )
);
```

- [ ] **Step 3: Verify the repo still typechecks after the schema addition**

Run: `npx tsc --noEmit`
Expected: PASS with no TypeScript errors.

### Task 2: Build the pure onboarding and CSV rules with tests first

**Files:**
- Create: `lib/admin/onboarding/contracts.ts`
- Create: `lib/admin/onboarding/csv.ts`
- Create: `lib/admin/onboarding/validation.ts`
- Create: `lib/admin/onboarding/preview-token.ts`
- Test: `tests/unit/lib/admin/onboarding/csv.test.ts`
- Test: `tests/unit/lib/admin/onboarding/validation.test.ts`
- Test: `tests/unit/lib/admin/onboarding/preview-token.test.ts`

- [ ] **Step 1: Write the failing tests for normalisation, detection, classification, and validation**

```ts
expect(normalizeTagSerial(' ab12cd34 ')).toBe('AB12CD34')
expect(detectUidColumn(['Name', 'UID'])).toEqual({ header: 'UID', index: 1 })
expect(classifyProvisioningRows([...], existingTags, 'org-1').summary).toEqual({
  totalRows: 4,
  validRows: 1,
  duplicateRows: 1,
  invalidRows: 1,
  conflictRows: 1
})
expect(validateSchoolSetupInput({ slug: 'Bad Slug' }).ok).toBe(false)
```

- [ ] **Step 2: Run the new unit files to prove the helpers do not exist yet**

Run: `npm test -- tests/unit/lib/admin/onboarding/csv.test.ts tests/unit/lib/admin/onboarding/validation.test.ts tests/unit/lib/admin/onboarding/preview-token.test.ts`
Expected: FAIL with missing module or missing export errors.

- [ ] **Step 3: Implement the pure contracts and helper functions**

```ts
export const TAG_UID_COLUMN_CANDIDATES = ['uid', 'tag_uid', 'serial'] as const
export const PENDING_SCHOOL_ADMIN_STATUSES = ['pending_invite', 'activated', 'cancelled'] as const

export function normalizeTagSerial(value: string) {
  const serial = value.trim().toUpperCase()
  return /^[A-Z0-9]{8,}$/.test(serial) ? serial : null
}

export function detectUidColumn(headers: string[]) {
  const index = headers.findIndex((header) =>
    TAG_UID_COLUMN_CANDIDATES.includes(header.trim().toLowerCase() as never)
  )
  return index >= 0 ? { header: headers[index], index } : null
}
```

- [ ] **Step 4: Implement a signed preview token for the two-step import**

```ts
export function signProvisioningPreview(payload: ProvisioningPreviewTokenPayload) {
  const json = JSON.stringify(payload)
  const body = Buffer.from(json, 'utf8').toString('base64url')
  const signature = createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${signature}`
}

export function verifyProvisioningPreview(token: string) {
  // decode, compare signature, reject expired payloads, return null on mismatch
}
```

- [ ] **Step 5: Re-run the helper tests**

Run: `npm test -- tests/unit/lib/admin/onboarding/csv.test.ts tests/unit/lib/admin/onboarding/validation.test.ts tests/unit/lib/admin/onboarding/preview-token.test.ts`
Expected: PASS.

### Task 3: Add the server-owned onboarding workflows

**Files:**
- Create: `lib/admin/onboarding/service.ts`
- Create: `app/admin/actions.ts`
- Test: `tests/unit/lib/admin/onboarding/service.test.ts`

- [ ] **Step 1: Write the failing workflow tests**

```ts
await expect(
  createSchoolWithPendingAdmin(input, depsForNonSuperadmin)
).rejects.toThrow(/superadmin/i)

await expect(
  previewTagProvisioning({ organisationId: '', csvText: 'uid\nABC12345' }, deps)
).rejects.toThrow(/select a school/i)

expect(result.summary.validRows).toBe(2)
expect(result.summary.conflictRows).toBe(1)
```

- [ ] **Step 2: Run the workflow tests to confirm the service is not implemented yet**

Run: `npm test -- tests/unit/lib/admin/onboarding/service.test.ts`
Expected: FAIL with missing module or missing export errors.

- [ ] **Step 3: Implement guarded organisation creation and pending contact persistence**

```ts
export async function createSchoolWithPendingAdmin(input: SchoolSetupInput, deps: ServiceDeps) {
  await assertSuperadmin(input.actorUserId, deps)
  const validated = validateSchoolSetupInput(input)
  if (!validated.ok) {
    throw new Error(validated.message)
  }

  const organisation = await deps.insertOrganisation(validated.value.organisation)
  const pendingAdmin = await deps.insertPendingAdmin({
    organisationId: organisation.id,
    fullName: validated.value.pendingAdminFullName,
    email: validated.value.pendingAdminEmail,
    status: 'pending_invite'
  })

  return { organisation, pendingAdmin }
}
```

- [ ] **Step 4: Implement preview and commit workflows that revalidate on commit**

```ts
export async function previewTagProvisioning(input: PreviewInput, deps: ServiceDeps) {
  await assertSuperadmin(input.actorUserId, deps)
  const rows = parseProvisioningCsv(input.csvText)
  const existing = await deps.listTagsBySerial(rows.normalizedSerials)
  const classification = classifyProvisioningRows(rows.rows, existing, input.organisationId)

  return {
    ...classification,
    previewToken: signProvisioningPreview({
      organisationId: input.organisationId,
      acceptedSerials: classification.acceptedSerials,
      generatedAt: new Date().toISOString()
    })
  }
}

export async function commitTagProvisioning(input: CommitInput, deps: ServiceDeps) {
  await assertSuperadmin(input.actorUserId, deps)
  const preview = verifyProvisioningPreview(input.previewToken)
  if (!preview || preview.organisationId !== input.organisationId) {
    throw new Error('Preview expired. Upload the CSV again.')
  }

  // re-check current inventory before insert and skip rows that are now duplicates/conflicts
}
```

- [ ] **Step 5: Re-run the workflow tests**

Run: `npm test -- tests/unit/lib/admin/onboarding/service.test.ts`
Expected: PASS.

### Task 4: Ship the `/admin` workspace and regression coverage

**Files:**
- Create: `components/admin/superadmin-onboarding-workspace.tsx`
- Modify: `app/admin/page.tsx`
- Test: `tests/unit/components/admin/superadmin-onboarding-workspace.test.tsx`
- Test: `tests/unit/lib/auth/resolve-portal-path.test.ts`
- Test: `tests/unit/lib/auth/require-role.test.ts`

- [ ] **Step 1: Write the failing admin workspace UI test**

```tsx
render(
  <SuperadminOnboardingWorkspace
    schools={[{ id: 'org-1', name: 'School One', slug: 'school-one' }]}
    onCreateSchool={vi.fn()}
    onPreviewProvisioning={vi.fn()}
    onCommitProvisioning={vi.fn()}
  />
)

expect(screen.getByRole('heading', { name: /school setup/i })).toBeInTheDocument()
expect(screen.getByLabelText(/csv file/i)).toBeInTheDocument()
```

- [ ] **Step 2: Run the admin workspace test to confirm it fails first**

Run: `npm test -- tests/unit/components/admin/superadmin-onboarding-workspace.test.tsx`
Expected: FAIL with missing component errors.

- [ ] **Step 3: Replace the `/admin` placeholder with the protected operational workspace**

```tsx
return (
  <ProtectedAppShell schoolName="iFoundIt superadmin">
    <SuperadminOnboardingWorkspace
      schools={schools}
      inventorySnapshots={inventorySnapshots}
      createSchoolAction={createSchoolAction}
      previewProvisioningAction={previewProvisioningAction}
      commitProvisioningAction={commitProvisioningAction}
    />
  </ProtectedAppShell>
)
```

- [ ] **Step 4: Build the client component with explicit operator feedback**

```tsx
<section aria-labelledby="school-setup-heading">
  <h2 id="school-setup-heading">School setup</h2>
  <form action={handleCreateSchool}>...</form>
</section>

<section aria-labelledby="tag-provisioning-heading">
  <h2 id="tag-provisioning-heading">Tag provisioning</h2>
  <form action={handlePreviewProvisioning}>...</form>
  {preview ? <button type="button" onClick={handleCommit}>Provision accepted tags</button> : null}
</section>
```

- [ ] **Step 5: Run focused tests, then the full suite, then the production build**

Run: `npm test -- tests/unit/components/admin/superadmin-onboarding-workspace.test.tsx tests/unit/lib/admin/onboarding/csv.test.ts tests/unit/lib/admin/onboarding/validation.test.ts tests/unit/lib/admin/onboarding/preview-token.test.ts tests/unit/lib/admin/onboarding/service.test.ts tests/unit/lib/auth/get-admin-context.test.ts tests/unit/lib/auth/require-role.test.ts tests/unit/lib/auth/resolve-portal-path.test.ts`
Expected: PASS.

Run: `npm test`
Expected: PASS.

Run: `npx tsc --noEmit`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

## Self-Review

### Spec Coverage

- school creation plus pending admin contact: Task 3 and Task 4
- CSV UID detection, normalisation, duplicate/conflict handling: Task 2 and Task 3
- protected `/admin` superadmin-only workspace: Task 3 and Task 4
- fail-closed commit path with clear messaging: Task 3 and Task 4
- regression coverage for auth and admin routing: Task 4

### Placeholder Scan

No `TBD`, `TODO`, or “implement later” placeholders remain. Each task names exact files, helper signatures, and verification commands.

### Type Consistency

The plan keeps one naming set throughout:
- `createSchoolWithPendingAdmin`
- `previewTagProvisioning`
- `commitTagProvisioning`
- `signProvisioningPreview`
- `verifyProvisioningPreview`

Plan complete and saved to `docs/superpowers/plans/2026-07-01-superadmin-school-onboarding-and-tag-provisioning-implementation-plan.md`.

Execution choice already implied by the request: inline execution in this session using `superpowers:executing-plans`.
