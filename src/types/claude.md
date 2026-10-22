# Types

## Purpose
Shared TypeScript type definitions and module augmentations used across the application.

## Key Files
- **auth.ts** — Core auth types:
  - `UserRole` — `"user" | "admin"` union (extensible via string intersection).
  - `AuthUser` — Sanitized user object (no password hash) used throughout the app.
  - `AuthTokenPayload` — JWT payload shape extending `JWTPayload` from `jose`.
  - **Express module augmentation** — Extends `Express.Request` with `user?: AuthUser`, `sessionId?: string`, and `authMethod?: "session" | "jwt"`.
- **socket.ts** — Socket.IO event type definitions:
  - `SocketData` — Data attached to each socket (user, sessionId, authMethod).
  - `ServerToClientEvents` — Events the server can emit (connection success, echo response, broadcast, room events, notifications, errors).
  - `ClientToServerEvents` — Events the client can emit (echo, broadcast, room operations).
  - `InterServerEvents` — Inter-server communication events (ping).

## Conventions
- All shared types live here — not inline in controllers or services.
- The Express global augmentation in `auth.ts` ensures `req.user` is typed everywhere without explicit casting.
- Socket event interfaces enforce type safety for both client and server payloads.
- When adding new properties to `req`, extend the `Express.Request` interface in `auth.ts`.
