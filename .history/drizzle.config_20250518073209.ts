import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  driver: "pg", // Changed to PostgreSQL driver
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
