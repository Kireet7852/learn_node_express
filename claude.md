# learn_node_express

## Overview
A learning project for Node.js + Express built with **Bun** as the runtime. Features REST APIs, dual authentication (session-based + JWT), role-based authorization, real-time WebSocket communication via Socket.IO, and structured logging.

## Tech Stack
- **Runtime**: Bun
- **Framework**: Express 5
- **Database**: SQLite via Prisma 7 (LibSQL driver adapter)
- **Auth**: Argon2id password hashing (Bun.password), JWT (jose), server-side sessions
- **Validation**: Zod 4
- **Logging**: Winston + Morgan
- **WebSockets**: Socket.IO 4
- **Language**: TypeScript 7 (ES2022 target, ESM)

## Project Structure
```
├── prisma/            # Schema, migrations, seed script
├── src/
│   ├── config/        # Env validation (Zod)
│   ├── controllers/   # HTTP request handlers
│   ├── db/            # Prisma client singleton
│   ├── generated/     # Auto-generated Prisma client (do not edit)
│   ├── middlewares/   # Auth, validation, logging, error handling
│   ├── repositories/  # Data access layer (Prisma queries)
│   ├── routes/        # Express router definitions
│   ├── services/      # Business logic
│   ├── socket/        # Socket.IO server setup
│   ├── types/         # Shared TypeScript types
│   ├── utils/         # Logger and utilities
│   ├── validators/    # Zod request schemas
│   ├── app.ts         # Express app configuration
│   └── server.ts      # HTTP + WebSocket server startup
├── tests/             # Integration tests (bun:test)
├── prisma.config.ts   # Prisma CLI config (Prisma 7+)
├── tsconfig.json      # TypeScript config
└── package.json       # Scripts and dependencies
```

## Scripts
| Command | Description |
|---|---|
| `bun run dev` | Start dev server with `--watch` |
| `bun run start` | Start production server |
| `bun run build` | Compile TypeScript via `tsc` |
| `bun run typecheck` | Type-check without emitting |
| `bun test` | Run all tests |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run Prisma migrations (dev) |
| `bun run db:deploy` | Deploy migrations (prod) |
| `bun run db:seed` | Seed database with sample users |
| `bun run db:studio` | Open Prisma Studio GUI |

## Architecture Pattern
**Controller → Service → Repository → Prisma**

- **Controllers** handle HTTP concerns (req/res) and delegate to services.
- **Services** contain business logic and orchestrate between repositories.
- **Repositories** are the only layer that touches Prisma directly.
- **Validators** (Zod schemas) run as middleware before controllers.

## Authentication
Two parallel auth strategies, both using the same user model:
1. **Session-based (stateful)** — `sid` HTTP-only cookie → server-side session in DB → revocable logout.
2. **JWT-based (stateless)** — `Authorization: Bearer <token>` → signed with `JWT_SECRET` via HMAC (jose).
3. **Unified `/auth/me`** — Accepts either method via the `authenticate` middleware.

## Environment Variables
See `.env.example`. Required: `DATABASE_URL`, `JWT_SECRET`. Optional: `PORT`, `NODE_ENV`, `CORS_ORIGIN`, `LOG_LEVEL`.

## Seed Users
After running `bun run db:seed`:
- `ada@example.com` / `password123` — **admin** role
- `grace@example.com` / `password123` — user role
- `alan@example.com` / `password123` — user role
