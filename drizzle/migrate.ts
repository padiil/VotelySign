import "dotenv/config";
import { migrate } from "drizzle-orm/neon-http/migrator"; // atau sesuaikan dengan client yang kamu pakai
import { fileURLToPath } from "url";
import path from "path";
import { db } from "@/lib/db";
import dotenv from "dotenv";

dotenv.config();
// Fix untuk ES module: dapatkan __dirname secara manual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path ke folder migrations
const migrationsDir = path.join(__dirname, "migrations");

console.log("Running migrations from:", migrationsDir);

(async () => {
  await migrate(db as any, { migrationsFolder: migrationsDir });
  console.log("✅ Migration completed!");
})();
