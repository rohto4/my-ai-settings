# Drizzle Candidate Runner

Drizzle is a future candidate for `pj-general`, not an assumed current P0 dependency. Load this reference only after the PJ explicitly adopts and pins Drizzle, and inspect the actual `drizzle.config.*`, package scripts, database dialect, and migration execution path.

Validate commands against the current [Drizzle Kit overview](https://orm.drizzle.team/docs/kit-overview), [generate](https://orm.drizzle.team/docs/drizzle-kit-generate), and [migrate](https://orm.drizzle.team/docs/drizzle-kit-migrate) documentation. Never place credentials in `drizzle.config.*`, commands, logs, or generated artifacts.

## Retained workflow examples

```powershell
# Generate SQL migrations from the adopted, pinned schema.
npx drizzle-kit generate

# Apply generated migrations through the verified PJ path.
npx drizzle-kit migrate

# Direct schema push has no tracked SQL migration file; use only when the PJ
# explicitly approves that workflow. It is not the default production path.
npx drizzle-kit push
```

## Retained PostgreSQL schema example

```typescript
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

For `CONCURRENTLY`, table rewrites, or resumable backfills, preserve the PostgreSQL safety gate: first prove whether the adopted runner can run the operation outside a transaction and how failure is recorded. Do not infer it from Drizzle's presence.
