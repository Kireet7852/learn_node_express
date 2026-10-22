# Database

## Purpose
Prisma client instantiation and database connection management.

## Key Files
- **client.ts** — Creates and exports a singleton `PrismaClient` instance using the LibSQL driver adapter (SQLite-compatible, works with Bun).

## Conventions
- **Single instance** — Import `prisma` from this module everywhere; never create additional `PrismaClient` instances.
- The data directory is auto-created on startup (`mkdirSync` with `recursive: true`).
- Connection URL comes from `config.databaseUrl` (must be a `file:` SQLite URL).
- Uses `@prisma/adapter-libsql` instead of `better-sqlite3` for Bun compatibility (Prisma 7 driver adapter pattern).

## Dependencies
- `@prisma/adapter-libsql` — SQLite driver adapter
- Generated Prisma client from `../generated/prisma/client.js`
