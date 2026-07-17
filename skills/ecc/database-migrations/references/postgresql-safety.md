# PostgreSQL Locks, Rewrites, and Non-Transactional Work

Read this only for a PostgreSQL target. Use the documentation page matching the pinned PostgreSQL version before executing; this file is a design aid, not a version guarantee.

## Evidence to collect

- Exact `ALTER TABLE` subcommands, target PostgreSQL version, table and index sizes, disk headroom, active transactions, replication topology, timeout policy, and acceptable write impact.
- Runner transaction mode and the recovery procedure for an interrupted command.
- A rehearsal that reflects production data volume and lock contention. Row count alone does not predict lock waits or rewrite cost.

## SQL examples requiring target-version review

### Adding a column

```sql
-- ALTER TABLE still has a strong lock by default.
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Whether this avoids a row-by-row rewrite depends on the pinned PostgreSQL
-- version and the expression. Verify the target-version documentation first.
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
```

Do not call `ADD COLUMN` lock-free. PostgreSQL documents `ACCESS EXCLUSIVE` as the default `ALTER TABLE` lock unless a subcommand explicitly states otherwise. Check lock acquisition, blockers, table rewrite, scan cost, timeout, and execution window.

For required values on existing rows, use the expand/backfill/validate/contract sequence. For a constraint, assess an add-without-full-validation path and a later validation only after checking the target-version documentation.

### Concurrent index

```sql
-- A normal build can block writers while it runs.
CREATE INDEX idx_users_email ON users (email);

-- Use only through a verified non-transactional runner path.
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
```

`CREATE INDEX CONCURRENTLY` permits inserts, updates, and deletes while the index is built, but it takes more work and time, waits on transactions, cannot run in a transaction block, and can leave an invalid index after failure. Plan monitoring, failure cleanup, and retry. Do not run concurrent index builds concurrently on the same table without checking the current PostgreSQL restriction.

### Bounded data migration

```sql
-- One bounded batch. Invoke repeatedly from a resumable external job.
WITH batch AS (
  SELECT id
  FROM users
  WHERE normalized_email IS NULL
  ORDER BY id
  LIMIT 10000
  FOR UPDATE SKIP LOCKED
)
UPDATE users AS target
SET normalized_email = LOWER(target.email)
FROM batch
WHERE target.id = batch.id
RETURNING target.id;
```

Choose the predicate, batch size, checkpoint, retry rule, and idempotency from measured workload behavior. Commit each invocation according to the verified PJ runner and operations policy; do not introduce a long transaction simply to keep all batches together.

Do not copy a `DO` block containing `COMMIT` into a migration runner that wraps migrations in a transaction. PostgreSQL permits transaction control only in eligible top-level `CALL` or `DO` paths. Use a separate resumable job unless the invocation context and recovery behavior are explicitly verified.

## Current official sources

- [PostgreSQL `ALTER TABLE`](https://www.postgresql.org/docs/current/sql-altertable.html): default lock level, scan/rewrite notes, constraints, and partition behavior.
- [PostgreSQL `CREATE INDEX`](https://www.postgresql.org/docs/current/sql-createindex.html): concurrent index behavior, transaction-block restriction, and invalid-index recovery.
- [PostgreSQL transaction management](https://www.postgresql.org/docs/current/plpgsql-transactions.html): `CALL`/`DO` transaction-control eligibility.
