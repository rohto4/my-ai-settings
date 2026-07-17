---
name: perl-security
description: Comprehensive Perl security covering taint mode, input validation, safe process execution, DBI parameterized queries, web security (XSS/SQLi/CSRF), and perlcritic security policies.
---

# Perl Security Patterns

Comprehensive security guidelines for Perl applications covering input validation, injection prevention, and secure coding practices.

## When to Activate

- Handling user input in Perl applications
- Building Perl web applications (CGI, Mojolicious, Dancer2, Catalyst)
- Reviewing Perl code for security vulnerabilities
- Performing file operations with user-supplied paths
- Executing system commands from Perl
- Writing DBI database queries

## How It Works

Start with taint-aware input boundaries, then move outward: validate and untaint inputs, keep filesystem and process execution constrained, and use parameterized DBI queries everywhere. The examples below show the safe defaults this skill expects you to apply before shipping Perl code that touches user input, the shell, or the network.

## Use Detailed Guidance

1. Read the repository instructions and identify the exact Perl version, target files, and validation command.
2. Open [detailed-patterns.md](references/detailed-patterns.md) and read only the sections relevant to the requested change.
3. Apply the smallest compatible pattern, then run the narrow project checks before broader verification.
4. Report files changed, commands and observed results, skipped checks, and remaining risk.

## Operating Boundaries

- Keep diagnosis read-only and use local fixtures, fakes, and dry-runs first. Treat live APIs, deploys, sends, pushes, or remote writes as separate actions requiring explicit approval immediately before execution.
- Before delete, reset, or cleanup, resolve every absolute target path and obtain explicit approval. Never pass targets enumerated in one shell to a destructive command in another shell.
- Load tokens, cookies, and credentials only from approved environment variables or a secret store. Never print or persist values; redact logs and reports.
- On Windows, use the repository's PowerShell equivalents. Resolve paths with `Resolve-Path -LiteralPath` or `Get-Item -LiteralPath`, preserve drive letters and spaces, and keep discovery and any later mutation in the same shell.
