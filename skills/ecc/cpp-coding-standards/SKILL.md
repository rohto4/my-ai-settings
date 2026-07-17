---
name: cpp-coding-standards
description: Apply modern C++ ownership, lifetime, type-safety, error-handling, concurrency, and review conventions. Use when implementing or reviewing C++ code in an existing repository. Do not use for C code, build-system-only work, or replacing repository-specific standards.
---

# C++ Coding Standards

## Workflow

1. Read repository instructions, pinned versions, existing conventions, and validation commands.
2. Identify the smallest owning boundary and its observable contract.
3. Make the smallest repository-consistent change.
4. Run the narrow checks that cover the changed path.
5. Report commands, observed results, and unverified surfaces.

## Decision guide

- Prefer values and RAII; use smart pointers only when ownership semantics require them.
- Follow the repository exception or result-type policy and preserve error identity.
- Make concurrency lifetime and synchronization ownership explicit.
- Preserve the pinned language standard and supported compilers.

## Safety boundaries

- Use fake, sandbox, or dry-run boundaries for code that reaches external services.
- Keep real tokens, live APIs, deployment, publishing, dependency updates, and remote writes behind a separate explicit approval.
- Never place secrets or credentials in examples, source, logs, or committed fixtures.

## Detailed patterns

Read [references/detailed-patterns.md](references/detailed-patterns.md) only when the current task needs the expanded examples and checklists.
