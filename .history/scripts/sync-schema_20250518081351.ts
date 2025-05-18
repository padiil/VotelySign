import { sql } from "drizzle-orm";
import { createServerDbClient } from "../lib/db";
import * as schema from "../lib/schema";
import * as dotenv from "dotenv";
dotenv.config();

// Define types
type DbClient = ReturnType<typeof createServerDbClient>;

interface ColumnDefinition {
  name: string;
  type: string;
}

interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
}

interface DbColumn {
  column_name: string;
  data_type: string;
}

// Add this interface to represent Drizzle tables
interface DrizzleTable {
  name: string;
  [key: string]: any;
}

/**
 * Type guard to check if an object is a Drizzle table
 */
/**
 * Type guard to check if an object is a Drizzle table
 */
function isDrizzleTable(obj: any): obj is DrizzleTable {
    // Check if it's a potential table object
    if (typeof obj !== "object" || obj === null) {
      return false;
    }
    
    // Check for Drizzle table structure - name can be accessed via different paths
    return (
      // Check common paths for table name in Drizzle structures
      (obj.$type === "table" && typeof obj._.name === "string") || // Most common location
      (obj._ && typeof obj._.name === "string") ||
      (typeof obj.name === "string") // Fallback for simple tables
    );
  }
  
  /**
   * Get table name from Drizzle table object
   */
  function getTableName(table: any): string {
    if (table._ && typeof table._.name === "string") {
      return table._.name;
    }
    if (typeof table.name === "string") {
      return table.name;
    }
    throw new Error("Could not determine table name");
  }

/**
 * Dynamically synchronizes database schema with code definitions
 */
async function syncDatabaseSchema(): Promise<boolean> {
  console.log("🔄 Starting dynamic schema synchronization...");
  const db = createServerDbClient();

  try {
    // Get all tables from schema.ts with proper type checking
    const schemaTables: TableDefinition[] = Object.entries(schema)
      .filter(([_, value]) => isDrizzleTable(value))
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
        `Found ${
          existingColumns.length
        } existing columns in database: ${existingColumns
          .map((c) => c.column_name)
          .join(", ")}`
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

          // Fixed: Use parameterized SQL to avoid SQL injection
          const alterSql = sql`ALTER TABLE ${sql.identifier(table.name)} 
            ADD COLUMN IF NOT EXISTS ${sql.identifier(column.name)} ${sql.raw(
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
function getTableColumns(table: DrizzleTable): ColumnDefinition[] {
  // Better way to extract column definitions
  const columns: ColumnDefinition[] = [];

  for (const [key, value] of Object.entries(table)) {
    // Skip special properties and functions
    if (
      key === "name" ||
      key === "_" ||
      typeof value === "function" ||
      key.startsWith("$") ||
      value === null ||
      typeof value !== "object"
    ) {
      continue;
    }

    // Fixed: More robust checking for column definitions
    if (
      "name" in value ||
      "dataType" in value ||
      "type" in value ||
      "default" in value ||
      "notNull" in value
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
function getColumnType(column: Record<string, any>): string {
  // Try to extract type from the column definition
  if (column.dataType && column.dataType.type) {
    return column.dataType.type;
  }

  return guessColumnType(column);
}

/**
 * Try to determine column type from Drizzle column definition
 */
function guessColumnType(column: Record<string, any>): string {
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

  // If we have a name property that might indicate the type
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
function mapToPostgresType(type: string): string {
  const typeMap: Record<string, string> = {
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

  return typeMap[type.toLowerCase()] || "TEXT";
}

/**
 * Check if a table exists in the database
 */
async function checkIfTableExists(
  db: DbClient,
  tableName: string
): Promise<boolean> {
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
async function getExistingColumns(
  db: DbClient,
  tableName: string
): Promise<DbColumn[]> {
  try {
    const result = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = ${tableName};
    `);

    if (!result.rows || !Array.isArray(result.rows)) {
      console.warn(
        `Unexpected response format when querying columns for ${tableName}`
      );
      return [];
    }

    // Cast and verify the result has the expected structure
    return result.rows.map((row) => ({
      column_name: String(row.column_name || ""),
      data_type: String(row.data_type || ""),
    }));
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
