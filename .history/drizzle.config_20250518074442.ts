import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default {
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  driver: "pg", // Keep driver
  dialect: "postgresql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  // Add this option which is needed in some versions
  verbose: true,
  strict: true,
} satisfies Config;
