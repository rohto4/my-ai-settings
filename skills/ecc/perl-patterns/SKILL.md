---
name: perl-patterns
description: Modern Perl 5.36+ idioms, best practices, and conventions for building robust, maintainable Perl applications.
---

# Modern Perl Development Patterns

Idiomatic Perl 5.36+ patterns and best practices for building robust, maintainable applications.

## When to Activate

- Writing new Perl code or modules
- Reviewing Perl code for idiom compliance
- Refactoring legacy Perl to modern standards
- Designing Perl module architecture
- Migrating pre-5.36 code to modern Perl

## How It Works

Apply these patterns as a bias toward modern Perl 5.36+ defaults: signatures, explicit modules, focused error handling, and testable boundaries. The examples below are meant to be copied as starting points, then tightened for the actual app, dependency stack, and deployment model in front of you.

## Use Detailed Guidance

1. Read the repository instructions and identify the exact Perl version, target files, and validation command.
2. Open [detailed-patterns.md](references/detailed-patterns.md) and read only the sections relevant to the requested change.
3. Apply the smallest compatible pattern, then run the narrow project checks before broader verification.
4. Report files changed, commands and observed results, skipped checks, and remaining risk.

## Operating Boundaries

- Keep diagnosis read-only and use local fixtures, fakes, and dry-runs first. Treat live APIs, deploys, sends, pushes, or remote writes as separate actions requiring explicit approval immediately before execution.
- On Windows, use the repository's PowerShell equivalents. Resolve paths with `Resolve-Path -LiteralPath` or `Get-Item -LiteralPath`, preserve drive letters and spaces, and keep discovery and any later mutation in the same shell.
