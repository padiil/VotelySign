import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Create a singleton Neon client for server-side
let serverDbInstance: ReturnType<typeof drizzle> | null = null;

export const createServerDbClient = () => {
  if (serverDbInstance) return serverDbInstance;

  const sql = neon(process.env.DATABASE_URL!);
  serverDbInstance = drizzle(sql);
  return serverDbInstance;
};

// For client-side, we'll use a different approach since exposing database URL to client is unsafe
// You would typically use API routes instead of direct client database access
