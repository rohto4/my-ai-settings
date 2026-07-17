---
name: kotlin-exposed-patterns
description: JetBrains Exposed ORM patterns including DSL queries, DAO pattern, transactions, HikariCP connection pooling, Flyway migrations, and repository pattern.
---

# Kotlin Exposed Patterns

Comprehensive patterns for database access with JetBrains Exposed ORM, including DSL queries, DAO, transactions, and production-ready configuration.

## When to Use

- Setting up database access with Exposed
- Writing SQL queries using Exposed DSL or DAO
- Configuring connection pooling with HikariCP
- Creating database migrations with Flyway
- Implementing the repository pattern with Exposed
- Handling JSON columns and complex queries

## How It Works

Exposed provides two query styles: DSL for direct SQL-like expressions and DAO for entity lifecycle management. HikariCP manages a pool of reusable database connections configured via `HikariConfig`. Flyway runs versioned SQL migration scripts at startup to keep the schema in sync. All database operations run inside `newSuspendedTransaction` blocks for coroutine safety and atomicity. The repository pattern wraps Exposed queries behind an interface so business logic stays decoupled from the data layer and tests can use an in-memory H2 database.

## Use Detailed Guidance

1. Read the repository instructions and identify the exact Kotlin version, framework version, target files, and validation command.
2. Open [detailed-patterns.md](references/detailed-patterns.md) and read only the sections relevant to the requested change.
3. Apply the smallest compatible pattern, then run the narrow project checks before broader verification.
4. Report files changed, commands and observed results, skipped checks, and remaining risk.

## Operating Boundaries

- At start and after compaction, session transfer, or handoff, reread repository `AGENTS.md`, `PROJECT.md`, and the current `docs/imp` task from disk; keep in-progress state separate from completion evidence.
- Keep database inspection read-only and use local fixtures, fake services, and dry-runs first. Treat real tokens, live APIs, deploys, pushes, or remote writes as separate actions requiring explicit approval immediately before execution.
- Stop when schema authority, migration ownership, credentials, or production impact is unclear. Hand off the exact schema/version, attempted checks, observed results, blockers, and next decision. Claim completion only with recorded test or query evidence and remaining unverified scope.
