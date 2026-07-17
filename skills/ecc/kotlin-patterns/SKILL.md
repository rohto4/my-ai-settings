---
name: kotlin-patterns
description: Idiomatic Kotlin patterns, best practices, and conventions for building robust, efficient, and maintainable Kotlin applications with coroutines, null safety, and DSL builders.
---

# Kotlin Development Patterns

Idiomatic Kotlin patterns and best practices for building robust, efficient, and maintainable applications.

## When to Use

- Writing new Kotlin code
- Reviewing Kotlin code
- Refactoring existing Kotlin code
- Designing Kotlin modules or libraries
- Configuring Gradle Kotlin DSL builds

## How It Works

This skill enforces idiomatic Kotlin conventions across seven key areas: null safety using the type system and safe-call operators, immutability via `val` and `copy()` on data classes, sealed classes and interfaces for exhaustive type hierarchies, structured concurrency with coroutines and `Flow`, extension functions for adding behaviour without inheritance, type-safe DSL builders using `@DslMarker` and lambda receivers, and Gradle Kotlin DSL for build configuration.

## Use Detailed Guidance

1. Read the repository instructions and identify the exact Kotlin version, framework version, target files, and validation command.
2. Open [detailed-patterns.md](references/detailed-patterns.md) and read only the sections relevant to the requested change.
3. Apply the smallest compatible pattern, then run the narrow project checks before broader verification.
4. Report files changed, commands and observed results, skipped checks, and remaining risk.
