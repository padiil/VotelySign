import { migrate } from "drizzle-orm/neon-http/migrator";
import { createServerDbClient } from "../lib/db";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const db = createServerDbClient();
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "drizzle/migrations" });
  console.log("Migrations complete!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
