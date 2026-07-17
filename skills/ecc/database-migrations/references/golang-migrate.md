# golang-migrate Runner

Load only after `golang-migrate` is adopted, the CLI/library version and database driver are pinned, and the target transaction behavior is verified. Consult the current [official repository and CLI documentation](https://github.com/golang-migrate/migrate) before execution.

## Retained workflow examples

```powershell
migrate create -ext sql -dir migrations -seq add_user_avatar
migrate -path migrations -database "$env:DATABASE_URL" up
migrate -path migrations -database "$env:DATABASE_URL" down 1

# Reconcile dirty state only with explicit diagnosis and approval.
migrate -path migrations -database "$env:DATABASE_URL" force VERSION
```

Never place a real connection string in source control, task output, shell history, or CI logs. Use the PJ's approved secret-injection mechanism instead.

## Retained migration-pair example

```sql
-- migrations/000003_add_user_avatar.up.sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;
CREATE INDEX CONCURRENTLY idx_users_avatar
  ON users (avatar_url) WHERE avatar_url IS NOT NULL;
```

```sql
-- migrations/000003_add_user_avatar.down.sql
DROP INDEX IF EXISTS idx_users_avatar;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
```

The paired-file convention does not make a production change reversible. Verify runner transaction behavior before `CONCURRENTLY`, and prefer roll-forward when down migration would lose changed data or conflict with deployed application versions.
