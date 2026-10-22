# Config

## Purpose
Environment configuration and validation. All app settings flow from here.

## Key Files
- **env.ts** — Loads `.env` via `dotenv`, validates with a Zod schema, and exports a typed `config` object.

## Conventions
- Every env var **must** be declared in the `envSchema` before use.
- The parsed config object is exported as `const` — never mutate it at runtime.
- Required secrets (e.g. `JWT_SECRET`) have no defaults and will crash the process at startup if missing.
- `CORS_ORIGIN` supports both a single origin string and comma-separated lists.
- `LOG_LEVEL` defaults based on `NODE_ENV` (`debug` in dev, `info` in prod).

## Dependencies
- `dotenv` — load `.env` file
- `zod` — schema validation
