import { migrate } from "drizzle-orm/neon-http/migrator"; // atau sesuaikan dengan client yang kamu pakai
import { db } from "@"; // ganti sesuai path ke instance drizzle kamu
import { fileURLToPath } from "url";
import path from "path";

// Fix untuk ES module: dapatkan __dirname secara manual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path ke folder migrations
const migrationsDir = path.join(__dirname, "migrations");

console.log("Running migrations from:", migrationsDir);

await migrate(db, { migrationsFolder: migrationsDir });

console.log("✅ Migration completed!");
