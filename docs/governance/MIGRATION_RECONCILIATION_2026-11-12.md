# Migration reconciliation evidence

Date: 2026-11-12. Production project: `uwzyilyvsjkrmzwakkwa`.

## Result

All 14 repository migration versions match production. The final `supabase db push --remote=uwzyilyvsjkrmzwakkwa --include-all --skip-vault --dry-run` returned `upToDate: true`, with no migrations, seeds, or roles pending. No migration-history repair command was used.

## Historical discrepancy

Four production-only migrations were fetched through the CLI into an isolated workspace and copied unchanged into the repository:

- `20260702100000_school_workspace_foundation`
- `20260702113000_finder_submission_enforcement`
- `20260702133000_dual_notifications_and_parent_contacts`
- `20260702150000_set_updated_at_search_path_hardening`

Production's `20260703160000` record contained no SQL and no name; the CLI fetched it as a two-byte empty statement. Its version does not prove that the repository's schema-completion SQL ran. The local completion file is preserved for fresh installs. The new forward verification migration explicitly checks the resulting schema and security contract instead of rewriting that historical record.

## Replay repairs

- Guard demo-request enum creation when types already exist; enable RLS and revoke browser-role grants immediately after table creation.
- Keep anonymous demo-request table writes revoked. Public submissions use the validated server API; superadmins retain SELECT access through RLS.
- Add `class_name` before creating the portal's student index. The combined chain previously failed here with `42703`.
- Make the already-executed private role helper replayable with `CREATE OR REPLACE FUNCTION`.
- Keep existing tags unclassified. Hero laptop tags require student or school ownership; pouch and unclassified tags cannot carry laptop ownership.
- Preserve production's existing `rejected` event state in the fresh-install contract.

## Local verification

An isolated local database (`ifoundit-migration-reconcile`, host port 55432) was created without touching other Docker applications. No production user records were copied.

1. Replayed production's recorded history.
2. Reproduced the combined-chain missing-class_name failure.
3. Replayed the repaired full chain from scratch successfully.
4. Restored a schema-only production public/private snapshot into the disposable database and executed exactly the six pending migrations, skipping the already-recorded empty completion version.
5. Ran `supabase/tests/reconciled_portal_contract.sql` after both fresh and upgrade paths. Fixtures proved school-admin self access, cross-school tag isolation, superadmin queue access, anonymous queue denial, multiple tags per student, valid student-owned and school-owned laptop tags, invalid ownership rejection, and rejected-event support. All fixture writes rolled back.
6. Compared fresh and upgraded public/private schema definitions with pg_dump. They were identical after excluding environment ACL defaults and dump nonces. Role grants were checked independently by the fixture assertions and production post-checks.
7. `npm test`: 42 files, 95 tests passed. `git diff --check -- supabase/migrations`: passed. No application source changed in this reconciliation task; the preceding application build remains the last build verification.

## Production execution and post-checks

The reviewed six-migration dry-run was applied successfully with `--include-all --skip-vault`:

- `20260702103000_demo_requests_pipeline`
- `20260703111500_demo_requests_superadmin_rls`
- `20260703133500_school_admin_portal_phase2_to_5`
- `20261112040816_hero_laptop_tag_metadata`
- `20261112051924_repair_admin_users_select_recursion`
- `20261112062635_verify_reconciled_portal_contract`

The forward migration assertions passed. Production post-checks confirmed both Hero columns, three ownership constraints, zero ownership-on-unclassified-tag inconsistencies, demo-request RLS enabled, no anonymous queue access, no authenticated queue writes, and no anonymous helper execution. A read-only transaction using the designated superadmin identity passed the actual queue role gate and column projection without returning request records.

No seed scripts or role files were executed, no vault changes were requested, and no existing student/tag classifications were backfilled. The portal migration's intended school-logo bucket/policies and recovery-event UPDATE policy are now installed and recorded.

The production security advisor completed with no errors and one warning: Supabase Auth leaked-password protection is disabled. This auth setting was not changed by the migration reconciliation.

## Remaining BYOD work

Migration history and the BYOD item-classification foundation are ready. Bulk CSV classification, student item details, and finder/email route integration tests were subsequently implemented and verified locally; see [the BYOD workflow](../BYOD_WORKFLOW.md) for the contract and evidence. The application changes have not been deployed. Local development uses published Turnstile test keys; real production challenge configuration and email delivery must be verified separately before rollout of the application branch. Failed-notification automatic retries remain outside this change.
