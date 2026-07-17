---
name: knowledge-ops
description: Route, deduplicate, store, sync, and retrieve project or cross-project knowledge. Use when source-of-truth ownership, handoff, archive, or vault placement matters.
---

# Knowledge Operations

Keep one source of truth per fact. Route information by ownership and lifecycle before writing it anywhere.

## 1. Load the governing policy

Read the current repository's `AGENTS.md`, `PROJECT.md`, and docs-management policy. If they point to a central knowledge policy, read that policy before any cross-project write.

For this tool-set environment, the default central policy is:

`G:\knowledge-vault\knowledge-vault-write-policy.md`

Do not duplicate that policy inside a skill or project.

## 2. Classify the information

| Information | Default owner |
| --- | --- |
| Current implementation task | project task file |
| User decision required | project user-decision file |
| User action required | project user-task file |
| Completed project work | project completion record |
| Session recovery context | project handoff or diary |
| Adopted specification or architecture | project source-of-truth docs |
| Reusable cross-project principle or failure lesson | central knowledge base, after policy gate |
| Secret, token, cookie, credential, private key | nowhere |

Project-specific work remains in the project even when it is important. Importance alone does not make it cross-project knowledge.

## 3. Check before writing

1. Search the destination for an existing canonical entry.
2. Compare scope, date, source, and decision status.
3. Update the canonical entry when the policy allows it; do not create a parallel note for the same fact.
4. Keep facts, inference, decisions, and open questions visibly distinct.
5. Record the source paths needed to reconstruct the conclusion.
6. If confidence or destination ownership is unclear, leave a project-local decision item instead of guessing.

## 4. Synchronize minimally

Update the source of truth and only the required indexes, task states, or completion records. Avoid copying full policy tables, specifications, or logs into multiple files.

When a cross-project write succeeds, record in the project completion log:

- what was transferred,
- where it was stored,
- when it was stored,
- which project evidence supported it.

Do not treat chat memory, model memory, issue trackers, or vector indexes as independent authorities. They may index or summarize a source of truth, but they do not replace it.

## 5. Retrieve with provenance

Search in this order:

1. Current project sources of truth.
2. Current task, completion, and handoff records.
3. Central cross-project knowledge.
4. External systems or live connectors when needed.

Report whether a statement is current project fact, historical record, external fact, or inference. Refresh drift-prone external facts before relying on them.

## Completion check

- One canonical owner is clear for every written fact.
- No secret or unresolved project-only item was copied into the central knowledge base.
- Required project state and transfer evidence are synchronized.
- Duplicate or stale entries were not introduced.
