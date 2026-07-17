# Kysely Runner

Load only after Kysely and the selected migration runner are adopted and pinned. Check the current official Kysely documentation and the PJ's package scripts before executing; the retained examples below do not establish a runner's transaction mode.

## Retained CLI workflow example

```powershell
kysely init
kysely migrate make add_user_avatar
kysely migrate latest
kysely migrate down
kysely migrate list
```

## Retained migration-file example

```typescript
import { type Kysely, sql } from "kysely";

// Migrations are frozen in time; do not depend on the current schema type.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("user_profile")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("avatar_url", "text")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await db.schema
    .createIndex("idx_user_profile_avatar")
    .on("user_profile")
    .column("avatar_url")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user_profile").execute();
}
```

## Retained programmatic migrator example

```typescript
import { FileMigrationProvider, Migrator } from "kysely";
import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// This path calculation is for ESM. A CJS runner can use __dirname instead.
const migrationFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "./migrations",
);

const migrator = new Migrator({
  db, // Use a Kysely<any> migration database instance.
  provider: new FileMigrationProvider({ fs, path, migrationFolder }),
  // Enable unordered migrations only after the PJ explicitly accepts drift risk.
  // allowUnorderedMigrations: true,
});

const { error, results } = await migrator.migrateToLatest();

results?.forEach((it) => {
  if (it.status === "Success") console.log(`migration "${it.migrationName}" executed successfully`);
  else if (it.status === "Error") console.error(`failed to execute migration "${it.migrationName}"`);
});

if (error) {
  process.exitCode = 1;
}
```

For PostgreSQL `CONCURRENTLY` operations, do not use this template until the installed runner's transaction mode and a non-transactional path have been verified.
