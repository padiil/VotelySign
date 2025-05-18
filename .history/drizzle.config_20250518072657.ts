import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  driver: "pg", // Try with driver: "pg" instead of dialect
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
