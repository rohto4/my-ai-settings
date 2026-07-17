---
name: prp-create-plan
description: Create a repository-grounded PRP implementation plan with boundaries, files, dependencies, sequence, validation, migration, and docs updates. Use for a multi-step change that needs an implementation-ready handoff; do not use for trivial edits, unsettled product discovery, or execution of an accepted plan.
---

# PRP Create Plan

Produce a plan another Codex run can execute without rediscovering the repository.

Use this skill when the user requests an implementation plan or when a
multi-step repository change needs an implementation-ready handoff. Do not use
it for a trivial one-file edit, a product discovery conversation, or execution
of an already accepted plan.

## Workflow

1. Read repository instructions, current tasks, accepted specifications, and the input artifact.
2. Inspect the actual code paths, package boundaries, tests, schemas, and nearby patterns.
3. Resolve contradictions between the input and current repository state. Treat the repository's adopted source of truth as authoritative.
4. Identify the smallest coherent delivery slices and their dependencies.
5. For each slice, name owned files or modules, behavior, constraints, tests, and completion evidence.
6. Include migrations, rollout, compatibility, observability, permissions, failure behavior, and documentation only when applicable.
7. Record blocking user decisions separately. Do not bury them inside implementation tasks.
8. Write the plan using [references/plan-template.md](references/plan-template.md).
9. Match commands to the target environment. For Windows workflows, provide
   PowerShell equivalents, use `-LiteralPath` for exact paths, preserve drive
   letters, and keep recursive filesystem validation and mutation in one shell.
10. Do not make subagents, worktrees, commits, or pushes mandatory plan steps
    unless the user or repository policy explicitly requires them. Treat those
    as execution choices with their own authorization boundary.

## Artifact routing

- Draft: `.codex/prp/plans/{kebab-case-name}.plan.md`
- Active task summary: repository implementation-task file
- User decisions: repository user-decision file

Do not duplicate the full plan into task ledgers. Link or summarize only the actionable state.
Keep in-progress state in the repository task ledger and completion evidence in
its completion log when that separation is defined. After compaction or
handoff, require the executor to reread `AGENTS.md`, `PROJECT.md`, and the
current task from disk rather than treating the conversation summary as truth.

## Plan quality gate

Every task must have a purpose, bounded change, dependency, direct validation, and done condition. File paths may be patterns when exact files do not yet exist, but invented code references are prohibited.
