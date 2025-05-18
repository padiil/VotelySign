import { createServerDbClient } from "../lib/db";
import * as fs from "fs";
import * as path from "path";

const migrationsDir = path.join(__dirname, "migrations");

const runMigrations = async () => {
  const db = createServerDbClient();

  try {
    // Membaca semua file migrasi di folder migrations
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"));

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      console.log(`Running migration: ${file}`);
      await db.execute(sql); // Menjalankan SQL dari file
    }

    console.log("All migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

runMigrations();
