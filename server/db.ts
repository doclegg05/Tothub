import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";
import Database from "better-sqlite3";
import { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Check if we're using SQLite or PostgreSQL
const databaseUrl = process.env.DATABASE_URL || "sqlite:./daycare_checkins.db";

let db: any;
let pool: any = null;

if (databaseUrl.startsWith("sqlite:")) {
  // Use SQLite
  const dbPath = databaseUrl.replace("sqlite:", "");
  const sqlite = new Database(dbPath);
  // SQLite performance pragmas (safe defaults)
  try {
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("synchronous = NORMAL");
    sqlite.pragma("cache_size = -16000"); // ~16MB cache
    sqlite.pragma("temp_store = MEMORY");
    sqlite.pragma("mmap_size = 268435456"); // 256MB if supported
  } catch (e) {
    console.warn("SQLite PRAGMA configuration failed:", e);
  }
  db = drizzleSQLite(sqlite, { schema });
} else {
  // Use PostgreSQL
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?"
    );
  }
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
}

export { db, pool };
