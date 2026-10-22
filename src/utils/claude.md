# Utils

## Purpose
Shared utility modules used across the application.

## Key Files
- **logger.ts** — Winston logger configured per environment:
  - **Development** — Colorized, human-readable format with timestamps.
  - **Production** — Structured JSON format for log aggregation.
  - **Test** — Silent by default (unless `LOG_LEVEL` env var is explicitly set).
  - Exports `morganStream` adapter to pipe Morgan HTTP logs into Winston at `http` level.

## Conventions
- Import `logger` (named export) or `default` from this module — never create separate Winston instances.
- Log levels follow Winston defaults: `error` → `warn` → `info` → `http` → `verbose` → `debug` → `silly`.
- The configured log level comes from `config.logLevel` (see `config/env.ts`).
- Use `logger.error` for unexpected failures (with stack trace), `logger.warn` for expected failures (bad credentials, not found), `logger.info` for significant events (user created, login), `logger.debug` for routine operations.
