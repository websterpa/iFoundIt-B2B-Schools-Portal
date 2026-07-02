# iFoundIt B2B Schools Portal

This repository contains the planning and implementation work for the iFoundIt B2B Schools Portal, a separate platform for UK secondary schools to manage NFC-tagged student phone pouches and recover them through the existing iFoundIt finder network.

## Purpose

The portal helps schools:

- register and manage tagged phone pouches
- import and maintain student records
- assign tags to students
- receive anonymous found-item notifications from the public
- track recovery events without exposing student details
- publish public school-facing information about pouch protection without exposing the authenticated admin workspace

## Product Summary

The B2B Schools Portal is distinct from the existing iFoundIt B2C Wix/Velo product. It uses a separate application, database, and authentication model. The only shared assets are the iFoundIt brand and the public finder network.

## MVP Priorities

The MVP is focused on proving the recovery workflow for pilot schools:

1. iFoundIt creates a school account.
2. A school admin signs in.
3. The school imports students.
4. iFoundIt provisions tag serials to the school.
5. The school assigns tags to students.
6. A member of the public taps a tag and notifies the school.
7. The school resolves the recovery event.

## Documentation

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — product overview, users, and outcomes
- [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md) — in-scope and out-of-scope MVP definition
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — current application boundaries and implementation shape
- [`docs/BACKLOG.md`](docs/BACKLOG.md) — prioritised backlog and next feature recommendation
- [`docs/USER_STORIES.md`](docs/USER_STORIES.md) — current user stories and acceptance criteria
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — accepted, open, and rejected technical/product decisions
- [`docs/iFoundIt_Epic4_Spam_Prevention_Addendum.md`](docs/iFoundIt_Epic4_Spam_Prevention_Addendum.md) — finder-flow anti-spam requirements for Epic 4
- [`docs/iFoundIt B2B Schools Portal — MVP Project Plan.rtf`](docs/iFoundIt%20B2B%20Schools%20Portal%20%E2%80%94%20MVP%20Project%20Plan.rtf) — original MVP source document
- [`CLAUDE.md`](CLAUDE.md) — repo-local execution and safety governance

## Current Implementation Snapshot

The repository currently includes:

- a Next.js App Router foundation with a public marketing shell
- school-admin login and password-setup pages backed by Supabase Auth clients
- an auth confirmation callback route at `/auth/confirm`
- protected dashboard and superadmin routes that fail closed when session or role state cannot be proven
- Supabase migrations for the auth/admin contract and the initial finder-flow data contract
- unit tests for auth helpers, auth forms, marketing components, and finder-contract utilities

Still pending:

- hosted Supabase verification that the expected migrations and auth flows are fully applied in the target project
- superadmin workflows for creating schools, assigning admin roles, and provisioning tags
- public finder submission handling, anti-spam enforcement, and notification delivery

## Source Of Truth

Until implementation docs evolve further, the MVP plan RTF, `CLAUDE.md`, and the Markdown files above should be treated as the product source of truth for scope and sequencing.

## Local Setup

1. Install dependencies:
   `npm install`
2. Create local environment configuration:
   `cp .env.example .env.local`
3. Populate `.env.local` with the required Supabase values for this project.
4. Start the development server:
   `npm run dev`
5. Run the test suite:
   `npm test`

## Environment

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Keep real credentials only in local environment files such as `.env.local`. Do not commit secrets to the repository.

## Supabase Tooling

Local Supabase project scaffolding now lives in [`supabase/`](supabase). Current setup status:

- `supabase init` has been run for this repository.
- `.mcp.json` is configured for the hosted project ref `uwzyilyvsjkrmzwakkwa`.
- The repository contains migrations for the auth/admin contract and the initial finder-flow contract.
- Applying or confirming those migrations in the hosted project is still a separate operational step and has not been re-verified in this branch.

Useful commands:

- `supabase login`
- `supabase link --project-ref uwzyilyvsjkrmzwakkwa`
- `supabase migration new <name>`
- `supabase db pull <name>`
- `supabase start`
- `npm run test:supabase-local`

Notes:

- `supabase link` and remote `db pull` require a Supabase access token and the remote database password.
- Local stack commands such as `supabase start` require Docker.
- `npm run test:supabase-local` verifies the onboarding migration chain against the local Supabase database by inserting and querying a temporary school, pending admin, and provisioned tags, then cleaning them up automatically.
