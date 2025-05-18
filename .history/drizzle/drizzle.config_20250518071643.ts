import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

const config: Config = {
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",  // Update output path to match migrate.ts
  driver: "pg",                 // Use "driver" instead of "dialect"
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!, 
  },
};

export default config;