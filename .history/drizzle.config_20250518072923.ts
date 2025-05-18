import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  driver: "d1", // Changed from "pg" to "d1"
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
});
