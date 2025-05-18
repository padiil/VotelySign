import { createServerDbClient } from "../lib/db";
import * as fs from "fs";
import * as path from "path";

const migrationsDir = path.join(__dirname, "migrations");

const runMigrations = async () => {
  const db = createServerDbClient();

  try {
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".ts"));

    for (const file of migrationFiles) {
      const migration = await import(path.join(migrationsDir, file));
      console.log(`Running migration: ${file}`);
      await migration.up(db);
    }

    console.log("All migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

runMigrations();
