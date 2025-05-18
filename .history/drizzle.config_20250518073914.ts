import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional: Configure pool settings
  // max: 10, // Maximum number of clients in the pool
  // idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});

// Initialize drizzle with the pg pool
export const db = drizzle(pool);

// Optional: Simple ping function to verify connection
export async function pingDatabase() {
  try {
    const result = await db.execute(sql`SELECT 1 AS ping`);
    console.log("Database connected successfully:", result);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}
