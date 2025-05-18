import { sql } from "drizzle-orm";
import { createServerDbClient } from "../lib/db";
import * as schema from "../lib/schema";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Dynamically synchronizes database schema with code definitions
 * Works for any table and any column changes
 */
async function syncDatabaseSchema() {
  console.log("🔄 Starting dynamic schema synchronization...");
  const db = createServerDbClient();

  try {
    // Get all tables from schema.ts
    const schemaTables = Object.entries(schema)
      .filter(
        ([_, value]) =>
          typeof value === "object" && value !== null && "name" in value
      )
      .map(([_, table]) => ({
        name: table.name,
        columns: getTableColumns(table),
      }));

    console.log(`Found ${schemaTables.length} tables in schema definition`);

    // Process each table
    for (const table of schemaTables) {
      console.log(`\n📊 Processing table: ${table.name}`);

      // Check if table exists
      const tableExists = await checkIfTableExists(db, table.name);

      if (!tableExists) {
        console.log(
          `Table ${table.name} doesn't exist in database - migrations should create it`
        );
        continue;
      }

      // Get existing columns in database
      const existingColumns = await getExistingColumns(db, table.name);
      console.log(
        `Found ${existingColumns.length} existing columns in database`
      );

      // Find missing columns
      const missingColumns = table.columns.filter(
        (col) =>
          !existingColumns.some((dbCol) => dbCol.column_name === col.name)
      );

      if (missingColumns.length === 0) {
        console.log(`✅ All columns exist for ${table.name}`);
        continue;
      }

      console.log(
        `Found ${missingColumns.length} missing columns to add: ${missingColumns
          .map((c) => c.name)
          .join(", ")}`
      );

      // Add each missing column
      for (const column of missingColumns) {
        try {
          const dataType = mapToPostgresType(column.type);
          const alterSql = sql`ALTER TABLE ${sql.identifier(
            table.name
          )} ADD COLUMN IF NOT EXISTS ${sql.identifier(column.name)} ${sql.raw(
            dataType
          )}`;

          console.log(
            `Adding column: ${column.name} (${dataType}) to ${table.name}`
          );
          await db.execute(alterSql);
          console.log(`✅ Added column ${column.name} to ${table.name}`);
        } catch (error) {
          console.error(`❌ Failed to add column ${column.name}:`, error);
        }
      }
    }

    console.log("\n✅ Schema synchronization completed!");
    return true;
  } catch (error) {
    console.error("❌ Schema sync failed:", error);
    throw error;
  }
}

/**
 * Extract columns from a Drizzle table definition
 */
function getTableColumns(table) {
  // Better way to extract column definitions
  const columns = [];

  for (const [key, value] of Object.entries(table)) {
    // Skip special properties and functions
    if (
      key === "name" ||
      key === "_" ||
      typeof value === "function" ||
      key.startsWith("$")
    ) {
      continue;
    }

    // Ensure it's a column definition by checking for common properties
    if (
      value &&
      typeof value === "object" &&
      ("name" in value || "dataType" in value)
    ) {
      columns.push({
        name: key,
        type: getColumnType(value),
      });
    }
  }

  return columns;
}

/**
 * Get column type from column definition
 */
function getColumnType(column) {
  // Try to extract type from the column definition
  if (column.dataType && column.dataType.type) {
    return column.dataType.type;
  }

  return guessColumnType(column);
}

/**
 * Try to determine column type from Drizzle column definition
 */
function guessColumnType(column) {
  // Look for known type properties
  for (const type of [
    "serial",
    "integer",
    "text",
    "boolean",
    "timestamp",
    "jsonb",
    "varchar",
    "uuid",
    "date",
    "time",
    "float",
    "double",
    "decimal",
  ]) {
    if (type in column) {
      return type;
    }
  }

  // If we have a name that might indicate the type
  if (column.name && typeof column.name === "string") {
    const name = column.name.toLowerCase();
    if (name.includes("serial")) return "serial";
    if (name.includes("int")) return "integer";
    if (name.includes("bool")) return "boolean";
    if (name.includes("time") || name.includes("date")) return "timestamp";
  }

  return "text"; // Default to text if unknown
}

/**
 * Map Drizzle types to PostgreSQL types
 */
function mapToPostgresType(type) {
  const typeMap = {
    serial: "SERIAL",
    integer: "INTEGER",
    text: "TEXT",
    boolean: "BOOLEAN",
    timestamp: "TIMESTAMP",
    jsonb: "JSONB",
    uuid: "UUID",
    varchar: "VARCHAR(255)",
    date: "DATE",
    time: "TIME",
    float: "REAL",
    double: "DOUBLE PRECISION",
    decimal: "NUMERIC",
  };

  return typeMap[type] || "TEXT";
}

/**
 * Check if a table exists in the database
 */
async function checkIfTableExists(db, tableName) {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = ${tableName}
      );
    `);

    return result.rows?.[0]?.exists === true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Get existing columns for a table from the database
 */
async function getExistingColumns(db, tableName) {
  try {
    const result = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = ${tableName};
    `);

    return result.rows || [];
  } catch (error) {
    console.error(`Error getting columns for table ${tableName}:`, error);
    return [];
  }
}

// Run the sync if this file is executed directly
if (require.main === module) {
  syncDatabaseSchema()
    .then(() => {
      console.log("Schema synchronization completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Schema synchronization failed:", err);
      process.exit(1);
    });
}

export { syncDatabaseSchema };
