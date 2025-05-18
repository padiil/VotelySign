import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  driver: "d1-http", // Changed to supported driver type
  dbCredentials: {
    accountId: process.env.ACCOUNT_ID!,
    databaseId: process.env.DATABASE_ID!,
    token: process.env.DATABASE_TOKEN!,
  },
});
