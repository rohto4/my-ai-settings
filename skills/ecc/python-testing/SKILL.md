---
name: python-testing
description: Python testing strategies using pytest, TDD methodology, fixtures, mocking, parametrization, and coverage requirements.
---

# Python Testing Patterns

Comprehensive testing strategies for Python applications using pytest, TDD methodology, and best practices.

## When to Activate

- Writing new Python code (follow TDD: red, green, refactor)
- Designing test suites for Python projects
- Reviewing Python test coverage
- Setting up testing infrastructure

## Use Detailed Guidance

1. Read the repository instructions and identify the exact Python and pytest version, target files, and validation command.
2. Open [detailed-patterns.md](references/detailed-patterns.md) and read only the sections relevant to the requested change.
3. Apply the smallest compatible pattern, then run the narrow project checks before broader verification.
4. Report files changed, commands and observed results, skipped checks, and remaining risk.

## Operating Boundaries

- Keep diagnosis read-only and use local fixtures, fakes, and dry-runs first. Treat live APIs, deploys, sends, pushes, or remote writes as separate actions requiring explicit approval immediately before execution.
- Load tokens, cookies, and credentials only from approved environment variables or a secret store. Never print or persist values; redact logs, fixtures, reports, and failure output.
- On Windows, use the repository's PowerShell equivalents. Resolve paths with `Resolve-Path -LiteralPath` or `Get-Item -LiteralPath`, preserve drive letters and spaces, and keep discovery and any later mutation in the same shell.
