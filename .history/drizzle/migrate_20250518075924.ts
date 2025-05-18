import { migrate } from "drizzle-orm/neon-http/migrator";
import { createServerDbClient } from "../lib/db";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
import { syncDatabaseSchema } from "@/scripts/sync-schema";
dotenv.config();

async function main() {
  const db = createServerDbClient();
  console.log("Running migrations...");

  try {
    // Create drizzle migrations table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "_drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      )
    `);

    // Try standard migrations first
    try {
      await migrate(db, { migrationsFolder: "drizzle/migrations" });
      console.log("Standard migrations complete!");
    } catch (migrationError) {
      console.log(
        "Some migration errors occurred, falling back to schema sync"
      );
      console.error(migrationError);
    }

    // Always run schema sync to ensure all columns exist
    console.log("Running dynamic schema synchronization...");
    await syncDatabaseSchema();
  } catch (error) {
    console.error("Migration process failed:", error);
    throw error;
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
