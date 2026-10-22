# Middlewares

## Purpose
Express middleware functions for cross-cutting concerns: authentication, authorization, validation, logging, and error handling.

## Key Files

### Authentication
- **authenticate.ts** — Unified auth middleware; tries session cookie first, then JWT `Authorization` header. Sets `req.user`, `req.sessionId`, and `req.authMethod`.
- **authenticateSession.ts** — Session-only authentication via `sid` cookie.
- **authenticateJwt.ts** — JWT-only authentication via `Bearer` token.
- **auth.ts** — Re-exports / composes auth middleware variants.
- **socketAuth.ts** — Socket.IO handshake auth middleware; validates JWT (from `auth` query param or `Authorization` header) or session cookie before allowing connection. Sets `socket.data.user` and `socket.data.authMethod`.

### Authorization
- **authorize.ts** — Role-based access control. Factory function `authorize(...roles)` returns middleware that checks `req.user.role`.

### Validation
- **validate.ts** — Generic Zod validation middleware. Validates `req.body`, `req.query`, and/or `req.params` against provided schemas.

### Logging & Error Handling
- **requestLogger.ts** — Morgan HTTP access logger piped through Winston. Uses concise format in dev, Apache combined format in prod.
- **errorHandler.ts** — Global error catcher (4-arg Express middleware). Logs the error via Winston and returns 500.
- **notFound.ts** — 404 fallback for unmatched routes.

## Conventions
- Auth middlewares attach user data to `req.user` (typed via `AuthUser` in `types/auth.ts`).
- The validate middleware accepts a config object `{ body?, query?, params? }` with Zod schemas.
- `errorHandler` must be registered **last** in the middleware chain.
- `notFound` must be registered just **before** `errorHandler`.
