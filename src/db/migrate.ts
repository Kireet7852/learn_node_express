import db from "./client.js";

/**
 * Runs all DDL migrations in order.
 * Called once at server startup — safe to re-run (uses IF NOT EXISTS).
 */
export function runMigrations(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    )
  `);

  console.log("[db] Migrations applied.");
}
