# Canonical Repo Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/Volumes/Hymer SSD/iFoundIt B2B Schools Portal` into the canonical local git repository for the project, with repo hygiene good enough for normal GitHub use.

**Architecture:** Keep the application code and docs intact, remove local machine metadata from version control scope, preserve local-only secrets, and initialize a fresh git repository at the current folder root. Treat this as a repository-foundation task rather than an app refactor.

**Tech Stack:** Git, Next.js, TypeScript, Vitest, local shell tooling

---

### Task 1: Document Current Baseline

**Files:**
- Create: `docs/superpowers/plans/2026-07-01-canonical-repo-conversion-implementation-plan.md`
- Modify: none
- Test: none

- [ ] **Step 1: Confirm the folder contents and current ignore rules**

Run: `ls -la`
Expected: app source, docs, `node_modules`, `.next`, `.env.local`, and macOS `._*` artifacts are visible.

- [ ] **Step 2: Confirm the existing ignore file covers local-only artifacts**

Run: `sed -n '1,220p' .gitignore`
Expected: `node_modules`, `.next`, `.env.local`, and `._*` are ignored.

- [ ] **Step 3: Confirm the app test baseline is green before repo changes**

Run: `npm test`
Expected: Vitest exits successfully with all current tests passing.

### Task 2: Clean Repository Hygiene

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`
- Test: `tests/unit/lib/env.example.test.ts`

- [ ] **Step 1: Tighten ignore coverage for repository noise**

Update `.gitignore` so it continues to ignore local dependencies and build output, and explicitly ignores common repo-noise files such as `.env`, AppleDouble files, and editor artifacts while keeping `.env.example` tracked.

- [ ] **Step 2: Update the README so a fresh collaborator can operate the repo**

Add a concise setup section covering install, environment bootstrap, local dev, tests, and the fact that Supabase credentials live in local env only.

- [ ] **Step 3: Re-read `.env.example` coverage expectations**

Run: `sed -n '1,220p' tests/unit/lib/env.example.test.ts`
Expected: the required env contract remains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

### Task 3: Remove Local Metadata Artifacts

**Files:**
- Delete: macOS `._*` files in the repository tree
- Preserve: `.env.local`, `node_modules/`, `.next/`
- Test: none

- [ ] **Step 1: Inventory AppleDouble artifacts**

Run: `find . -path './node_modules' -prune -o -path './.next' -prune -o -name '._*' -print`
Expected: a finite list of `._*` files appears across the workspace.

- [ ] **Step 2: Remove the AppleDouble artifacts from the working tree**

Run: `find . -path './node_modules' -prune -o -path './.next' -prune -o -name '._*' -delete`
Expected: the metadata sidecar files are removed without touching real source files.

- [ ] **Step 3: Verify the metadata cleanup**

Run: `find . -path './node_modules' -prune -o -path './.next' -prune -o -name '._*' -print`
Expected: no output.

### Task 4: Initialize the Canonical Git Repository

**Files:**
- Create: `.git/` metadata
- Modify: none
- Test: none

- [ ] **Step 1: Initialize git at the current folder root**

Run: `git init -b main`
Expected: a new repository is created in `/Volumes/Hymer SSD/iFoundIt B2B Schools Portal/.git`.

- [ ] **Step 2: Verify branch state**

Run: `git branch --show-current`
Expected: `main`

- [ ] **Step 3: Verify tracked/untracked state is sane**

Run: `git status --short --branch`
Expected: only intended project files appear, while ignored artifacts such as `.env.local`, `node_modules`, and `.next` stay hidden.

### Task 5: Final Verification

**Files:**
- Modify: none
- Test: `tests/unit/**/*`

- [ ] **Step 1: Re-run automated tests after cleanup**

Run: `npm test`
Expected: all tests still pass.

- [ ] **Step 2: Verify the repo root file list is sane**

Run: `find . -maxdepth 1 -mindepth 1 | sort`
Expected: source, docs, config, and git metadata are present without stray `._*` root artifacts.

- [ ] **Step 3: Verify final git state**

Run: `git status --short --branch`
Expected: the repository is on `main` with a cleanly inspectable working tree and no ignored local artifacts leaking into status.
