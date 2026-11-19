import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = `
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  home_surface TEXT NOT NULL DEFAULT '',
  play_level TEXT NOT NULL DEFAULT '',
  weekly_hours REAL,
  email_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify','reset')),
  next_path TEXT NOT NULL DEFAULT '/me',
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS email_tokens_user ON email_tokens(user_id, purpose);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_reset ON rate_limits(reset_at);

CREATE TABLE IF NOT EXISTS locker_items (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('using','retired','want')),
  size TEXT NOT NULL DEFAULT '',
  width TEXT NOT NULL DEFAULT '',
  hours REAL,
  price_paid REAL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, product_slug)
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  switched_from_slug TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('kept','returned','rejected','testing')),
  comfort INTEGER CHECK (comfort BETWEEN 1 AND 5),
  size TEXT NOT NULL DEFAULT '',
  width TEXT NOT NULL DEFAULT '',
  surface TEXT NOT NULL DEFAULT '',
  hours REAL,
  felt_different TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  wear_location TEXT NOT NULL DEFAULT '',
  string_setup TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS reports_product ON reports(product_slug);
CREATE INDEX IF NOT EXISTS reports_user ON reports(user_id);

-- Survives a deleted report, so deleting cannot reopen the one-report-per-day limit.
CREATE TABLE IF NOT EXISTS report_submissions (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  day TEXT NOT NULL,
  PRIMARY KEY (user_id, product_slug, day)
);

CREATE TABLE IF NOT EXISTS helpful_votes (
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (report_id, user_id)
);

CREATE TABLE IF NOT EXISTS xp_events (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_key TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, event_key)
);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id INTEGER PRIMARY KEY,
  offer_id TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  entry_point TEXT NOT NULL DEFAULT 'direct',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const globalForDb = globalThis as unknown as { __triedKeptDb?: DatabaseSync };

/** Brings a database created by an earlier version up to the current schema. */
function migrate(db: DatabaseSync): void {
  const columns = db.prepare("PRAGMA table_info(users)").all() as unknown as { name: string }[];
  if (!columns.some((column) => column.name === "email_verified_at")) {
    db.exec("ALTER TABLE users ADD COLUMN email_verified_at TEXT");
  }
}

export function openDb(file: string): DatabaseSync {
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);
  migrate(db);
  return db;
}

/**
 * Picks where the database lives. A blank DATABASE_PATH (as in .env.example) is
 * ignored, because SQLite treats an empty path as a throwaway database. On Railway,
 * an attached volume sets RAILWAY_VOLUME_MOUNT_PATH, so data survives redeploys.
 */
export function resolveDbPath(env: Record<string, string | undefined> = process.env, cwd = process.cwd()): string {
  if (env.DATABASE_PATH) return env.DATABASE_PATH;
  if (env.RAILWAY_VOLUME_MOUNT_PATH) return path.join(env.RAILWAY_VOLUME_MOUNT_PATH, "app.db");
  return path.join(cwd, "data", "app.db");
}

export function getDb(): DatabaseSync {
  if (!globalForDb.__triedKeptDb) {
    const env = process.env;
    if (env.RAILWAY_ENVIRONMENT_NAME && !env.DATABASE_PATH && !env.RAILWAY_VOLUME_MOUNT_PATH) {
      console.warn("No Railway volume is attached. Accounts and reports will be lost on the next deploy.");
    }
    globalForDb.__triedKeptDb = openDb(resolveDbPath(env));
  }
  return globalForDb.__triedKeptDb;
}

/** Closes the shared database if it was opened. Safe to call more than once. */
export function closeDb(): void {
  const db = globalForDb.__triedKeptDb;
  globalForDb.__triedKeptDb = undefined;
  db?.close();
}
