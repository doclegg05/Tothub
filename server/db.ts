import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if we're using SQLite or PostgreSQL
const databaseUrl = process.env.DATABASE_URL || 'sqlite:./daycare_checkins.db';

let db: any;
let pool: any = null;

if (databaseUrl.startsWith('sqlite:')) {
  // Use SQLite
  const dbPath = databaseUrl.replace('sqlite:', '');
  const sqlite = new Database(dbPath);
  db = drizzleSQLite(sqlite, { schema });
} else {
  // Use PostgreSQL
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
}

export { db, pool };