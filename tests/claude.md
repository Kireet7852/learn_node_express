# Tests

## Purpose
Integration tests for the application. Tests run against a real server instance with a real SQLite database.

## Test Runner
**Bun's built-in test runner** (`bun:test`). Run all tests with `bun test`.

## Key Files

### auth.test.ts
End-to-end authentication and authorization tests covering:
- **Registration** — Success and duplicate email rejection (409).
- **Session auth** — Login (sets `sid` cookie), `/session/me` via cookie and `X-Session-Id` header, logout (invalidates session in DB).
- **JWT auth** — Login (returns Bearer token), `/jwt/me` with `Authorization` header, rejection of tampered tokens.
- **Unified `/auth/me`** — Accepts both JWT and session cookie.
- **Role-based authorization** — Admin-only endpoint (403 for regular users, 200 for admin), ownership-based PATCH/DELETE on `/users/:id`.

### websocket.test.ts
Socket.IO real-time messaging tests covering:
- **Handshake auth** — Rejection without auth, with invalid JWT, with non-existent session. Successful connection via JWT (`auth.token`), Bearer header, session ID (`auth.sessionId`), and `sid` cookie.
- **Echo** — Send `echo` event, receive `echo:response` with timestamp.
- **Broadcast** — Multi-client broadcast delivery verification.
- **Rooms** — Join/leave rooms, room message isolation (non-members don't receive messages), system notifications on join/leave.
- **HTTP endpoints** — `GET /ws/info` metadata, `GET /ws-demo` HTML playground.

### logger.test.ts
Winston logger and logging middleware tests:
- Logger instance exports the expected methods (`info`, `error`, `warn`, `http`, `debug`).
- `morganStream` pipes messages to `logger.http`.
- `requestLogger` middleware passes requests through Morgan.
- `errorHandler` logs errors via `logger.error` and returns 500.

## Test Patterns
- **Server setup**: Each test file starts its own HTTP server on port `0` (random available port) in `beforeAll`, and cleans up in `afterAll`.
- **Database**: Tests use the real database (no mocking). Test users are created with unique timestamp-based emails to avoid conflicts.
- **Auth in tests**: Tests obtain tokens/sessions by calling the actual login endpoints, not by mocking auth.
- **Socket.IO clients**: Created with `socket.io-client` using WebSocket transport, `forceNew`, and `reconnection: false`.
- **Cleanup**: `prisma.$disconnect()`, `server.close()`, and `closeSocketServer()` in `afterAll`.

## Conventions
- Use `describe` blocks to group related tests.
- Use unique emails per test run (`test_${Date.now()}@example.com`) to prevent conflicts across runs.
- Cast response JSON as `any` for assertion flexibility.
- Admin tests rely on the seeded `ada@example.com` user (run `bun run db:seed` before testing).
