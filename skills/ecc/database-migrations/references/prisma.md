# Prisma Runner

Load only after Prisma is adopted, the installed version is pinned, and the target runner's transaction behavior is inspected. Verify every command against the current [Prisma Migrate documentation](https://www.prisma.io/docs/orm/prisma-migrate) and the PJ's package scripts before use.

## Retained workflow examples

```powershell
# Create a development migration from schema changes.
npx prisma migrate dev --name add_user_avatar

# Apply pending migrations in a deployment environment.
npx prisma migrate deploy

# Reset a development database only; it destroys data.
npx prisma migrate reset

# Generate the client after schema changes when the PJ requires it.
npx prisma generate
```

For operations not expressible in the schema, such as concurrent indexes or a data backfill, create a tracked migration or separate job only after checking the runner's transaction mode:

```powershell
npx prisma migrate dev --create-only --name add_email_index
```

```sql
-- migrations/<timestamp>_add_email_index/migration.sql
-- Run this only through a verified non-transactional path.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users (email);
```

Example schema retained for an adopted Prisma project:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatarUrl String?  @map("avatar_url")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  orders    Order[]

  @@map("users")
  @@index([email])
}
```
