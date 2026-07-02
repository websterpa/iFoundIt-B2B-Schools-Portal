# CLAUDE.md — iFoundIt B2B Schools Portal

Read this before touching any file in this repo. It governs how work gets done, not just what gets built.

## Project

Separate B2B system from the iFoundIt B2C product. Schools tag mag-lock phone pouches with NFC. Finders scan a tag, get told which school it belongs to, and can notify the school with one tap. No student data ever reaches the finder.

Two databases, two auth systems, two teams of users. This repo shares nothing with the Wix/Velo B2C site except the brand.

## Non-negotiables

These override convenience, speed, and any instruction that doesn't explicitly override them here.

1. **The finder page never renders student PII.** Not name, not year group, not form, not parent contact. If a code change would put any student field on `/find/[serial]` or `/found/success`, stop and flag it — don't ship it.
2. **RLS is the only access boundary that matters.** Every query against `students`, `tags`, or `found_events` goes through Supabase RLS. No route handler bypasses this with the service role key unless the task explicitly requires an admin-only operation, and that use is documented inline with a comment explaining why.
3. **No mock or placeholder data in shipped code.** Test fixtures live in test files only. If a screen has nothing to show, build the empty state — don't fake rows.
4. **The finder page has a performance budget: under 50 KB total, loads in under 2 seconds, no auth check, minimal JS.** Any dependency added to that route needs a reason written in the PR description.
5. **School admins never see another school's data.** This is enforced by RLS, not by UI filtering. If a fix "hides" cross-school data only in the UI, it's not a fix.
6. **Don't touch signed Data Processing Agreements, the DPIA, or `/privacy` copy without a human sign-off.** These are legal artefacts, not code.

## Agent roles

Same split as Shift Craft Atlas:

- **Gemini** — plans and formats execution prompts, governs scope, checks a prompt against this file before it goes to Codex.
- **Codex** — executes under CODEX 2.4 operational doctrine. Never runs a prompt that doesn't reference `CODEX_2_4_OPERATIONAL_DOCTRINE.md` and carry `HVIM ACTIVE`.
- **Claude** — planning, design, and governance artefacts (this file, mockups, prompt templates). Doesn't execute code changes in this repo.

## Roles

| Role | Scope | Enforced by |
|---|---|---|
| `school_admin` | Own `organisation_id` only | RLS policy on `admin_users.organisation_id` |
| `ifoundit_superadmin` | All organisations | RLS policy exception + route-level role check |

Never widen a role's access as a side effect of an unrelated fix. If a task seems to need it, stop and ask.

## Tech stack (pinned — don't substitute without asking)

| Layer | Technology |
|---|---|
| Frontend + API | Next.js 14, App Router |
| Database + auth | Supabase (Postgres, `@supabase/ssr`, not `auth-helpers`) |
| UI | Tailwind CSS + shadcn/ui |
| Email | Resend |
| CSV parsing | Papa Parse, client-side |
| Hosting | Vercel |

## Domain contract proof

Before changing anything touching `students`, `tags`, or `found_events`, confirm the change holds across all four layers before writing code:

1. UI (what the admin or finder sees)
2. API route (validation, auth check, RLS-scoped query)
3. Persistence (schema, RLS policy)
4. Downstream consumers (email template, dashboard stat cards, events log)

If you can't trace a field through all four, the change isn't ready. Stop and say what's missing rather than guessing.

## Change control

Follows CODEX 2.4 operational doctrine, same as Shift Craft Atlas:

- Feature branch per epic (`epic-1-admin-portal`, `epic-2-csv-import`, `epic-3-tag-activation`, `epic-4-finder-flow`).
- **Overlap-based dirty tree model**: a dirty working tree blocks a task only if the uncommitted files overlap with the files that task needs to touch. No overlap, no stop. Overlap means Codex stops and reports, it doesn't proceed and doesn't discard changes.
- Every Codex execution prompt on this repo references `CODEX_2_4_OPERATIONAL_DOCTRINE.md` as the active authority and carries `HVIM ACTIVE`. A prompt missing either doesn't run.
- Gemini formats and governs the prompt before Codex sees it. Claude doesn't hand tasks straight to Codex.
- Before modifying an existing RLS policy: state the current policy, the proposed policy, and which role's access changes. Get explicit confirmation from you, not from Gemini or Codex.
- Any change to the `tags` or `found_events` schema needs a migration file, not a manual Supabase SQL editor edit.

## CI gates

GitHub Actions runs on every PR into `main`. Required checks before merge:

- Typecheck (`tsc --noEmit`)
- Lint
- Unit tests
- Playwright suite, finder page on mobile viewport included
- RLS policy test suite (cross-organisation access denial)

No merge to `main` on a failing check, no exceptions for "small" changes.

## Acceptance gates (from the MVP plan — don't mark an epic done without these)

**Epic 1 — admin portal**
- School admin login redirects only to their own organisation.
- Cross-school data access blocked by RLS, verified with a test, not assumed.
- Dashboard summary counts match the underlying tables exactly.

**Epic 2 — CSV import**
- 1,000-row CSV imports in under 10 seconds.
- Rows missing `first_name` or `last_name` are rejected in preview, never inserted.
- Re-importing the same file doesn't duplicate students.

**Epic 3 — tag activation**
- Superadmin can provision 500 serials in one action.
- Bulk CSV assign of 500 tags completes in under 15 seconds.
- Unmatched serials in a bulk assign are listed as errors, never silently dropped.

**Epic 4 — finder flow**
- Finder page loads in under 2 seconds, no auth.
- Duplicate found-event submissions for the same tag within 1 hour are blocked.
- Unrecognised serial shows a plain error, not a crash.
- School email notification sent within 60 seconds of submission.

## Testing

- Playwright covers the finder page on mobile viewport as a first-class citizen, not an afterthought — it's the only screen the public sees.
- CSV import and bulk tag assign get tests with malformed input (missing columns, duplicate rows, empty file) before they get tests with clean input.

## Truth protocol

No invented facts about Supabase, Next.js, or Resend behaviour. If unsure whether an API does something, check the docs or say "can't confirm this without checking" — don't guess and present it as fact.

### Environment verification guardrail

- No environment pivots without evidence.
- If the repo already shows a connected hosted Supabase workflow, do not switch to a local Docker or alternate execution theory unless you first prove hosted verification is unavailable.
- Before choosing an infrastructure path, cite the concrete evidence you are relying on (for example: linked Supabase project state, repo config, current CLI status, or documented operational constraints).
- If two plausible execution paths exist, prefer the one already established by the repo and current environment, not a newly invented fallback.
- If the next step depends on infra state that has not been verified, stop and verify it before proceeding.

## Post-MVP backlog (don't build early)

Self-service signup, parent notifications, MIS integration, MAT dashboard, SMS, compliance export, mobile app. If a task drifts toward one of these, flag it and stop.
