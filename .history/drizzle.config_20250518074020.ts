import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import * as schema from "./lib/schema";

// Initialize neon client
const sql_client = neon(process.env.DATABASE_URL || "");

// Initialize drizzle with neon client
export const db = drizzle(sql_client, { schema });

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
