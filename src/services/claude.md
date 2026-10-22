# Services

## Purpose
Business logic layer. Services orchestrate between repositories, handle domain rules, and are called by controllers.

## Key Files
- **authService.ts** — User registration (Argon2id hashing via `Bun.password`), credential verification, access token and session validation. Exports `sanitizeUser` to strip sensitive fields.
- **sessionService.ts** — Session lifecycle: create (with crypto-random token), validate (check expiry), revoke, and cleanup expired sessions.
- **tokenService.ts** — JWT token generation and verification using `jose` library.
- **userService.ts** — User CRUD business logic (wraps repository calls).
- **echoService.ts** — Simple echo service.
- **healthService.ts** — Health check response.

## Conventions
- Services **never** import Express types (`Request`, `Response`). They receive plain DTOs and return plain objects.
- Services call repositories for data access — never import `prisma` directly.
- Password hashing uses `Bun.password.hash` with Argon2id (`memoryCost: 65536`, `timeCost: 2`).
- The `sanitizeUser` function must be used whenever returning user data to strip `passwordHash`.
- Use structured logging at appropriate levels (info for mutations, debug for reads, warn for failed lookups).

## Auth Flow Summary
1. **Register** → hash password → `userRepo.createUser` → return sanitized user
2. **Session Login** → `verifyCredentials` → `sessionService.createSession` → set cookie
3. **JWT Login** → `verifyCredentials` → `tokenService.generateToken` → return token
4. **Session Validate** → `sessionRepo.findSessionById` → check expiry → return user
5. **JWT Validate** → `jose.jwtVerify` → decode payload → return user
