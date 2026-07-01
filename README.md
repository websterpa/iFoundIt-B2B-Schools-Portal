# iFoundIt B2B Schools Portal

This repository contains the planning and implementation work for the iFoundIt B2B Schools Portal, a separate platform for UK secondary schools to manage NFC-tagged student phone pouches and recover them through the existing iFoundIt finder network.

## Purpose

The portal helps schools:

- register and manage tagged phone pouches
- import and maintain student records
- assign tags to students
- receive anonymous found-item notifications from the public
- track recovery events without exposing student details

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

- [`docs/PRODUCT.md`](/Volumes/Hymer SSD/iFoundIt B2B Schools Portal/docs/PRODUCT.md) — product overview, users, and outcomes
- [`docs/MVP_SCOPE.md`](/Volumes/Hymer SSD/iFoundIt B2B Schools Portal/docs/MVP_SCOPE.md) — in-scope and out-of-scope MVP definition
- [`docs/BACKLOG.md`](/Volumes/Hymer SSD/iFoundIt B2B Schools Portal/docs/BACKLOG.md) — prioritised backlog and next feature recommendation
- [`docs/USER_STORIES.md`](/Volumes/Hymer SSD/iFoundIt B2B Schools Portal/docs/USER_STORIES.md) — current user stories and acceptance criteria
- [`docs/iFoundIt B2B Schools Portal — MVP Project Plan.rtf`](/Volumes/Hymer SSD/iFoundIt B2B Schools Portal/docs/iFoundIt%20B2B%20Schools%20Portal%20%E2%80%94%20MVP%20Project%20Plan.rtf) — original MVP source document

## Source Of Truth

Until implementation docs evolve further, the MVP plan RTF and the Markdown files above should be treated as the product source of truth for scope and sequencing.
