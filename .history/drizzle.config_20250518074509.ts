import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Parse DATABASE_URL if using Neon or other PostgreSQL providers
// Format is typically: postgres://user:password@host:port/database
const url = new URL(process.env.DATABASE_URL);
const [username, password] =
  url.username && url.password ? [url.username, url.password] : [];
const database = url.pathname.substring(1); // Remove leading slash

export default {
  schema: "./lib/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: url.hostname,
    port: url.port ? parseInt(url.port) : 5432,
    user: username,
    password: password,
    database: database,
    ssl: true, // Enable SSL for Neon and most cloud providers
  },
} satisfies Config;
