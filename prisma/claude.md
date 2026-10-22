# Prisma

## Purpose
Database schema definition, migrations, and seed data. This is the single source of truth for the database structure.

## Key Files
- **schema.prisma** — Defines the data models, datasource (SQLite), and generator (outputs to `src/generated/prisma`).
- **seed.ts** — Idempotent seed script that upserts sample users with hashed passwords. Run via `bun run db:seed`.
- **migrations/** — Auto-generated migration SQL files managed by `prisma migrate`.

## Models
### User
| Field | Type | Notes |
|---|---|---|
| `id` | Int (autoincrement) | Primary key |
| `name` | String | |
| `email` | String (unique) | |
| `passwordHash` | String | Argon2id hash, mapped to `password_hash` column, defaults to `""` |
| `role` | String | `"user"` or `"admin"`, validated in app code (SQLite has no enums) |
| `sessions` | Session[] | Relation |
| `createdAt` | DateTime | Auto-set, mapped to `created_at` |

Table name: `users`

### Session
| Field | Type | Notes |
|---|---|---|
| `id` | String | Primary key — random 64-hex token generated in app code |
| `userId` | Int | FK to User, mapped to `user_id`, cascading delete |
| `expiresAt` | DateTime | Mapped to `expires_at` |
| `createdAt` | DateTime | Auto-set, mapped to `created_at` |

Table name: `sessions`, indexed on `userId`

## Configuration
- **prisma.config.ts** (project root) — Prisma 7+ CLI configuration. Points to this schema, sets migration path, and configures the seed command (`bun run prisma/seed.ts`).
- **Generator** — Outputs to `../src/generated/prisma` with `runtime = "bun"`.
- **Datasource** — SQLite provider. Connection URL comes from `DATABASE_URL` env var.

## Conventions
- Column names use `snake_case` via `@map()` while Prisma model fields use `camelCase`.
- Roles are stored as plain strings (no SQLite enum) — validated by Zod schemas in the app layer.
- The seed script uses `upsert` so it's safe to re-run without duplicates.
- Always run `bun run db:generate` after schema changes (also runs automatically on `postinstall`).

## Common Commands
```bash
bun run db:migrate    # Create + apply a new migration
bun run db:generate   # Regenerate the Prisma client
bun run db:seed       # Seed sample users
bun run db:studio     # Open Prisma Studio
bun run db:deploy     # Apply migrations in production
```
