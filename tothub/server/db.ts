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
  
  // Initialize SQLite database with required tables
  try {
    // Create sessions table if it doesn't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        login_time TEXT NOT NULL,
        last_activity TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        end_time TEXT,
        end_reason TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    
    // Create session_activity table if it doesn't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS session_activity (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        action TEXT NOT NULL,
        path TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    
    // Create other essential tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        position TEXT NOT NULL,
        hourly_rate REAL DEFAULT 0.0,
        hire_date TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    
    // Ensure missing columns exist on existing installations
    try {
      const staffColumns = sqlite.prepare(`PRAGMA table_info(staff)`).all() as Array<{ name: string }>;
      const columnNames = new Set(staffColumns.map((c) => c.name));
      
      const addColumnIfMissing = (name: string, ddl: string) => {
        if (!columnNames.has(name)) {
          sqlite.exec(`ALTER TABLE staff ADD COLUMN ${ddl}`);
        }
      };
      
      // Columns expected by application schema (@shared/schema)
      addColumnIfMissing('w4_allowances', 'w4_allowances INTEGER DEFAULT 0');
      addColumnIfMissing('additional_tax_withholding', 'additional_tax_withholding INTEGER DEFAULT 0');
      addColumnIfMissing('face_descriptor', 'face_descriptor TEXT');
      addColumnIfMissing('fingerprint_hash', 'fingerprint_hash TEXT');
      
      // Optional biometric fields referenced in types
      addColumnIfMissing('biometric_enrolled_at', 'biometric_enrolled_at TEXT');
      addColumnIfMissing('biometric_enabled', 'biometric_enabled INTEGER DEFAULT 0');
      
      // Align boolean-ish columns to integer defaults if missing
      addColumnIfMissing('is_active', 'is_active INTEGER DEFAULT 1');
    } catch (migrateErr) {
      console.warn('⚠️ SQLite staff table migration warning:', migrateErr);
    }
    
    // Ensure unique index on staff.email to match application expectations
    try {
      sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS staff_email_unique ON staff(email)`);
    } catch (indexErr) {
      console.warn('⚠️ SQLite staff.email unique index warning:', indexErr);
    }
    
    // Create staff_schedules table if it doesn't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS staff_schedules (
        id TEXT PRIMARY KEY,
        staff_id TEXT NOT NULL,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_available INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (staff_id) REFERENCES staff(id)
      )
    `);
    
    console.log('✅ SQLite database initialized with required tables');
  } catch (error) {
    console.warn('⚠️ SQLite table creation warning:', error);
  }
  
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

  // Best-effort schema alignment for PostgreSQL deployments
  // Ensures required staff columns and unique index exist
  async function runPostgresMigrations() {
    try {
      await pool!.query(`
        ALTER TABLE IF EXISTS staff
          ADD COLUMN IF NOT EXISTS w4_allowances INTEGER DEFAULT 0,
          ADD COLUMN IF NOT EXISTS additional_tax_withholding INTEGER DEFAULT 0,
          ADD COLUMN IF NOT EXISTS face_descriptor TEXT,
          ADD COLUMN IF NOT EXISTS fingerprint_hash TEXT,
          ADD COLUMN IF NOT EXISTS biometric_enrolled_at TEXT,
          ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1,
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
      `);
    } catch (e) {
      console.warn('⚠️ PostgreSQL staff table migration warning:', e);
    }
    try {
      await pool!.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS staff_email_unique ON staff(email);
      `);
    } catch (e) {
      console.warn('⚠️ PostgreSQL staff.email unique index warning:', e);
    }
  }
  // Fire and forget
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  runPostgresMigrations();
}

export { db, pool };