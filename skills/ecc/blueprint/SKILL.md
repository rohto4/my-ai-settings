---
name: blueprint
description: Turn a broad multi-session engineering objective into a dependency-ordered construction plan with cold-start context, authority gates, and verification per unit. Use for work spanning several phases or handoffs; do not use for a bounded single-session implementation or when the user says to execute an existing plan.
---

# Blueprint

Create a durable execution blueprint that a fresh Codex task can resume from repository files without relying on conversation history.

## Start and Boundaries

1. Read the target PJ's `AGENTS.md`, `PROJECT.md`, current task, architecture, pinned stack, and relevant implementation/completion records.
2. Confirm the objective, source of truth, scope, non-goals, approval boundary, and final acceptance.
3. This skill plans only. It does not edit product code, install dependencies, create branches, commit, push, deploy, update memory, or start agents.
4. Use `prp-create-plan` for a normal implementation plan and `plan-orchestrate` when an approved plan only needs execution routing.
5. Do not create parallel-agent work by default. Mark safe parallel candidates only when the user or target PJ explicitly permits delegation.

Stop when architecture ownership, destructive migration policy, external authority, or the required end state is unresolved.

## Construction Workflow

### 1. Map current state

Record the exact repository path, branch/worktree state when relevant, canonical docs, existing implementation, tests, and unfinished task state. Separate observed facts from assumptions.

### 2. Define invariants and gates

Name what must remain true across all phases:

- public contracts and compatibility;
- data ownership, migration, and rollback;
- authorization, secrets, and external-write boundaries;
- test, observability, and operational requirements;
- user decisions that block execution.

### 3. Create bounded units

Each unit should have one dominant risk and be independently verifiable. Include:

- stable ID and outcome;
- cold-start context: authoritative files and current assumptions;
- inputs and dependencies;
- exact in-scope and out-of-scope surfaces;
- intended files/components without inventing files not yet verified;
- authority required;
- implementation outline;
- direct proving commands or observations;
- rollback/recovery and handoff;
- done condition.

Split units that mix architecture, migration, implementation, and deployment without a verification boundary.

### 4. Order by evidence and dependency

Use a dependency graph or table only when it clarifies order. Put contract and safety decisions before dependent implementation. Place migrations, external writes, deployment, and timer enablement behind explicit gates. Identify parallel candidates only when their mutable surfaces and outputs are disjoint.

### 5. Review adversarially

Check:

- every unit traces to the objective;
- dependencies are acyclic and justified;
- a fresh task can locate all source files;
- each done condition has direct evidence;
- no unit silently broadens authority;
- rollback and partial-failure behavior are present where needed;
- progress and completion records are not mixed.

Use a subagent review only if delegation is explicitly authorized; otherwise perform the checklist locally.

### 6. Persist in the target PJ

Write the blueprint only to an authorized project location. Register the active work in the PJ task file. Keep accepted architecture in canonical design/decision docs and move finished evidence to the completion log as work closes.

On Windows, use PowerShell and `-LiteralPath` for file operations. Verify resolved drive-letter targets before recursive move/delete and keep discovery and mutation in the same shell.

## Mutation Protocol

When evidence changes:

1. mark the affected unit and downstream units;
2. record the new fact and source;
3. revise dependencies, scope, and verification;
4. preserve the reason for superseding the old path;
5. do not silently rewrite completed evidence.

After compaction or handoff, reread the blueprint, PJ instructions, and current task from disk before continuing.

## Output

Lead with:

- objective, non-goals, invariants, and final acceptance;
- unit table with dependencies, authority, outputs, and verification;
- critical path and explicitly safe parallel candidates;
- approval gates and unresolved decisions;
- first executable unit after approval.

## Completion

The blueprint is complete when every objective maps to bounded units, each unit has cold-start context and a proving check, dependencies are acyclic, authority gates are visible, and task/decision/completion destinations are named. It is not evidence that implementation is complete.
