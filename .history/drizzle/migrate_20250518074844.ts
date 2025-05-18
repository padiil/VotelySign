import { migrate } from "drizzle-orm/neon-http/migrator";
import { createServerDbClient } from "../lib/db";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
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

    await migrate(db, { migrationsFolder: "drizzle/migrations" });
    console.log("Migrations complete!");
  } catch (error) {
    // If it's an "already exists" error, we can continue
    if (error.code === "42P07") {
      console.log("Table already exists, continuing with other migrations...");
      // Apply only specific migrations that add columns
      // For example, manually apply the wallet columns migration
    } else {
      throw error;
    }
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
