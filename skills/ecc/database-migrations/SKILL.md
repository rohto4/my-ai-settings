---
name: database-migrations
description: Plan safe schema or data migrations, compatibility, backfills, indexes, and recovery. Use for persisted shape or data changes, not ordinary transactions.
---

# Database Migrations

## Trigger and boundary

- Use this skill for schema, persisted-data, migration-history, index, compatibility, or production rollout changes.
- Do not activate it for ordinary application transactions, read queries, or routine seed data. Do not turn a normal transaction into a migration workflow.
- For PostgreSQL schema or data changes, this skill owns migration lifecycle, compatibility, execution, and recovery. Use `postgres-patterns` only after this plan is established, for PostgreSQL SQL, schema, index, or diagnostic detail.
- Treat the target PJ's `AGENTS.md`, `PROJECT.md`, deployment policy, pinned database version, and migration-runner configuration as authoritative. This skill is not a replacement for them.
- Do not expose secrets in commands, logs, patches, or output. Do not execute SQL, deploy, change cloud state, or write to an external system without the user's explicit authorization.
- Do not assume that Next, Hono, Drizzle, Better Auth, Vitest, or Playwright is current P0 in `pj-general`; they are future candidates. Read a framework reference only after the PJ has adopted and pinned it.

## Preflight and risk decision

1. Identify the database engine and exact pinned version, target environment, table size and write rate, migration runner, transaction mode, deployment order, and every application version that can coexist.
2. Classify risk from evidence: local reversible changes may use a normal review path; shared, long-running, locking, rewriting, or data-changing work needs a tested rehearsal; production, destructive, irreversible, or availability-affecting work needs a named approver, window, monitoring, and recovery decision.
3. Inspect the target runner before authoring SQL. Record whether it wraps each migration in a transaction and how it records partial failure. Never infer this from the language or ORM.
4. Stop and ask for the missing owner, version, runner behavior, lock/rewrite estimate, compatibility plan, or recovery path. Do not substitute a generic recipe.

## Plan the change

1. Choose `expand -> backfill -> validate -> contract` for changes that must coexist with older application code:
   - **Expand:** add compatible shape or dual-write capability.
   - **Backfill:** run bounded, resumable, observable work outside long DDL transactions when appropriate.
   - **Validate:** verify correctness, constraints, query behavior, and rollback/roll-forward readiness.
   - **Contract:** remove old reads/writes or schema only after all supported deployments are clear.
2. Separate schema DDL, long-running backfills, and application deployment whenever their locks, retries, transaction semantics, or recovery differ.
3. Keep shared migration history immutable. Correct a deployed migration with a new migration; capture and reconcile any authorized emergency SQL.
4. Choose recovery before execution. Prefer roll-forward when rollback cannot safely restore changed data or when the runner cannot atomically undo the step; use rollback only when it is tested, reversible, and compatible with the deployed application state.

## PostgreSQL safety gate

- Verify the target-version documentation for every DDL statement. `ALTER TABLE` takes `ACCESS EXCLUSIVE` unless its specific subcommand says otherwise; lock level, scan, rewrite, disk, timeout, blockers, and execution window are separate checks.
- Treat a table rewrite or a validation scan as production-impacting until measured on representative data and contention. Do not claim that an `ADD COLUMN`, default, constraint, or drop is lock-free from memory.
- `CREATE INDEX CONCURRENTLY` cannot run inside a transaction block. Route it through a verified non-transactional runner path, monitor it, and include failed/invalid-index cleanup and retry handling.
- Do not put `COMMIT` or `ROLLBACK` in a `DO` block used by a runner that wraps work in a transaction. PostgreSQL permits transaction control only for eligible top-level `CALL`/`DO` invocation paths; verify the invocation context and use a separate resumable batch job by default.
- Keep backfills bounded, idempotent where possible, checkpointed, and observable. Do not hold an unbounded transaction merely to make a migration look atomic.

## Execute only after approval

1. Produce the migration, runner mode, deployment sequence, lock/timeout settings, monitoring signals, and recovery command or decision.
2. Rehearse against representative scale and contention; validate forwards, partial failure behavior, recovery, and application compatibility.
3. For production, obtain explicit approval for the exact target, window, operator, monitoring owner, stop threshold, and roll-forward/rollback decision before any external write.
4. During execution, stop on unexpected lock waits, rewrite duration, error rate, replication lag, invalid index, or failed validation. Preserve evidence and escalate; do not improvise destructive remediation.

## Required output

Return: scope and assumptions; pinned versions and official sources; risk and lock/rewrite findings; runner transaction mode; ordered expand/backfill/validate/contract steps; application compatibility window; verification and monitoring; recovery choice; and approvals or blockers. State clearly when the result is a plan rather than an authorized execution.

## Validate before completion

- Confirm migration ordering and immutability, runner mode, and no secrets in artifacts.
- Test the selected path at representative scale, including interruption or retry where relevant.
- Verify schema, data invariants, query behavior, application compatibility, and rollback or roll-forward outcome.
- For PostgreSQL, re-check the current official page for the target pinned version, not only the links below.

## Load references only when needed

- [PostgreSQL locks, rewrites, concurrent indexes, and batch work](references/postgresql-safety.md): PostgreSQL target or PostgreSQL-specific design.
- [Expand-backfill-validate-contract and anti-patterns](references/lifecycle.md): compatibility rollout or recovery design.
- [Prisma runner](references/prisma.md): only after Prisma is adopted and its version/transaction behavior is confirmed.
- [Drizzle candidate runner](references/drizzle.md): only after Drizzle is adopted, pinned, and its execution path is confirmed; never assume it is P0.
- [Kysely runner](references/kysely.md): only after Kysely and its runner are adopted and pinned.
- [Django runner](references/django.md): only after Django and the migration behavior are confirmed.
- [golang-migrate runner](references/golang-migrate.md): only after the CLI/library version and transaction behavior are confirmed.

Primary PostgreSQL sources: [ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html), [CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html), and [PL/pgSQL transaction management](https://www.postgresql.org/docs/current/plpgsql-transactions.html).
