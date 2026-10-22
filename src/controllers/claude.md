# Controllers

## Purpose
HTTP request handlers. Each controller receives a validated request, delegates to services, and sends the response.

## Key Files
- **authController.ts** — Registration, session login/logout, JWT login, `/me` and `/admin` endpoints.
- **userController.ts** — CRUD operations for users.
- **echoController.ts** — Simple echo endpoint for testing.
- **healthController.ts** — Health check endpoint.
- **rootController.ts** — Root `/` handler.
- **wsDemoController.ts** — Serves the WebSocket demo HTML page.

## Conventions
- Controllers **never** access Prisma or the database directly — always go through services.
- All handlers have the signature `(req: Request, res: Response) => Promise<void>`.
- Request body types come from validator DTOs (e.g. `RegisterDto`, `LoginDto`).
- Use `logger` for structured logging (info for success, warn for client errors, debug for access tracking).
- Throw errors to let the global `errorHandler` middleware catch them; only handle domain-specific errors (e.g. P2002 duplicate) inline.

## Auth Patterns
- **Session-based** — `sessionLogin` sets an HTTP-only `sid` cookie; `sessionLogout` clears it.
- **JWT-based** — `jwtLogin` returns a Bearer token in the response body.
- **Unified** — `getMe` and `adminOnly` accept either auth method via the `authenticate` middleware.
