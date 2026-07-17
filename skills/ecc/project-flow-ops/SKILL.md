---
name: project-flow-ops
description: Reconcile execution state across canonical task records, issues, pull requests, and available planning tools. Use for backlog triage, duplicate detection, work linkage, blockers, and delivery state; do not mutate code or external status without explicit scope and approval.
---

# Project Flow Ops

Turn disconnected project records into one evidence-backed execution view. Preserve each project's chosen source of truth instead of imposing a vendor workflow.

## Restore the project model

1. Read the actual `AGENTS.md`, `PROJECT.md`, prescribed initialization files, current task record, and relevant completion or decision records before querying external trackers.
2. After compaction, session transfer, or handoff, reread them from disk. Do not resume from a conversation summary alone.
3. Identify the project's declared authorities for planned work, completed evidence, public issue state, code review, ownership, and scheduling. Do not assume GitHub is public truth or Linear is internal truth unless the project says so.
4. If sources conflict, apply the documented precedence. Otherwise report the conflict and pause before synchronizing it.

## Detect provider capabilities

- Discover the available code-host, issue, pull-request, CI, and planning-provider tools and whether each operation is read-only or write-capable.
- Use provider-neutral concepts—work item, change request, review, check, owner, lane, status, dependency—and map them to the selected provider only after capability detection.
- Do not install a plugin, configure an account, or require Linear, GitHub, or a Claude-specific surface as a side effect of this skill.
- Never expose tokens, Cookies, credentials, private issue contents, or authenticated response bodies in prompts, artifacts, repositories, command lines, or logs.
- For local Windows evidence, use PowerShell, `rg`, `Get-Content -LiteralPath`, and explicit drive-letter paths. Preserve the project's shell and path conventions.

## Default to a read-only audit

Read and classify before changing anything. Treat create, close, reopen, merge, comment, assign, label, link, move, schedule, reprioritize, or status transition in any provider as an external write.

Before a write:

1. show the provider, stable item ID, current state, proposed new state, and reason;
2. show all linked items affected and how duplicate or conflict handling works;
3. provide a fake payload, reconciliation table, or dry-run when possible;
4. state the external effect, notification risk, idempotency or duplicate guard, and rollback path;
5. obtain explicit approval for the exact target and effect.

Approval for triage or read-only analysis is not approval to post, merge, close, or synchronize. Never mirror all items mechanically.

## Workflow

### 1. Define scope and authorities

Set the repository, project lane, item types, time window, inclusion rules, and intended decision. Record which system owns each field instead of choosing one global master.

### 2. Gather evidence

Read the minimum required state:

- canonical project task and completion records;
- work-item status, owner, labels, dependencies, and linked change requests;
- full change diff when merge readiness is in scope;
- review comments, approvals, CI or check results, branch state, and merge policy;
- planning-provider lane, priority, schedule, and ownership when applicable.

Never classify merge readiness from title, summary, trust, or one provider's status alone.

### 3. Build a deduplicated item map

Match stable IDs and explicit links first, then repository, branch, title, scope, and evidence. Separate:

- one work item represented in multiple systems;
- related but independently deliverable work;
- stale or superseded records;
- true duplicates;
- conflicts requiring an owner decision.

Do not collapse items based only on similar titles.

### 4. Classify against project policy

Use the project's own states when defined. Otherwise propose a small neutral set such as ready, needs change, blocked, close, or park. For every classification, cite the diff, review, check, dependency, policy, or decision evidence that supports it.

### 5. Propose reconciliation

Create a dry-run table of exact updates. Keep public communication, internal planning, code-host lifecycle, and canonical project task records as separate actions. If active work needs cross-links, specify both link directions and an idempotency key or existing-link check.

### 6. Apply approved updates and verify

Execute only approved rows. Re-read each changed item and verify status, links, owner, labels, comments, and notifications where exposed. Do not merge a change request or close work merely because a tracking update succeeded.

## Output

```text
SOURCE OF TRUTH
- project authorities and provider mapping

ITEM MAP
- stable IDs / links / duplicate or conflict status

ASSESSMENT
- classification / blockers / evidence

ACTIONS
- read-only findings / proposed dry-run / approved writes performed

EVIDENCE AND NEXT STEP
- provider readback / unavailable checks / rollback / next owner action
```

## Stop, handoff, and completion

Stop before mutation when authority is ambiguous, linked items conflict, the full diff or required checks are unavailable, provider permissions are unclear, approval is missing, a write would notify unintended people, or a secret or private content could escape its boundary. Product-direction blockers must be named rather than hidden behind tooling status.

For context pressure or handoff, record the source-of-truth map, scope, deduplicated item table, evidence already read, classifications, approval and write state, unresolved conflicts, and next read-only action. Then follow the project's compaction-recovery order.

Complete only when every in-scope item has an evidence-backed classification, duplicates and conflicts are explicit, approved writes are confirmed by provider readback, unapproved writes remain proposals, project task state and completion evidence remain separated, and no notification, external change, or secret exposure occurred outside scope.
