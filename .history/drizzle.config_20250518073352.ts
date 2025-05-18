import { defineConfig } from "drizzle-kit/pg"; // 👈 khusus untuk PostgreSQL
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
