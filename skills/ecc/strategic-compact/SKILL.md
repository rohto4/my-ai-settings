---
name: strategic-compact
description: Plan context compaction at stable task boundaries and preserve recovery state. Use before long phase changes or when context pressure threatens continuity.
---

# Strategic Compact

Prepare a task so automatic or manual compaction can occur without losing authority, state, or required evidence.

## Compact only at a stable boundary

Good boundaries:

- exploration is distilled into an accepted plan,
- one implementation slice is complete and verified,
- a debugging branch is resolved or explicitly abandoned,
- the next phase has different evidence and tools,
- a session transfer or long pause is imminent.

Do not compact while a file edit, migration, deployment, external write, unresolved approval, or failing validation is in progress.

## Pre-compaction workflow

1. Read the repository's compaction and handoff rules in `AGENTS.md` and docs policy.
2. Reconcile the current objective with the actual worktree and task ledger.
3. Persist only durable state:
   - accepted decisions in their source-of-truth docs,
   - implementation state in implementation-task files,
   - user decisions and user actions in their dedicated files,
   - completed work and evidence in the completion record,
   - minimal recovery context in the designated handoff file when needed.
4. Record exact paths, next action, blocking condition, commands already run, and residual risk.
5. Remove contradictions between the handoff, plan, and current task state. Do not copy full logs.
6. Confirm that secrets, transient tool output, and speculative reasoning were not persisted.

Persist state only in the active target project's designated source-of-truth files. The reusable `agents-v1` candidate tree is not a task ledger or handoff destination. If the target project has no designated durable state files, do not invent a generic location; return `Not ready` and name the missing recovery contract.

## Recovery contract

The recovery note must answer:

- What objective is still active?
- What has direct completion evidence?
- What remains and in what order?
- Which user decisions or approvals are unresolved?
- Which files are authoritative?
- What must be re-read before the next action?
- What should not be repeated or reverted?

After compaction or session transfer, re-read the actual `AGENTS.md`, `PROJECT.md`, required initialization files, and current task files before acting. A generated summary is a locator, not the source of truth.

## Decision

Return one of:

- Ready: durable state and recovery path are complete.
- Not ready: name the exact in-flight action or missing evidence.
- Unnecessary: context pressure is not material and compaction would disrupt useful continuity.

Use the current Codex surface for compaction when available. Do not install hooks, write global settings, or claim that a local script enforces compaction unless that mechanism was explicitly configured and verified.

## Operational Safety, Recovery, And Completion

- On Windows, use the repository's PowerShell equivalents. Resolve paths with `Resolve-Path -LiteralPath` or `Get-Item -LiteralPath`, preserve drive letters and spaces, and keep discovery and any later mutation in the same shell.
- Keep diagnosis read-only and prefer local fixtures, fake services, and dry-runs. Treat real tokens, live APIs, deploys, sends, pushes, or remote writes as separate actions requiring explicit approval immediately before execution.
