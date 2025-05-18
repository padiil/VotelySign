import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql", // Use dialect instead of driver
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
