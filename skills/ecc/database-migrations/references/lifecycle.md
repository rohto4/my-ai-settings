# Expand, Backfill, Validate, Contract

Use this reference for compatibility-changing production work. Adapt it to the target PJ's canonical deployment and recovery policy.

## Core principles retained from the original skill

1. Use a tracked, repeatable change path. Emergency production SQL needs explicit authority, capture, and reconciliation into migration history.
2. Choose recovery before execution. Select rollback or roll-forward using the runner, deployment phase, data-loss risk, and a tested recovery path.
3. Separate long-running data work from DDL when their lock, retry, or deployment behavior differs.
4. Test with representative production scale and lock contention. Row count alone does not predict lock waits or rewrite cost.
5. Treat shared migrations as immutable. Do not edit one after it has run in a shared environment; add a corrective migration.

## Checklist

Before applying a migration, confirm:

- Rollback or roll-forward is explicit and tested for the current phase.
- Lock level, lock wait, table rewrite, scan cost, and execution window are understood.
- New columns and constraints remain compatible with every deployed application version.
- Index strategy matches the pinned database version and runner transaction mode.
- Data backfill is separate from schema change when their execution behavior differs.
- The change was tested against representative production data and contention.
- The recovery plan is documented with its approving owner.

## Rename or remove a column

Avoid a direct production rename when old and new application versions can coexist. Use an expand-contract sequence:

```sql
-- Step 1: migration 001
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: a separate, resumable data migration
UPDATE users SET display_name = username WHERE display_name IS NULL;

-- Step 3: deploy code that reads/writes the compatible shape.
-- Step 4: after the compatibility window, remove old reads/writes and then:
ALTER TABLE users DROP COLUMN username;
```

For column removal: remove application references, deploy that code, verify all supported deployments are clear, then drop the column in a later migration. A drop can be quick without immediately reclaiming storage; do not infer its lock, disk, or maintenance impact without target-version verification.

## Timeline example

```text
Day 1: add nullable new_status
Day 1: deploy compatible application code that writes both values
Day 2: run the bounded, resumable backfill
Day 3: deploy code that reads new_status
Day 7: after validation and compatibility clearance, remove old shape
```

## Anti-patterns

| Anti-pattern | Failure mode | Safer approach |
| --- | --- | --- |
| Manual production SQL | No audit trail or repeatability | Use a tracked migration; capture and reconcile authorized emergency work. |
| Editing deployed migrations | Environment drift | Add a corrective migration. |
| Assuming a required default is harmless | Lock/rewrite/version risk | Check the pinned engine version; use expand/backfill/validate/contract when needed. |
| Inline index on a large live table | Writers can block | Choose a target-version, runner-compatible index path. |
| Schema and long data work in one migration | Long transaction and difficult recovery | Separate them when their behavior differs. |
| Dropping a column before code is clear | Application failures | Remove code first; contract later. |
