---
name: django-tdd
description: Implement Django behavior test-first with focused pytest or Django TestCase coverage, factories, API tests, and isolated database boundaries. Use when changing a concrete Django feature or defect. Do not use for production deployment, live migrations, or broad architecture redesign.
---

# Django Test-Driven Development

## Workflow

1. Read repository instructions, pinned versions, existing conventions, and validation commands.
2. Identify the smallest owning boundary and its observable contract.
3. Make the smallest repository-consistent change.
4. Run the narrow checks that cover the changed path.
5. Report commands, observed results, and unverified surfaces.

## Decision guide

- Write one failing test for the observable contract and confirm the intended failure.
- Use the project test database, deterministic factories, and fake external services.
- Implement the smallest production change and rerun the narrow test before the relevant suite.
- Freeze time and run queued work through a test adapter when needed.

## Safety boundaries

- Use repository PowerShell commands where provided and LiteralPath for filesystem targets.
- Keep push, deploy, email, webhooks, live migrations, and other external writes behind explicit approval.
- Stop when a test cannot isolate live dependencies or expected behavior is ambiguous.

## Detailed patterns

Read [references/detailed-patterns.md](references/detailed-patterns.md) only when the current task needs the expanded examples and checklists.
