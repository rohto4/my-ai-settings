# Legacy and Platform-Specific Examples

This file preserves source-derived examples for recognition and migration only. They are outside the active path: do not apply them as defaults. Re-evaluate against the target workload, PostgreSQL version, managed platform, and operator approval.

## Legacy type table

| Earlier heuristic | Why it is not a default |
| --- | --- |
| IDs: `bigint`; avoid random UUID | ID locality, generation, replication, exposure, and interoperability decide this. |
| Strings: `text`; avoid `varchar(255)` | A semantic maximum may be valid; `text` is not inherently the correct domain model. |
| Timestamps: `timestamptz`; avoid `timestamp` | The domain's time-zone semantics and external contracts decide this. |
| Money: `numeric(10,2)`; avoid `float` | Currency, scale, rounding, and range must be specified. |
| Flags: `boolean`; avoid `varchar`/`int` | Use an enum or relation when the state is not binary. |

## Supabase-specific RLS example

```sql
-- LEGACY / PLATFORM-SPECIFIC: `auth.uid()` is not PostgreSQL built-in.
CREATE POLICY policy ON orders
  USING ((SELECT auth.uid()) = user_id);
```

Only use an equivalent policy after verifying the platform-provided function, caller role, JWT/session trust model, ownership, bypass behavior, and target version. See the active RLS review in `runtime-and-diagnostics.md`.

## Legacy configuration template

```sql
-- LEGACY: broad runtime changes require capacity evidence and operator approval.
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET work_mem = '8MB';
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';
ALTER SYSTEM SET statement_timeout = '30s';
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
REVOKE ALL ON SCHEMA public FROM public;
SELECT pg_reload_conf();
```

These statements may require privileges, restarts or reloads, affect other workloads, and have platform-specific restrictions. Do not run them from this skill. Verify all behavior in the target-version official documentation and the deployment policy.
