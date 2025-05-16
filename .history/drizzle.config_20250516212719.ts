import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  driver: "pglite", 
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
  
