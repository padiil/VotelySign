import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default {
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
