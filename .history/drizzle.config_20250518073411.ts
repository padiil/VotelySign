import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  driver: "pg",
  dbCredentials: {
    accountId: process.env.DRIZZLE_ACCOUNT_ID!,
    databaseId: process.env.DRIZZLE_DATABASE_ID!,
    token: process.env.DRIZZLE_TOKEN!,
  },
});
