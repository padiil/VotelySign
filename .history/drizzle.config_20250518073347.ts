import { defineConfig } from "drizzle-kit"; // 👈 khusus untuk PostgreSQL
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
