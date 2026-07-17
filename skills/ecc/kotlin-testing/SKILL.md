---
name: kotlin-testing
description: Kotlin testing patterns with Kotest, MockK, coroutine testing, property-based testing, and Kover coverage. Follows TDD methodology with idiomatic Kotlin practices.
---

# Kotlin Testing Patterns

Comprehensive Kotlin testing patterns for writing reliable, maintainable tests following TDD methodology with Kotest and MockK.

## When to Use

- Writing new Kotlin functions or classes
- Adding test coverage to existing Kotlin code
- Implementing property-based tests
- Following TDD workflow in Kotlin projects
- Configuring Kover for code coverage

## How It Works

1. **Identify target code** — Find the function, class, or module to test
2. **Write a Kotest spec** — Choose a spec style (StringSpec, FunSpec, BehaviorSpec) matching the test scope
3. **Mock dependencies** — Use MockK to isolate the unit under test
4. **Run tests (RED)** — Verify the test fails with the expected error
5. **Implement code (GREEN)** — Write minimal code to pass the test
6. **Refactor** — Improve the implementation while keeping tests green
7. **Check coverage** — Run `./gradlew koverHtmlReport` and verify 80%+ coverage

## Use Detailed Guidance

1. Read the repository instructions and identify the exact Kotlin and test framework version, target files, and validation command.
2. Open [detailed-patterns.md](references/detailed-patterns.md) and read only the sections relevant to the requested change.
3. Apply the smallest compatible pattern, then run the narrow project checks before broader verification.
4. Report files changed, commands and observed results, skipped checks, and remaining risk.

## Operating Boundaries

- Load tokens, cookies, and credentials only from approved environment variables or a secret store. Never print or persist values; redact logs, fixtures, reports, and failure output.
