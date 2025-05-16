// lib/schema.ts
import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

// Define your tables
export const elections = pgTable("elections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  election_id: text("election_id").notNull(),
  name: text("name").notNull(),
  photo_url: text("photo_url"),
});

// Add more tables as needed
