import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "../lib/schema";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("Generating migrations...");
  await migrate(db, { migrationsFolder: "drizzle/migrations" });
  console.log("Migrations generated!");
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
