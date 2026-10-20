import { Database } from "bun:sqlite";
import { config } from "../config/env.js";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Ensure the data directory exists before opening the file
mkdirSync(dirname(config.dbPath), { recursive: true });

// Single shared connection — Bun's SQLite is synchronous and not pooled
const db = new Database(config.dbPath, { strict: true });

// WAL mode for better concurrent read performance
db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA foreign_keys = ON;");

export default db;
