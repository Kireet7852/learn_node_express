import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client.js";
import { config } from "../config/env.js";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Ensure the data directory exists before opening the file
// (strip the "file:" prefix from the URL to get the path)
mkdirSync(dirname(config.databaseUrl.replace(/^file:/, "")), { recursive: true });

// Prisma 7 connects through a driver adapter. The LibSQL adapter speaks the
// same protocol as SQLite and works on Bun (better-sqlite3 does not).
const adapter = new PrismaLibSql({ url: config.databaseUrl });

// Single shared PrismaClient — reuse one instance for the whole app
const prisma = new PrismaClient({ adapter });

export default prisma;
