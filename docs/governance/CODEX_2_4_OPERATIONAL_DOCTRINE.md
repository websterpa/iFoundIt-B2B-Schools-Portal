# SHIFT CRAFT ATLAS: OPERATIONAL DOCTRINE 2.4 (AMENDED)

**Status:** ACTIVE SUPREMACY
**Scope:** Global Repository Operations
**Last Updated:** May 28, 2026

## 1. AUTHORITY AND SUPREMACY
This document represents the **sole active operational authority** for all AI agent and Codex executions within the ShiftCraft Atlas repository.

All prior governance artefacts (including legacy Codex templates, deprecated AG envelopes, and historical convergence wrappers) are strictly historical and non-authoritative. If guidance conflicts, this doctrine **overrides all lower-authority material**.

## 2. HIGH-VELOCITY IMPLEMENTATION MODE (HVIM)
To balance strict governance with code development velocity, agents may be invoked in **High-Velocity Implementation Mode (HVIM)**. When a prompt explicitly invokes "HVIM" or "Execution Mode", the agent MUST shift from a planning/architectural mindset to an execution-first mindset.

**Under HVIM, the agent will strictly adhere to the following:**
1. **Assume Architectural Supremacy:** Do not question, validate, or attempt to optimize the existing architecture unless explicitly requested. Assume the overarching design (App Router boundaries, Supabase governance, Playwright testing protocols) is correct.
2. **Execution Over Exposition:** Output code modifications immediately. Minimize markdown explanations, pleasantries, and theoretical planning. Your primary output should be syntactically perfect code blocks.
3. **Bounded Scope:** Only modify the specific files, API routes, or test blocks explicitly targeted in the prompt. Do not attempt "opportunistic refactoring" in adjacent files.
4. **Test-Driven Safety:** Use existing unit tests (e.g., `tests/unit/`) and Playwright specs as the primary mechanism for governance compliance. If the code passes the truth protocol and unit tests, it is considered compliant.

## 3. CORE OPERATIONAL RULES
When operating outside of HVIM (or when general guardrails apply), agents must abide by the following:
* **Single Execution Mode:** Use one execution mode only. Do not blend phases (e.g., do not mix architectural planning with deep syntax refactoring in the same step).
* **Compact Behaviour:** Prefer compact, highly focused operational behaviour over broad, sweeping changes.
* **Runtime Truth Over Theory:** Live DOM states, terminal outputs, and unit test results supersede theoretical design documents.
* **Fail Closed:** When authority, path validity, ownership, or safety cannot be mathematically or logically proven, the agent must halt execution and fail closed.

## 4. BOUNDARY ENFORCEMENT
* **No New Wrappers:** Do not create additional governance wrappers, new execution templates, or overlapping active authorities.
* **Privileged Imports:** Respect all App Router Privileged Import Certification rules. Server-side logic must never leak into client boundaries.
* **Compliance Engine Safety:** Any modifications to fatigue, working time regulations (WTR), or labor compliance mathematics must be strictly validated against existing unit tests.

## 5. RESOLUTION PROTOCOL
If an agent hits an execution blocker, Vercel 401, or Playwright failure:
1. Halt modifications.
2. Output the exact terminal trace or error log.
3. Await human or Out-of-Band Architectural AI (Gemini) resolution before proceeding.

## 6. RESPONSE FORMAT
For implementation work, agents must report using the following section order:
1. `STATUS`
2. `CHANGED`
3. `WHY`
4. `FILES`
5. `VERIFY`
6. `RISKS`
7. `NEXT ACTIONS`

`NEXT ACTIONS` must appear after `RISKS` and should contain concise suggested follow-up steps.
