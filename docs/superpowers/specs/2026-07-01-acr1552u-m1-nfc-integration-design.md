# ACR1552U-M1 NFC Integration Design

## Summary

Add protected school-admin NFC scanning support to the iFoundIt B2B Schools Portal using the ACS `ACR1552U-M1` reader. The integration supports three connected workflows:

- assigning a tag to a student/pouch
- looking up a student/pouch from a scanned tag
- handling returned or recovered pouches by scanning the tag during intake

The public finder journey remains phone-tap driven and unauthenticated. NFC reader integration is only for protected school-admin workflows.

## Proven Constraints

- Reader model: `ACR1552U-M1`
- Vendor: Advanced Card Systems Ltd. (`acs.com.hk`)
- Prior validated implementation exists in `websterpa/ifoundit-partner-connect-launch-candidate`
- That implementation used `WebHID`, ACS vendor/product IDs, command-based reader interaction, and an admin NFC testing flow
- School staff environment target: Windows with mixed browsers
- Preferred architecture: browser-first direct reader integration, with fallback behavior for unsupported contexts
- Tag format: custom iFoundIt-encoded NFC tags programmed to iFoundIt specification

## Goals

- Let school staff assign provisioned tags to students by scanning the physical tag
- Let school staff scan a tag and resolve the associated student/pouch record quickly
- Let school staff scan a returned pouch during recovery handling and link it to the existing record/event flow
- Reuse one normalized NFC scan contract across all protected workflows
- Fail closed whenever device readiness, tag validity, school ownership, or assignment state cannot be proven

## Non-Goals

- Do not add NFC reader support to public finder pages
- Do not expose student data on any public page
- Do not trust client-side scan results as the source of tenancy or assignment truth
- Do not require a local helper app for MVP if the proven `WebHID` path remains valid for this reader

## Recommended Architecture

### High-Level Boundary

Add a dedicated NFC integration layer inside the protected app boundary:

- UI workflow screens call a scanner adapter
- the scanner adapter calls `WebHID`-backed reader logic
- reader logic returns a normalized decoded school tag object
- server-side actions or route handlers resolve that tag against authoritative school records

The UI must never contain reader protocol details directly. ACS device communication, command sequencing, chunk handling, and payload decoding belong in focused NFC library modules.

### Primary Transport

Use `WebHID` as the primary transport for MVP.

Reasons:

- the exact same `ACR1552U-M1` was already validated in the earlier repo
- the earlier repo used `WebHID` successfully, including explicit ACS device IDs and command-based reads
- this provides a direct browser integration without requiring local helper deployment on day one

### Fallback Behavior

Retain fallback modes for supportability, not as the default architecture:

- unsupported browser / insecure context / blocked policy: show plain operational guidance and disable scan actions
- optional simulated/test mode for admin diagnostics only
- manual entry only if explicitly designed as an admin fallback and clearly distinguished from live hardware scans

Do not default to keyboard-wedge assumptions. The prior working implementation indicates this reader should be treated as a `WebHID` device with ACS-specific command handling.

## Tag Contract

### Normalized Scan Result

Every successful scan should be converted into one normalized app-layer object:

- `payloadVersion`
- `internalTagId`
- `rawUid` when available
- `finderTarget`
- `readerModel`
- `scannedAt`
- `validationStatus`
- `rawEvidence`

Suggested shape:

```ts
type DecodedSchoolTag = {
  payloadVersion: string;
  internalTagId: string;
  rawUid: string | null;
  finderTarget: string | null;
  readerModel: "ACR1552U-M1";
  scannedAt: string;
  validationStatus: "valid" | "invalid" | "unknown_version" | "malformed";
  rawEvidence: {
    reportIds: number[];
    hexChunks: string[];
  };
};
```

### Validation Rules

The decoder must fail closed if:

- the payload version is unknown
- required fields are missing
- the payload format is malformed
- integrity checks fail
- the decoded tag cannot be matched to a provisioned school tag record
- the resolved tag belongs to another school

The decoded payload is an input to lookup. It is not itself the authoritative assignment or tenancy source.

## Protected Workflows

### 1. Assign Tag To Student

Flow:

1. Staff opens a protected assignment screen.
2. Screen displays reader readiness and compatibility status.
3. Staff initializes the reader.
4. Staff scans the physical tag.
5. App decodes and validates the iFoundIt payload.
6. Server resolves the provisioned tag record within the current school scope.
7. If the tag is valid and assignable, staff confirms the student/pouch assignment.
8. Server stores the assignment and returns the updated record.

Failure cases:

- reader unavailable
- permission denied
- tag unreadable
- invalid or unknown payload
- tag not provisioned
- tag belongs to another school
- tag already assigned and reassignment not permitted by workflow

### 2. Lookup Student/Pouch From Tag

