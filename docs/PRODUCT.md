# Product Overview

## Product

iFoundIt B2B Schools Portal is a dedicated portal for UK secondary schools using NFC-tagged student phone pouches. It allows school staff to manage tagged assets and receive safe, privacy-preserving recovery notifications when a lost pouch is found by a member of the public.

## Core Problem

Phone pouches used under school device-locking policies are visually identical. When one is lost outside school, a finder has no reliable way to identify the owning school or return it without exposing student details.

## Users

### Primary users

- School administrators responsible for student data and pouch allocation
- iFoundIt superadmins responsible for onboarding schools and provisioning tags

### Secondary users

- Members of the public who find a pouch and want to report it

## Product Goals

- Make school-owned pouch recovery possible in real-world public settings
- Minimise admin effort for schools adopting the system
- Protect student privacy by never exposing student identity on public pages
- Provide a simple operational model that can support pilot-school rollout quickly

## Success Criteria

- A school can be onboarded and ready to use the portal with provisioned tags in one working session
- A school admin can import students and assign tags without manual record-by-record setup
- A public finder can notify a school in under a minute without needing an account
- A school receives and tracks recovery notifications reliably

## Product Principles

- Privacy first: no student PII on public finder pages
- Operational simplicity: optimise for quick school setup and low training overhead
- Clear tenancy boundaries: each school only sees its own data
- MVP discipline: only build what is required to support pilot-school recovery workflows

## Constraints

- The platform is separate from the existing B2C iFoundIt product
- School onboarding is manual in MVP
- Parent notifications, MIS integrations, MAT support, and SMS are out of scope for MVP
- UK GDPR considerations apply to student data handling
