# Gemini Project State - 2026-07-03

## Snapshot

- Captured at: `2026-07-03 07:26:46 BST`
- Branch: `feat/ifoundit-marketing-funnel`
- Working tree: dirty (`22` modified, `24` untracked)
- Last commits:
  - `5f8363c feat: refine marketing funnel presentation`
  - `9e94ae1 feat: complete ifoundit schools marketing funnel`
  - `150ea01 fix: add marketing section landmarks`
  - `d9d11b9 test: tighten marketing support page coverage`
  - `0eec784 feat: add core marketing support pages`

## What Is Landed (Committed)

- Public marketing funnel foundation has been implemented and iterated across multiple commits.
- Route-level marketing expansion work is already in the branch history (home + support pages).
- Unit test coverage for marketing shell/pages has been actively tightened in recent commits.

## What Is In Progress (Uncommitted)

### Marketing UI sweep

- Extensive in-flight updates under:
  - `app/(marketing)/*`
  - `components/marketing/*`
  - `app/globals.css`
  - `tests/unit/app/marketing/*`
  - `tests/unit/components/marketing/*`
- New marketing routes present but uncommitted:
  - `/about`
  - `/privacy`
  - `/terms`

### Demo request pipeline (new, uncommitted)

- New API endpoint: `app/api/marketing/demo-request/route.ts`
- New validation module: `lib/marketing/demo-request/validation.ts`
- New admin queue page: `app/admin/demo-requests/page.tsx`
- New migration: `supabase/migrations/20260702103000_demo_requests_pipeline.sql`
- New targeted tests:
  - `tests/unit/lib/marketing.demo-request.validation.test.ts`
  - `tests/unit/lib/supabase/demo-requests-migration.test.ts`

### Governance/docs updates in tree

- `AGENTS.md` and `docs/governance/CODEX_2_4_OPERATIONAL_DOCTRINE.md` are present as uncommitted additions.
- `docs/DESIGN.md` is currently untracked and appears to define a refreshed marketing visual system.

## Risks / Cleanup Flags

- `components/marketing/Apple-Stripe Redesign files-2/` appears to include reference artifacts and `.DS_Store` files; treat as likely non-production material unless explicitly intended.
- `.playwright-mcp/` and `tmp/` are present and untracked; verify they are not staged for production commits.
- Migration + API + admin page are in-flight together; require contract verification before merge (schema, validation, and protected admin visibility).

## Verification Status

- No fresh build/typecheck/lint/test run was executed as part of this status capture.
- Current state should be treated as **in-progress** until full verification is run.

## Suggested Next Execution Focus

1. Finalize intended ship scope (marketing-only vs marketing + demo-request pipeline).
2. Remove accidental artifacts (`.DS_Store`, reference dump folders) from commit scope.
3. Run required verification gates for chosen scope (typecheck, lint, targeted unit tests, route checks).
4. Commit in coherent slices:
   - marketing UX/content slice
   - demo-request data pipeline slice
   - governance/doc updates slice
