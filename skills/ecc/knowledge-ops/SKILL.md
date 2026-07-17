---
name: knowledge-ops
description: Route, deduplicate, store, sync, retrieve, or hand off durable project knowledge while preserving one source of truth and provenance. Use for vault placement and completed lessons, not ordinary edits, transient summaries, speculation, or secrets.
---

# Knowledge Operations

Keep one canonical owner per fact. Classify ownership and lifecycle before any write.

## Restore the governing context

1. Read the current project's `AGENTS.md`, `PROJECT.md`, and the minimum docs-management or context-reading guide they require.
2. Read the current task, completion, user-decision, or handoff record only when it affects the request.
3. After compaction, session movement, or handoff, reread those files from disk before continuing. Treat conversation summaries and model memory as aids, not project truth.
4. If a cross-project destination is in scope, read that destination project's `AGENTS.md` and `PROJECT.md` before proposing a write.
5. If project docs point to a central policy such as `G:\knowledge-vault\knowledge-vault-write-policy.md`, read it before any central write. Do not copy the policy into another source.

On Windows, prefer `rg` for search and PowerShell commands such as `Get-Content -Raw -Encoding UTF8 -LiteralPath <path>`. Preserve drive letters and use `-LiteralPath` for user-provided paths. Keep filesystem inspection and any later mutation in the same shell.

## Classify ownership

| Information | Default owner |
| --- | --- |
| Current implementation work | Project task file |
| User decision or action | Project user-decision or user-task file |
| Completed project work and verification | Project completion record |
| Session recovery state | Project handoff or diary |
| Adopted specification or architecture | Project source-of-truth docs |
| Reusable cross-project principle or failure lesson | Central knowledge base, after its policy gate |
| Secret, token, cookie, credential, private key, or private data body | No repository or knowledge note |

Importance alone does not make project-specific work cross-project knowledge. Keep facts, inference, decisions, and open questions visibly distinct.

## Inspect before writing

Default to a read-only assessment or dry-run summary:

1. Resolve the exact source, destination, requested operation, and exclusions.
2. Search the intended destination for an existing canonical entry.
3. Compare scope, date, evidence, decision status, and source paths.
4. Propose `create`, `update`, `skip`, or `hold`, with the reason and affected paths.
5. Show the planned diff or field-level change before any cross-project, external-system, or broad write when the request or governing policy requires approval.

Do not recurse across sibling projects, backups, dependency caches, hidden directories, or the whole knowledge vault without an explicit scope. Do not expose secret values in searches, commands, logs, reports, or examples; report only the path and secret class when that evidence is necessary.

## Apply the minimum authorized change

- Update the canonical entry rather than creating a parallel note for the same fact.
- Write only when the user request and governing project policy authorize it. A request to review, search, diagnose, or recommend is not write authorization.
- Use the project's normal patch/edit mechanism and preserve unrelated content. Do not delete, move, bulk overwrite, or notify external services unless explicitly requested and separately approved when required.
- Synchronize only required indexes and project state. Keep ongoing work in task records and finished evidence in completion records.
- When ownership, evidence, permission, or destination is unclear, stop at `hold` and leave a concrete handoff rather than guessing.

## Retrieve with provenance

Search in this order:

1. Current project sources of truth.
2. Current task, completion, decision, and handoff records.
3. Central cross-project knowledge.
4. External systems or live connectors only when needed and authorized.

Label each reported statement as current project fact, historical record, external fact, or inference. Refresh drift-prone external facts before relying on them.

## Stop and hand off

Stop before mutation when any of these applies:

- the canonical owner or applicable policy cannot be determined;
- source evidence is missing or conflicting;
- the operation could disclose a secret or private data body;
- the requested target expands beyond the authorized project or service;
- a cross-project or external write needs approval that has not been granted.

The handoff must state the intended destination, inspected sources, proposed disposition, unresolved decision, and the exact safe next step.

## Completion evidence

Report:

- canonical destination and source evidence;
- created, updated, skipped, or held items;
- duplicate check and scope checked;
- files or external records changed, plus verification performed;
- secrets, external writes, runtime sync, or notifications intentionally not performed;
- remaining risks and any user decision required.

Complete only when the canonical owner is clear, required state and provenance are synchronized, no secret was copied, and no duplicate or stale authority was introduced.
