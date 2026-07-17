---
name: docs-state-sync
description: Synchronize specs, tasks, user decisions, user actions, completion records, and handoffs. Use whenever repository work starts, changes, completes, or transfers.
---

# Docs State Sync

Keep project state recoverable without turning every document into a task log.

## Workflow

1. Read `AGENTS.md`, `PROJECT.md`, and the repository's docs-management policy.
2. Identify the event: start, progress, scope change, decision needed, user action needed, completion, or handoff.
3. Resolve the canonical owner for each fact. Use [references/default-routing.md](references/default-routing.md) only when the repository does not define a stronger rule.
4. Update the source of truth first.
5. Synchronize only links, summaries, and state required by the policy.
6. Check whether a central knowledge policy applies; do not write cross-project knowledge without its gate.
7. Verify that unresolved user items are visible in user-facing files and implementation work is visible in implementation files.

## Invariants

- `PROJECT.md` contains durable purpose, boundaries, and adopted decisions, not task history.
- Specifications contain accepted behavior, not unresolved questions or progress notes.
- Implementation ledgers do not absorb user decisions or user actions.
- Completion records state what finished and the evidence, not the full session transcript.
- Handoff notes restore context but do not replace canonical task state.
- A policy is linked, not copied into every skill or guide.

Report which files were updated and why. If no update is required, state the policy basis.
