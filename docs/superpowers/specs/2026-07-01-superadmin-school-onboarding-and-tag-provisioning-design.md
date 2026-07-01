# Superadmin School Onboarding And Tag Provisioning Design

## Summary

Turn the protected superadmin area at `/admin` into a minimal operational workspace that supports two linked jobs:

- create a school organisation record and store the pending school-admin contact for later invite/reset activation
- ingest a supplier-provided `.csv` file of pre-encoded iFoundIt NFC tag UIDs and assign those tags to the school's `organisation_id`

This slice does not create `auth.users` records, does not send invites, and does not let schools assign tags to students yet. It prepares clean school-owned inventory so the later school workflow can scan an attached tag and register it to a student pouch.

## Goals

- let an iFoundIt superadmin create a new school record in the portal
- record the intended school-admin contact without creating a live auth identity yet
- ingest a supplier `.csv` file containing bulk-delivered pre-encoded tag UIDs
- validate and provision those tag UIDs to one `organisation_id`
- preserve a clean inventory state where provisioned school tags exist before student assignment
- prepare for a later school-side scan-to-register workflow that links a scanned UID to a student

## Non-Goals

- do not create or mutate `auth.users` during this phase
- do not send invite, password reset, or setup emails during this phase
- do not implement school-side student import or student assignment during this phase
- do not implement the public finder submission flow during this phase
- do not accept arbitrary school-created tags outside supplier-delivered inventory

## Proven Constraints

- the current protected superadmin entry point already exists at `/admin`
- the current schema already includes `organisations`, `admin_users`, and `tags`
- `tags` rows already support `organisation_id`, `serial`, `student_id`, and `active`
- current routing and role checks fail closed and must stay that way
- auth-user creation is explicitly deferred to a later invite/reset step
- supplier inventory arrives as a `.csv` file containing tag UIDs for a school delivery

## Chosen Approach

Use a single protected `/admin` workspace with two panels:

1. school setup panel
2. tag provisioning panel

The school setup panel creates the organisation record and stores a pending school-admin contact record in app-owned metadata. The tag provisioning panel accepts a supplier `.csv` upload for a selected school, parses and validates tag UIDs, then provisions accepted rows into `tags` with the selected `organisation_id`.

This is the smallest safe operator surface because it:

- keeps school creation and inventory allocation in one place
- avoids wizard-state complexity
- avoids inventing auth identities before the invite/reset flow is designed
- preserves clear provenance from supplier delivery to school allocation

## Rejected Alternatives

### Wizard-based onboarding

A multi-step wizard would guide superadmins through school creation, contact entry, and provisioning in separate screens.

Rejected for this phase because:

- it adds UI and state-management complexity before the underlying operational workflow is proven
- it increases recovery work if a late step fails
- the phase-2 requirement is operational accuracy, not narrative UX

### Separate CRUD surfaces

Separate pages for schools, admin contacts, and tags would scale well later.

Rejected for this phase because:

- it is broader than the approved minimal scope
- it creates unnecessary navigation and coordination for an MVP operator flow
- it delays a working onboarding path

## Data Model Design

### Existing Authoritative Tables

The current schema already provides:

- `organisations` for school tenancy
- `admin_users` for active mapped portal identities
- `tags` for school-owned tag inventory

### New App-Owned Metadata Requirement

Because this phase does not create `auth.users`, we need a place to store the intended school-admin contact before activation.

Add a new table for pending school-admin onboarding metadata, for example:

- `pending_school_admins`

Responsibilities:

- store one pending contact per intended school-admin onboarding record
- link that contact to one `organisation_id`
- track whether the record is still waiting for the invite/reset step

Suggested fields:

- `id`
- `organisation_id`
- `email`
- `full_name`
- `status`
- `created_at`
- `updated_at`

Suggested status values:

- `pending_invite`
- `activated`
- `cancelled`

The `activated` transition is not implemented in this phase, but the status model should allow the later invite/reset slice to reconcile a live auth user to the pending contact record.

### Tag Inventory Contract

The `tags` table remains the authoritative inventory store.

For this phase, each provisioned row means:

- the tag exists physically
- the tag came from supplier inventory
- the tag belongs to exactly one school organisation
- the tag is not yet linked to a student unless `student_id` is later set in the school assignment workflow

Provisioned tags in this phase must therefore:

- set `organisation_id`
- set the encoded UID value in `serial`
- leave `student_id` null
- leave `active` true unless the import explicitly decides otherwise, which phase 2 does not require

## UID And CSV Contract

### Source Of Truth

The supplier-provided `.csv` file is the operational source input for tag allocation.

### Required Import Contract

The importer must support `.csv` upload and assign accepted rows to one selected `organisation_id`.

### Minimal CSV Expectations

Phase 2 should require at least one UID-bearing column.

Accepted header names may include:

- `uid`
- `UID`
- `tag_uid`
- `serial`

The importer should normalize the detected UID column into the app's canonical tag `serial` value.

### Normalisation Rules

Before validation or persistence, every imported UID should:

- trim whitespace
- convert to uppercase
- reject blank values
- reject duplicate values within the same upload

### Validation Rules

A row is valid only if:

- a UID value is present
- the UID matches the allowed tag format used by the app
- the UID is not duplicated inside the same uploaded file
- the UID is not already provisioned to another organisation
- the UID does not already exist as an active row for the target organisation

