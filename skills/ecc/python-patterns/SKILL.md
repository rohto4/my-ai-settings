---
name: python-patterns
description: Pythonic idioms, PEP 8 standards, type hints, and best practices for building robust, efficient, and maintainable Python applications.
---

# Python Development Patterns

Idiomatic Python patterns and best practices for building robust, efficient, and maintainable applications.

## When to Activate

- Writing new Python code
- Reviewing Python code
- Refactoring existing Python code
- Designing Python packages/modules

## Use Detailed Guidance

1. Read the repository instructions and identify the exact Python version, target files, and validation command.
2. Open [detailed-patterns.md](references/detailed-patterns.md) and read only the sections relevant to the requested change.
3. Apply the smallest compatible pattern, then run the narrow project checks before broader verification.
4. Report files changed, commands and observed results, skipped checks, and remaining risk.

## Operating Boundaries

- On Windows, use the repository's PowerShell equivalents. Resolve paths with `Resolve-Path -LiteralPath` or `Get-Item -LiteralPath`, preserve drive letters and spaces, and keep discovery and any later mutation in the same shell.