Flow:

1. Staff opens a protected lookup or scan bar screen.
2. Staff scans the tag.
3. App decodes the tag and resolves the internal tag record.
4. App shows the school-scoped pouch/student record.

This is the operational bridge between the finder-facing physical tag and internal school records.

### 3. Recovery / Intake Handling

Flow:

1. A found or returned pouch is physically scanned by school staff.
2. The app resolves the associated tag and related recovery event.
3. Staff can mark the pouch as received, being handled, or resolved.

This uses the same scan engine as assignment and lookup, but enters through a recovery workflow screen.

## Reader Experience

### Admin Reader Diagnostics

Include a protected admin NFC testing route for rollout and support.

It should show:

- browser support for `WebHID`
- secure-context status
- permissions-policy status
- reader initialization state
- current connected device
- scan success or failure
- recent scan history

This mirrors the successful pattern from the earlier repo and gives operations a safe place to validate hardware before using production workflows.

### Reader Status UI

Every protected scan workflow should display a small status surface:

- `Not supported`
- `Ready`
- `Connected`
- `Error`

The status surface should be simple, consistent, and visible near scan actions.

## Error Handling

The NFC integration must fail closed at every boundary.

If any of the following occurs, the app must stop without mutating records:

- no reader support
- insecure context
- permissions policy blocked
- device not selected
- device disconnected
- command send failure
- read timeout
- malformed payload
- unknown payload version
- unprovisioned tag
- cross-school tag resolution
- conflicting assignment state

Errors should be operationally clear and plain-language. They should help staff recover without exposing internals or weakening protections.

Examples:

- "This browser cannot access the NFC reader. Please use a supported browser."
- "The NFC reader is not ready. Reconnect the device and try again."
- "This tag could not be validated."
- "This tag is not provisioned for your school."
- "This tag is already assigned."

## Data Model Impact

Keep the existing finder/public serial model intact, but add an internal normalized NFC contract in the app layer.

Recommended data responsibilities:

- tag provisioning records remain authoritative server-side
- assignment records remain authoritative server-side
- school ownership remains authoritative server-side
- scan result objects are transient resolution inputs plus optional audit/diagnostic evidence

Depending on existing schema evolution, the app may also need:

- optional scan log records for admin diagnostics or audit support
- fields that preserve both internal decoded tag ID and raw UID evidence

No tenancy or assignment decision should rely solely on client-provided raw scan data.

## Implementation Shape

Recommended file/module boundaries for this repo:

- `lib/nfc/types.ts`
  - NFC domain types and normalized scan result contracts
- `lib/nfc/device-manager.ts`
  - ACS `WebHID` device selection and reconnection behavior
- `lib/nfc/command-sender.ts`
  - reader command sequences
- `lib/nfc/tag-decoder.ts`
  - iFoundIt payload decode and validation
- `lib/nfc/tag-reader.ts`
  - orchestrates device read lifecycle and chunk assembly
- `components/nfc/*`
  - small UI pieces for access check, status badge, and scan actions
- protected route or section for admin NFC testing
- protected assignment / lookup / recovery screens wired to the shared scan layer

The exact filenames can follow current repo conventions, but the responsibilities should stay separated this way.

## Security Rules

- NFC support only exists in authenticated protected school-admin flows
- server-side actions must re-check school scope for every resolved tag
- public finder routes never expose student PII
- decoded client scan data must never bypass server-side tenancy checks
- unknown or malformed payloads must be rejected
- logs must avoid secrets and unnecessary student detail

## Verification Strategy

Minimum verification for MVP:

- unit tests for payload decode and validation
- unit tests for reader status decision logic
- targeted tests for assignment failure paths
- targeted tests for lookup failure paths
- protected NFC test route for live hardware validation with `ACR1552U-M1`

Recommended live validation checklist:

1. Reader is detected in supported browser
2. Reader initializes successfully
3. Valid iFoundIt tag scans and decodes
4. Provisioned tag resolves to correct school record
5. Cross-school or invalid tag fails closed
6. Assigned tag can be looked up correctly
7. Recovery scan resolves the expected record/event path

## Rollout Recommendation

Build this in stages:

1. Shared NFC library and protected admin testing route
2. Lookup-by-scan workflow
3. Assignment-by-scan workflow
4. Recovery/intake scan workflow

This order reduces risk by validating hardware integration and decode correctness before any assignment mutations are introduced.

## Final Recommendation

Adopt the validated `WebHID` architecture proven in the earlier `ifoundit-partner-connect-launch-candidate` repo, but implement it in this codebase behind a clean protected NFC adapter boundary. Keep the public finder journey unchanged, use one normalized decoded tag contract across all protected workflows, and fail closed whenever device state, payload validity, ownership, or assignment correctness cannot be proven.
