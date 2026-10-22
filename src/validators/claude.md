# Validators

## Purpose
Zod validation schemas for request data. These are the single source of truth for what valid input looks like.

## Key Files
- **authValidator.ts** — Schemas for auth endpoints:
  - `registerSchema` — name (1–80 chars), email (trimmed, lowercased, validated), password (8–100 chars), role (defaults to `"user"`).
  - `loginSchema` — email + password.
  - Exports inferred types: `RegisterDto`, `LoginDto`.
- **userValidator.ts** — Schemas for user CRUD:
  - `createUserSchema` — name + email.
  - `updateUserSchema` — partial name/email with at-least-one-field refinement.
  - `userIdParamSchema` — Coerces `:id` param to a positive integer.
  - Exports inferred types: `CreateUserDto`, `UpdateUserDto`, `UserIdParam`.

## Conventions
- Every schema uses `.trim()` on string inputs before validation.
- Emails are normalized to lowercase (`.toLowerCase()`) for case-insensitive uniqueness.
- Inferred DTO types (`z.infer<typeof schema>`) are exported and used in controllers and services — never define input shapes manually.
- Schemas are passed to the `validate` middleware in route definitions: `validate({ body: registerSchema })`.
- When adding a new endpoint, create the schema here first, then wire it into the route.
