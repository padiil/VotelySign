// lib/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create a singleton Neon client for server-side
let serverDbInstance: ReturnType<typeof drizzle> | null = null;

export const createServerDbClient = () => {
  if (serverDbInstance) return serverDbInstance;

  const sql = neon(process.env.DATABASE_URL!);
  serverDbInstance = drizzle(sql, { schema });
  return serverDbInstance;
};
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });