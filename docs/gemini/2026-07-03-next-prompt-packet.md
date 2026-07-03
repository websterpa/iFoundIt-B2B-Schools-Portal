# Gemini Next Prompt Packet - 2026-07-03

Use this packet when preparing the next Codex execution prompt for this repo.

## Mandatory Governance Header

- Active authority: `docs/governance/CODEX_2_4_OPERATIONAL_DOCTRINE.md`
- Marker required in prompt: `HVIM ACTIVE`
- Mode for next task: `STANDARD_CHANGE` (unless user explicitly changes mode)

## Current State Input

Reference first:

- `docs/gemini/2026-07-03-project-state.md`

This includes current branch, dirty-tree shape, in-progress workstreams, and verification gaps.

## Recommended Next Prompt Objective

Stabilize and finish the in-progress branch by:

1. confirming final ship scope,
2. excluding accidental artifact files from commit scope,
3. running required verification for selected scope,
4. producing commit-ready slices without crossing unrelated boundaries.

## Prompt Constraints To Include

- Enforce overlap-aware dirty-tree handling (do not revert unrelated changes).
- Maintain `(marketing)`, `(admin)`, and `(public)` architecture boundaries.
- Preserve auth/RLS fail-closed posture.
- Do not weaken tenant or admin access boundaries.
- Do not fabricate verification results; report exact commands and exact failures.

## Suggested Verification Bundle

- `npm run lint`
- `npm run typecheck` (or project equivalent)
- targeted unit tests:
  - `tests/unit/app/marketing/*`
  - `tests/unit/components/marketing/*`
  - `tests/unit/lib/marketing.demo-request.validation.test.ts`
  - `tests/unit/lib/supabase/demo-requests-migration.test.ts`
- route-level smoke pass for changed marketing pages and `/admin/demo-requests`

## Output Expectations For Codex

Require response sections:

- `## STATUS`
- `## CHANGED`
- `## WHY`
- `## FILES`
- `## VERIFY`
- `## RISKS`

No implied pass state without execution evidence.
