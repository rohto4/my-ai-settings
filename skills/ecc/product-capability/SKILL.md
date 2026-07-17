---
name: product-capability
description: Translate accepted product intent into capabilities, invariants, interfaces, constraints, and unresolved decisions before multi-module planning. Use when product intent is stable but engineering behavior is implicit; do not use for unsettled discovery, file-level implementation plans, or code execution.
---

# Product Capability

Convert accepted product intent into an implementation-facing capability contract. This skill sits between problem-level PRD work and file-level implementation planning.

## Route correctly

- Use `prp-create-prd` when the problem, actor, outcome, or product scope is still unsettled.
- Use this skill when product intent is accepted but engineering constraints remain implicit.
- Use `prp-create-plan` after the capability contract is stable enough to map to repository changes.

## Workflow

### 1. Load authority

Read repository instructions, accepted product and specification docs, architecture and data constraints, and relevant current code. Do not promote roadmap prose, chat discussion, or a candidate document to accepted truth without evidence.

### 2. Restate the capability

State:

- actor and trusted context,
- new action or outcome,
- resource or information affected,
- observable success state,
- explicit non-goals.

### 3. Extract invariants

Resolve what must remain true across implementations:

- business and lifecycle rules,
- data ownership and consistency,
- actor, tenant, organization, and permission scope,
- external and internal interfaces,
- failure, retry, idempotency, and recovery behavior,
- compatibility, migration, rollout, and audit requirements,
- latency, volume, cost, compliance, or operational limits.

Separate confirmed constraints, inferred constraints, preferences, and unresolved decisions.

### 4. Define the contract

Describe states, transitions, inputs, outputs, errors, side effects, observability, and enforcement points. Keep framework and file choices out unless they are already adopted constraints.

Use [references/capability-contract.md](references/capability-contract.md) when a durable artifact is needed.

### 5. Gate the handoff

Classify the result:

- Ready for implementation planning.
- Needs architecture or data design.
- Needs product or permission decision.
- Needs current external research.

Put user decisions in the repository's user-decision file and implementation work in its implementation-task file. Update adopted source-of-truth docs only with accepted content.

Write durable project files only when the user requested an artifact or the active repository's rules require state synchronization. For analysis-only requests, return the contract in the response and name the proposed destination without writing it.

## Output

1. Capability and observable outcome.
2. Confirmed invariants and their evidence.
3. Interfaces, states, errors, side effects, and enforcement points.
4. Constraints separated into confirmed, inferred, preferred, and unresolved.
5. Blocking user or architecture decisions.
6. Readiness classification and the next workflow or authoritative artifact.

## Completion check

- A developer can distinguish product promise from implementation preference.
- Every invariant has an owner or evidence source.
- Cross-module interfaces and data ownership are explicit.
- Blocking decisions are visible outside the capability document.
- The next workflow and authoritative artifact are named.
