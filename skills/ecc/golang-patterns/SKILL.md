---
name: golang-patterns
description: Apply idiomatic Go package, API, error, concurrency, context, resource-lifetime, and performance patterns. Use when implementing or reviewing Go code in an existing module. Do not use for language-agnostic architecture or changing module policy without repository authority.
---

# Go Patterns

## Workflow

1. Read repository instructions, pinned versions, existing conventions, and validation commands.
2. Identify the smallest owning boundary and its observable contract.
3. Make the smallest repository-consistent change.
4. Run the narrow checks that cover the changed path.
5. Report commands, observed results, and unverified surfaces.

## Decision guide

- Prefer small interfaces at the consumer boundary.
- Add error context without losing identity; test errors.Is or errors.As behavior.
- Carry context, bound workers, and make shutdown ownership explicit.
- Acquire resources late, release deterministically, and measure before optimization.

## Safety boundaries

- Use repository PowerShell equivalents when available and LiteralPath for filesystem targets.
- Keep filesystem operations in one shell and verify drive-letter and path semantics before destructive or recursive actions.

## Detailed patterns

Read [references/detailed-patterns.md](references/detailed-patterns.md) only when the current task needs the expanded examples and checklists.
