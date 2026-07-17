---
name: rust-patterns
description: Idiomatic Rust patterns, ownership, error handling, traits, concurrency, and best practices for building safe, performant applications.
---

# Rust Development Patterns

Idiomatic Rust patterns and best practices for building safe, performant, and maintainable applications.

## When to Use

- Writing new Rust code
- Reviewing Rust code
- Refactoring existing Rust code
- Designing crate structure and module layout

## How It Works

This skill enforces idiomatic Rust conventions across six key areas: ownership and borrowing to prevent data races at compile time, `Result`/`?` error propagation with `thiserror` for libraries and `anyhow` for applications, enums and exhaustive pattern matching to make illegal states unrepresentable, traits and generics for zero-cost abstraction, safe concurrency via `Arc<Mutex<T>>`, channels, and async/await, and minimal `pub` surfaces organized by domain.

## Use Detailed Guidance

1. Read the repository instructions and identify the exact Rust version, target files, and validation command.
2. Open [detailed-patterns.md](references/detailed-patterns.md) and read only the sections relevant to the requested change.
3. Apply the smallest compatible pattern, then run the narrow project checks before broader verification.
4. Report files changed, commands and observed results, skipped checks, and remaining risk.

## Operating Boundaries

- On Windows, use the repository's PowerShell equivalents. Resolve paths with `Resolve-Path -LiteralPath` or `Get-Item -LiteralPath`, preserve drive letters and spaces, and keep discovery and any later mutation in the same shell.
