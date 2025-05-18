import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

const config: Config = {
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",  // Update output path to match migrate.ts
  driver: "d1-http",            // Use "d1-http" as required by Config type
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!, 
  },
};

export default config;