Rows already present for the target organisation should be surfaced as duplicates and skipped, not inserted again.

Rows already assigned to another organisation must be rejected clearly and never reassigned silently.

## Lifecycle Model

The intended lifecycle is:

1. supplier encodes NFC tags and delivers them with a `.csv` file of UIDs
2. superadmin creates the school organisation record
3. superadmin records the pending school-admin contact
4. superadmin uploads the supplier `.csv`
5. accepted UIDs are inserted into `tags` with the school's `organisation_id`
6. school later attaches a physical tag to a pouch
7. school later scans the tag in a protected assignment flow
8. the scanned UID resolves the existing `tags` row
9. the app links that provisioned tag to the chosen student

This means the school assignment flow never invents tag records. It only consumes existing provisioned inventory.

## UI Design

### Route

Keep `/admin` as the protected superadmin workspace.

### Panel 1: School Setup

Inputs:

- school name
- school slug
- contact email
- contact phone
- address
- pending school-admin full name
- pending school-admin email

Actions:

- create organisation
- create pending school-admin metadata row linked to the new organisation

Success output:

- organisation created confirmation
- pending admin status shown as waiting for invite/reset
- school appears immediately as a selectable provisioning target

### Panel 2: Tag Provisioning

Inputs:

- selected school organisation
- `.csv` file upload

Pre-submit review:

- detected UID column
- number of rows in file
- count of valid rows
- count of duplicate rows
- count of invalid rows

Commit action:

- insert accepted tag rows into `tags` for the selected `organisation_id`

Success output:

- imported row count
- skipped duplicate count
- invalid row count
- current provisioned inventory count for the selected school
- current unassigned inventory count for the selected school

## Protected Data Flow

### School Setup Flow

1. Superadmin opens `/admin`.
2. Role gate verifies `ifoundit_superadmin`.
3. Superadmin submits school setup form.
4. Server validates payload.
5. Server creates the `organisations` row.
6. Server creates the linked pending school-admin metadata row.
7. UI refreshes with the new school available for provisioning.

### CSV Provisioning Flow

1. Superadmin selects a school.
2. Superadmin uploads the supplier `.csv`.
3. Server or server-owned import logic parses the file.
4. Import logic detects the UID column and normalizes values.
5. Import logic classifies rows into valid, duplicate, cross-school conflict, and malformed buckets.
6. UI presents the classified results.
7. Superadmin confirms provisioning.
8. Server inserts only the accepted rows into `tags` with the chosen `organisation_id`.
9. UI returns counts and updated school inventory status.

## Error Handling

This feature must fail closed.

### Hard-Stop Failures

The action must stop without mutation if:

- the requester is not a verified superadmin
- no target organisation is selected for provisioning
- the uploaded file is not parseable as `.csv`
- no supported UID column can be detected
- the school setup payload fails required validation

### Row-Level Failures

These rows must be excluded and reported, not inserted:

- blank UID
- malformed UID
- duplicate UID in the same file
- UID already provisioned to the target organisation
- UID already provisioned to a different organisation

### Operator Messaging

Messages should be operationally clear and not misleading.

Examples:

- "Select a school before importing tags."
- "We could not find a supported UID column in this CSV."
- "12 tags were provisioned. 3 duplicate rows were skipped. 2 rows were invalid."
- "One or more tags are already allocated to another school and were not imported."

## Security And Tenancy

- only `ifoundit_superadmin` users may access this workflow
- school creation must not weaken existing route or role gating
- provisioning must always write tags to one explicit `organisation_id`
- cross-school tag reassignment must never happen silently
- no untrusted client payload may decide tenancy after validation fails
- pending school-admin contact records must not grant portal access by themselves

## Testing Strategy

This feature should be built with TDD.

### Unit Tests

Add tests for:

- UID normalization
- CSV column detection
- row classification
- duplicate detection inside one file
- duplicate detection against existing tag inventory
- cross-school conflict detection
- school setup validation

### Integration-Focused Component Or Action Tests

Add tests for:

- superadmin-only access enforcement on onboarding actions
- successful organisation plus pending-contact creation
- successful tag provisioning to a selected `organisation_id`
- partial import reporting where valid and invalid rows are mixed
- fail-closed behavior when the CSV is malformed or the school is missing

### Regression Coverage

Re-run existing auth and admin-route tests to confirm:

- superadmin gating still works
- school-admin access is still denied to `/admin`
- current login and setup flows are unaffected

## Operational Notes

- this design intentionally models the school-admin contact before auth activation
- the later invite/reset slice should reconcile a live auth user to the pending contact record rather than inventing a second source of truth
- the later school assignment slice should scan a physical tag, resolve the already-provisioned UID, and then link that tag to a student
- the public finder flow should continue to assume every public-facing tag was provisioned centrally first

## Acceptance Criteria

- a superadmin can create a school organisation from the protected admin workspace
- the workflow stores a pending school-admin contact without creating a live auth user
- a superadmin can upload a supplier `.csv` and provision accepted tag UIDs to one `organisation_id`
- duplicate, malformed, and cross-school-conflicting rows are surfaced clearly and are not inserted
- provisioned tags remain unassigned inventory until a later school-side scan-to-register workflow links them to students
- existing auth and role boundaries remain fail-closed
