import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle", // folder output migration/generated files
  schema: "./schema.ts", // lokasi file schema kamu
  driver: "pg", // driver database
  dialect: "postgresql", // dialect database (harus disesuaikan)
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!, // pastikan env var sudah ada
  },
});
