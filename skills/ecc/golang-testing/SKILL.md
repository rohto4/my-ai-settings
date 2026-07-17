---
name: golang-testing
description: Build focused Go tests with table cases, subtests, fakes, fuzzing, benchmarks, race checks, and explicit failure evidence. Use when adding or reviewing tests for a concrete Go behavior. Do not use to mutate production systems or replace repository-specific test commands.
---

# Go Testing

## Workflow

1. Read repository instructions, pinned versions, existing conventions, and validation commands.
2. Identify the smallest owning boundary and its observable contract.
3. Make the smallest repository-consistent change.
4. Run the narrow checks that cover the changed path.
5. Report commands, observed results, and unverified surfaces.

## Decision guide

- Add the smallest failing test that proves the behavior or regression.
- Prefer deterministic fakes and local fixtures over network, clock, random, or process dependencies.
- Run race checks where shared state or goroutines changed.
- Preserve minimized fuzz regressions as ordinary tests and compare benchmarks to a stable baseline.

## Safety boundaries

- Tests must not push, deploy, publish, send messages, or update live services.
- Use fake, sandbox, or dry-run boundaries and require explicit approval before any exceptional external write.

## Detailed patterns

Read [references/detailed-patterns.md](references/detailed-patterns.md) only when the current task needs the expanded examples and checklists.
