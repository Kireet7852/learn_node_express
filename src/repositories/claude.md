# Repositories

## Purpose
Data access layer. All direct Prisma queries live here, providing a clean abstraction between services and the database.

## Key Files
- **userRepository.ts** — CRUD operations for the `User` model: `findAllUsers`, `findUserById`, `findUserByEmail`, `createUser`, `updateUser`, `deleteUser`.
- **sessionRepository.ts** — Session persistence: `createSession`, `findSessionById` (with user include), `deleteSession`, `deleteSessionsByUserId`, `deleteExpiredSessions`.

## Conventions
- Repositories are the **only** layer that imports `prisma` from `db/client.ts`.
- Every function is `async` and returns Prisma model types directly.
- Input types use Prisma-generated types (e.g. `Prisma.UserCreateInput`) or custom interfaces.
- Use `deleteMany` instead of `delete` when the record may not exist (avoids throwing on missing rows).
- Add structured logging at `debug` level for all queries.

## Adding a New Repository
1. Create `<model>Repository.ts` in this folder.
2. Import `prisma` from `../db/client.js`.
3. Export async functions for each query needed by the service layer.
4. Keep queries simple — complex business logic belongs in services.
